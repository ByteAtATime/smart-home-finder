import { chromium } from 'playwright';
import { db } from './db';
import { deviceListingsTable } from '@smart-home-finder/common/schema';
import { updatePrice } from './updatePrice';
import { scraperRegistry } from './scrapers/registry';

async function main() {
	const deviceListings = await db.select().from(deviceListingsTable);

	const browser = await chromium.launch();
	const context = await browser.newContext();

	const scrapeTasks = deviceListings.map(async (listing) => {
		const scraper = await scraperRegistry.getScraperForSeller(listing.sellerId);
		if (!scraper) {
			console.error(`No scraper found for seller ${listing.sellerId}`);
			return;
		}

		const page = await context.newPage();
		try {
			await page.goto(listing.url);
			const price = await scraper(page, listing.metadata as Record<string, unknown>);

			console.log(`Found price ${price} for ${listing.url}`);

			await updatePrice({
				listingId: listing.id,
				price,
				inStock: true
			});
		} catch (error) {
			console.error(`Error scraping ${listing.url}:`, error);
		} finally {
			await page.close();
		}
	});

	await Promise.allSettled(scrapeTasks);

	await browser.close();
}

main().catch(console.error);
