import { chromium, BrowserContext, Page, Browser } from 'playwright';
import { db } from './db';
import { deviceListingsTable } from '@smart-home-finder/common/schema';
import { updatePrice } from './updatePrice';
import { scraperRegistry } from './scrapers/registry';

// Configuration
const SCRAPE_INTERVAL = parseInt(process.env.SCRAPE_INTERVAL_MS ?? '600000', 10); // Default 10 minutes
const PAGE_TIMEOUT = parseInt(process.env.PAGE_TIMEOUT_MS ?? '60000', 10); // Default 1 minute
const MAX_RETRIES = parseInt(process.env.MAX_RETRIES ?? '3', 10);
const RETRY_DELAY = parseInt(process.env.RETRY_DELAY_MS ?? '5000', 10);
const MAX_CONCURRENT_SCRAPES = parseInt(process.env.MAX_CONCURRENT_SCRAPES ?? '5', 10); // Default 5 threads
const CONTEXT_LIFETIME_MS = parseInt(process.env.CONTEXT_LIFETIME_MS ?? '7200000', 10); // Default 2 hours

function timestamp() {
	return new Date().toISOString();
}

function printScrapeLog(log: ScrapeLog) {
	console.log(`┌─ [${log.sellerId}]`);
	console.log(`├─ [${log.startTime}] 🔄 Scraping ${log.url}`);
	if (log.success) {
		const statusEmoji = log.priceStatus === 'updated' ? '✅' : '📊';
		const statusText = log.priceStatus === 'updated' ? 'Updated' : 'Already up to date';
		console.log(`└─ [${log.endTime}] ${statusEmoji} ${statusText} - $${log.price}\n`);
	} else {
		const retryText = log.retryCount ? ` (Attempt ${log.retryCount}/${MAX_RETRIES})` : '';
		console.log(`└─ [${log.endTime}] ❌ Error${retryText}: ${log.error}\n`);
	}
}

type ScrapeLog = {
	sellerId: number;
	startTime: string;
	endTime: string;
	url: string;
	success: boolean;
	price?: number;
	priceStatus?: 'updated' | 'unchanged';
	error?: string;
	retryCount?: number;
};

class RateLimiter {
	private lastScraped: Map<number, number> = new Map();

	canScrape(listingId: number): boolean {
		const lastTime = this.lastScraped.get(listingId);
		if (!lastTime) return true;

		const now = Date.now();
		return now - lastTime >= SCRAPE_INTERVAL;
	}

	markScraped(listingId: number) {
		this.lastScraped.set(listingId, Date.now());
	}

	getTimeUntilNextScrape(listingId: number): number {
		const lastTime = this.lastScraped.get(listingId);
		if (!lastTime) return 0;

		const now = Date.now();
		const timeLeft = SCRAPE_INTERVAL - (now - lastTime);
		return Math.max(0, timeLeft);
	}
}

class ConcurrencyLimiter {
	private running = 0;
	private queue: (() => void)[] = [];

	constructor(private maxConcurrent: number) {}

	async acquire(): Promise<void> {
		if (this.running < this.maxConcurrent) {
			this.running++;
			return;
		}

		return new Promise<void>((resolve) => {
			this.queue.push(resolve);
		});
	}

	release(): void {
		this.running--;
		const next = this.queue.shift();
		if (next) {
			this.running++;
			next();
		}
	}
}

class ContextManager {
	private context: BrowserContext | null = null;
	private browser: Browser | null = null;
	private lastRotation: number = Date.now();

	constructor(private lifetimeMs: number = CONTEXT_LIFETIME_MS) {}

	async initialize() {
		this.browser = await chromium.launch({
			args: ['--no-sandbox', '--disable-setuid-sandbox']
		});
		await this.rotateContext();
	}

	async getContext(): Promise<BrowserContext> {
		if (!this.context || this.shouldRotate()) {
			await this.rotateContext();
		}
		return this.context!;
	}

	private shouldRotate(): boolean {
		return Date.now() - this.lastRotation >= this.lifetimeMs;
	}

	private async rotateContext() {
		console.log(`[${timestamp()}] Rotating browser context to prevent memory leaks...`);

		// Close old context if it exists
		if (this.context) {
			await this.context.close().catch((err) => {
				console.error('Error closing old context:', err);
			});
		}

		// Create new context
		this.context = await this.browser!.newContext({
			userAgent:
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
		});
		this.lastRotation = Date.now();

		console.log(`[${timestamp()}] Browser context rotated successfully`);
	}

	async cleanup() {
		if (this.context) {
			await this.context.close().catch(() => {});
		}
		if (this.browser) {
			await this.browser.close().catch(() => {});
		}
	}
}

