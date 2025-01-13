import { chromium } from 'playwright';
import { db } from './db';
import { deviceListingsTable } from '@smart-home-finder/common/schema';
import { updatePrice } from './updatePrice';
import { scraperRegistry } from './scrapers/registry';

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
		console.log(`└─ [${log.endTime}] ❌ Error: ${log.error}\n`);
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
};

async function main() {
	const deviceListings = await db.select().from(deviceListingsTable);
	console.log(`[${timestamp()}] Starting to scrape ${deviceListings.length} listings...\n`);

	const browser = await chromium.launch();
	const context = await browser.newContext();

	const scrapeTasks = deviceListings.map(async (listing) => {
		const log: ScrapeLog = {
			sellerId: listing.sellerId,
			startTime: timestamp(),
			url: listing.url,
			success: false,
			endTime: ''
		};

		const scraper = await scraperRegistry.getScraperForSeller(listing.sellerId);
		if (!scraper) {
			log.endTime = timestamp();
			log.error = 'No scraper found for seller';
			printScrapeLog(log);
			return log;
		}

		const page = await context.newPage();
		try {
			await page.goto(listing.url);
			const price = await scraper(page, listing.metadata as Record<string, unknown>);

			const result = await updatePrice({
				listingId: listing.id,
				price,
				inStock: true
			});

			log.success = true;
			log.price = price;
			log.priceStatus = result.status;
		} catch (error) {
			log.error = error instanceof Error ? error.message : String(error);
		} finally {
			log.endTime = timestamp();
			await page.close();
			printScrapeLog(log);
		}

		return log;
	});

	const results = await Promise.allSettled(scrapeTasks);

	console.log(`[${timestamp()}] Scraping completed!`);

	const successful = results.filter((r) => r.status === 'fulfilled' && r.value.success).length;
	const failed = deviceListings.length - successful;
	console.log(`✅ Successfully scraped: ${successful}`);
	console.log(`❌ Failed to scrape: ${failed}`);

	await browser.close();
}

main().catch(console.error);
