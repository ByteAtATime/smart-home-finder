import { Scraper } from './types';

export const inovelliScraper: Scraper = async (page) => {
	const price = await page
		.locator('#Price-template--16981471002789__main-product > div > span')
		.textContent();

	if (!price) {
		throw new Error('Price not found');
	}

	const priceWithoutDollar = price.replace('$', '');

	return parseFloat(priceWithoutDollar);
};
