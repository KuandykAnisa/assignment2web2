# Random User Aggregator

Server-side aggregator combining RandomUser, REST Countries, Exchange rates and News APIs.

Requirements met:
- Server runs on port 3000 (default)
- All external API logic implemented in `server.js`
- Frontend displays aggregated data (cards, images, labeled fields)

Setup
1. Clone repository or unzip into a folder.
2. Create `.env` in project root with required API keys (see below).
3. Install dependencies:

```bash
npm install
```

4. Start server:

```bash
npm start
```

Env variables
- `REST_COUNTRIES_API_KEY` - (optional) API key for REST Countries (stored in env per requirement)
- `NEWS_API_KEY` - (optional) API key for NewsAPI.org to fetch headlines
- `EXCHANGE_API_KEY` - (optional) API key for exchangerate-api.com. If not present, server falls back to exchangerate.host (no key required).

Example `.env` (do not commit your real keys):

```
REST_COUNTRIES_API_KEY=your_rest_countries_key
NEWS_API_KEY=your_news_api_key
EXCHANGE_API_KEY=your_exchange_key
```

Usage
Open http://localhost:3000 and click "Get Random User". The server fetches data from RandomUser API, then uses the user's country to query REST Countries and exchange rates, and fetches up to 5 news headlines mentioning the country.

Notes
- All third-party requests occur on the server side; the frontend only requests `/api/random-user`.
- The server filters and returns only relevant, cleaned fields for the frontend.
