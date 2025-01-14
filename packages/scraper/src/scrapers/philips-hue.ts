import { Scraper } from './types';

export const philipsHueScraper: Scraper = async (page) => {
	const price = await page
		.locator(
			'#overview > div.section-component__container.container.spacing-responsive-2--padding > div > div > div > div:nth-child(5) > div > div.col-12.col-sm-4 > div.purchase-container.product-detail-v2__purchase > div > div.purchase__info-wrapper > div.price.purchase__price.price--lg > p:not(.price__label--original)'
		)
		.textContent();

	if (!price) {
		throw new Error('Price not found');
	}

	return Number(price.replace('$', '').replace(',', ''));
};
