import { db } from '../db';
import { sellersTable } from '@smart-home-finder/common/schema';
import { inovelliScraper } from './inovelli';
import { amazonScraper } from './amazon';
import type { Scraper } from './types';
import { eq } from 'drizzle-orm';

export class ScraperRegistry {
	private scrapers: Map<string, Scraper> = new Map([
		['inovelli', inovelliScraper],
		['amazon', amazonScraper]
	]);

	/**
	 * Gets a scraper for a given seller ID
	 * @param sellerId The ID of the seller to get the scraper for
	 * @returns The scraper function for the seller, or undefined if no scraper exists
	 */
	async getScraperForSeller(sellerId: number): Promise<Scraper | undefined> {
		const [seller] = await db
			.select({
				scraperId: sellersTable.scraperId
			})
			.from(sellersTable)
			.where(eq(sellersTable.id, sellerId));

		if (!seller) {
			return undefined;
		}

		return this.scrapers.get(seller.scraperId);
	}

	/**
	 * Registers a new scraper
	 * @param id The ID of the scraper
	 * @param scraper The scraper function
	 */
	registerScraper(id: string, scraper: Scraper): void {
		this.scrapers.set(id, scraper);
	}

	/**
	 * Gets all registered scraper IDs
	 * @returns Array of scraper IDs
	 */
	getRegisteredScraperIds(): string[] {
		return Array.from(this.scrapers.keys());
	}
}

// Export a singleton instance
export const scraperRegistry = new ScraperRegistry();
