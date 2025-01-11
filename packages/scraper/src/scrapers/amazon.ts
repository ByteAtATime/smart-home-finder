import { Scraper } from './types';

export const amazonScraper: Scraper = async (page) => {
	const price = await page
		.locator(
			'#corePriceDisplay_desktop_feature_div > div.a-section.a-spacing-none.aok-align-center.aok-relative > span.a-price.aok-align-center.reinventPricePriceToPayMargin.priceToPay'
		)
		.first()
		.textContent();

	if (!price) {
		throw new Error('Price not found');
	}

	const priceWithoutDollar = price.trim().replace('$', '');

	return parseFloat(priceWithoutDollar);
};
