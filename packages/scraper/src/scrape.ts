import { chromium } from 'playwright';
import { inovelliScraper } from './scrapers/inovelli';
import { Scraper } from './scrapers/types';
import { db } from './db';
import { deviceListingsTable } from '@smart-home-finder/common/schema';
import { updatePrice } from './updatePrice';

const sellerToScraper: Map<number, Scraper> = new Map([[2, inovelliScraper]]);

async function main() {
	const deviceListings = await db.select().from(deviceListingsTable);

	const browser = await chromium.launch();
	const context = await browser.newContext();

	for (const listing of deviceListings) {
		const scraper = sellerToScraper.get(listing.sellerId);
		if (!scraper) {
			console.error(`No scraper found for seller ${listing.sellerId}`);
			continue;
		}

		const page = await context.newPage();
		await page.goto(listing.url);
		const price = await scraper(page);

		console.log(`Found price ${price} for ${listing.url}`);

		await updatePrice({
			listingId: listing.id,
			price,
			inStock: true
		});
	}

	await browser.close();
}

main();
