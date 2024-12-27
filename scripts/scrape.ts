import { chromium } from 'playwright';
import { inovelliScraper } from './scrapers/inovelli';
import { Scraper } from './scrapers/types';
import { db } from './db';
import * as schema from './schema';
import { updatePrice } from './updatePrice';

const sellerToScraper: Map<number, Scraper> = new Map([[1, inovelliScraper]]);

const deviceListings = await db.select().from(schema.deviceListingsTable);

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

	await updatePrice({
		listingId: listing.id,
		price,
		inStock: true
	});
}

await browser.close();
