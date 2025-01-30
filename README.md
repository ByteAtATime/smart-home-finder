# Smart Home Finder

This project is a smart device finder application. I took inspiration from PCPartPicker, so this program can track prices off different sellers, filter by properties (e.g. bulb brightness), sort by price, and more.

**The problem it solves**: Let's say my smart home is configured to use the Zigbee protocol. I wanted some simple way to find a list of, say, smart bulbs that are compatible with Zigbee. It would be handy to also find lightbulbs brighter than 1200 lumens, but less than 1600 lumens. Finally, it would be nice to sort by price, cheapest first.

From this set of requirements the first website that comes to mind is PCPartPicker. This website ~~steals~~ takes inspiration from lots of ideas, including most of the features below.

## Key Features:

- Responsive device table with filtering and sorting capabilities.
- Device detail pages with images, variants, prices, and properties.
- Admin dashboard for managing devices, listings, and properties.
- Authentication powered by Clerk.
- Real-time price updates streamed from the backend.

## Tech Stack:

- SvelteKit for the framework.
- Tailwind CSS for styling.
- Drizzle ORM for database interactions.
- Clerk for user authentication.
- PostHog for analytics.
- SvelteKit Superforms for form handling.
- Various UI components from `bits-ui` and `shadcn-svelte`.

### Scraper

The scraper package is responsible for fetching device prices and availability from various online retailers.

#### Key Features:

- Continuous scraping at configurable intervals.
- Rate limiting and concurrency control to prevent overloading target websites.
- Retry logic with exponential backoff for robust error handling.
- Modular scraper registry for easy addition of new retailers.
- Atomic price updates using database transactions.

#### Tech Stack:

- Playwright for web scraping.
- Drizzle ORM for database interactions.
- Node.js with TypeScript.

### Common

The common package contains shared code, including:

- Database schema definitions using Drizzle ORM.
- Type definitions for shared data structures.
- Constants for device types, protocols, etc.

## Configuration

The project uses environment variables for configuration. An example `.env` file is provided in `./.env.example`.

## Development

To start the development server, run:

```bash
pnpm dev
```

### Database Setup

The project uses PostgreSQL as the database. You can quickly set up a local database using Docker:

```bash
docker compose up -d
```

### Database Migrations and Seeding

To apply database migrations:

```bash
pnpm db:migrate
```

To seed the database with initial data:

```bash
pnpm db:seed
```

### Linting and Formatting

The project uses ESLint and Prettier for code linting and formatting. To lint and format the code:

```bash
pnpm lint
pnpm format
```

### Testing

The project includes unit tests with Vitest and end-to-end tests with Playwright.

To run unit tests:

```bash
pnpm test:unit
```

To run end-to-end tests:

```bash
pnpm test:e2e
```

To run all tests:

```bash
pnpm test
```

## Building for Production

To create a production build:

```bash
pnpm build
```

## Previewing the Build

To preview the production build locally:

```bash
pnpm preview
```

## Deployment

The project is configured for deployment on Vercel using the `@sveltejs/adapter-vercel` adapter.

## License

This project is open source and available under the [MIT License](LICENSE).
