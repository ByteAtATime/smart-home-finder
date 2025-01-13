import { Scraper } from './types';

export const thirdRealityScraper: Scraper = async (page, metadata) => {
	const { variantIndex } = metadata;

	if (variantIndex === undefined || typeof variantIndex !== 'number') {
		throw new Error('Variant index not found');
	}

	const form = page.locator(
		'#content > div > div.elementor.elementor-7233.elementor-location-single.post-6431.product.type-product.status-publish.has-post-thumbnail.product_cat-sensor.product_tag-zigbee.first.instock.sale.featured.shipping-taxable.purchasable.product-type-variable.wvs-archive-product-wrapper.product > div > div.elementor-element.elementor-element-e6180b8.e-flex.e-con-boxed.e-con.e-parent > div > div.elementor-element.elementor-element-833e41d.e-con-full.e-flex.e-con.e-child > div.elementor-element.elementor-element-3279ba1.e-con-full.e-flex.e-con.e-child > div > div > div > form'
	);

	let variantsData: { display_price: number }[] = [];

	try {
		variantsData = JSON.parse((await form.getAttribute('data-product_variations'))!);

		if (
			!variantsData ||
			!Array.isArray(variantsData) ||
			!variantsData.every((variant) => 'display_price' in variant)
		) {
			throw new Error('Invalid variants data');
		}
	} catch (error) {
		console.error('Error parsing variants data', error);
		throw new Error('Error parsing variants data');
	}

	const price = Math.round(variantsData[variantIndex].display_price * 100) / 100;

	if (!price) {
		throw new Error('Price not found');
	}

	return price;
};
