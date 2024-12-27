import { Page } from 'playwright';

export type Scraper = (page: Page) => Promise<number>;
