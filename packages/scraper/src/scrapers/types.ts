import { Page } from 'playwright';

export type Scraper = (page: Page, metadata: Record<string, unknown>) => Promise<number>;