async function setupPage(context: BrowserContext): Promise<Page> {
	const page = await context.newPage();

	// Set default timeout
	page.setDefaultTimeout(PAGE_TIMEOUT);

	// Block unnecessary resources to speed up scraping
	await page.route('**/*', (route) => {
		const request = route.request();
		if (
			request.resourceType() === 'image' ||
			request.resourceType() === 'font' ||
			request.resourceType() === 'media'
		) {
			route.abort();
		} else {
			route.continue();
		}
	});

	return page;
}

async function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function scrapeListing(
	listing: { id: number; sellerId: number; url: string; metadata: unknown },
	context: BrowserContext,
	rateLimiter: RateLimiter,
	retryCount = 0
): Promise<ScrapeLog> {
	if (!rateLimiter.canScrape(listing.id)) {
		const timeLeft = rateLimiter.getTimeUntilNextScrape(listing.id);
		return {
			sellerId: listing.sellerId,
			startTime: timestamp(),
			endTime: timestamp(),
			url: listing.url,
			success: true,
			error: `Skipped due to rate limiting (${Math.ceil(timeLeft / 1000)}s remaining)`
		};
	}

	const log: ScrapeLog = {
		sellerId: listing.sellerId,
		startTime: timestamp(),
		url: listing.url,
		success: false,
		endTime: '',
		retryCount
	};

	const scraper = await scraperRegistry.getScraperForSeller(listing.sellerId);
	if (!scraper) {
		log.endTime = timestamp();
		log.error = 'No scraper found for seller';
		printScrapeLog(log);
		return log;
	}

	let page: Page | undefined;
	try {
		page = await setupPage(context);
		const response = await page.goto(listing.url, { waitUntil: 'domcontentloaded' });

		if (!response?.ok()) {
			throw new Error(`HTTP ${response?.status()}: ${response?.statusText()}`);
		}

		const price = await scraper(page, listing.metadata as Record<string, unknown>);

		const result = await updatePrice({
			listingId: listing.id,
			price,
			inStock: true
		});

		log.success = true;
		log.price = price;
		log.priceStatus = result.status;
		rateLimiter.markScraped(listing.id);
	} catch (error) {
		log.error = error instanceof Error ? error.message : String(error);

		// Retry logic
		if (retryCount < MAX_RETRIES) {
			await delay(RETRY_DELAY);
			return scrapeListing(listing, context, rateLimiter, retryCount + 1);
		}
	} finally {
		log.endTime = timestamp();
		if (page) {
			await page.close().catch(() => {}); // Ignore close errors
		}
		printScrapeLog(log);
	}

	return log;
}

async function main() {
	console.log(`[${timestamp()}] Starting continuous scraper...`);
	console.log(`Configuration:
	- Scrape interval: ${SCRAPE_INTERVAL}ms
	- Page timeout: ${PAGE_TIMEOUT}ms
	- Max retries: ${MAX_RETRIES}
	- Retry delay: ${RETRY_DELAY}ms
	- Max concurrent scrapes: ${MAX_CONCURRENT_SCRAPES}
	- Context lifetime: ${CONTEXT_LIFETIME_MS}ms\n`);

	const contextManager = new ContextManager();
	await contextManager.initialize();

	const rateLimiter = new RateLimiter();
	const concurrencyLimiter = new ConcurrencyLimiter(MAX_CONCURRENT_SCRAPES);

	async function cleanup() {
		console.log('\nShutting down gracefully...');
		await contextManager.cleanup();
		process.exit(0);
	}

	// Handle various termination signals
	process.on('SIGINT', cleanup);
	process.on('SIGTERM', cleanup);
	process.on('uncaughtException', (error) => {
		console.error('Uncaught exception:', error);
		cleanup();
	});

	while (true) {
		try {
			const deviceListings = await db.select().from(deviceListingsTable);
			console.log(`[${timestamp()}] Checking ${deviceListings.length} listings...\n`);

			const context = await contextManager.getContext();
			const scrapeTasks = deviceListings.map(async (listing) => {
				await concurrencyLimiter.acquire();
				try {
					return await scrapeListing(listing, context, rateLimiter);
				} finally {
					concurrencyLimiter.release();
				}
			});

			const results = await Promise.allSettled(scrapeTasks);

			const successful = results.filter(
				(r) => r.status === 'fulfilled' && r.value.success && !r.value.error
			).length;
			const skipped = results.filter(
				(r) =>
					r.status === 'fulfilled' &&
					r.value.success &&
					r.value.error?.startsWith('Skipped due to rate limiting')
			).length;
			const failed = deviceListings.length - successful - skipped;

			console.log(`[${timestamp()}] Scraping round completed!`);
			console.log(`✅ Successfully scraped: ${successful}`);
			console.log(`⏭️  Skipped (rate limited): ${skipped}`);
			console.log(`❌ Failed to scrape: ${failed}\n`);

			// Small delay to prevent excessive CPU usage
			await delay(1000);
		} catch (error) {
			console.error('Error in main loop:', error);
			await delay(5000); // Wait a bit before retrying the main loop
		}
	}
}

main().catch((error) => {
	console.error('Fatal error:', error);
	process.exit(1);
});
