# 🌐 Global Pulse — Fintech Data Ingestion System

A real-time data pipeline that correlates **BTC market prices** (Hard Data)
with **financial news headlines** (Soft Data) into a unified, queryable system.

## System Architecture

\```
┌─────────────────────────────────────────────┐
│              INGESTION LAYER                 │
│                                             │
│  CoinGecko API        CoinDesk RSS Feed     │
│  (BTC Price)          (News Headlines)      │
│       │                      │              │
│       └────── Promise.all ───┘              │
│                    │                        │
│           pipeline.js (node-cron)           │
│           runs every 5 minutes              │
└────────────────────┬────────────────────────┘
                     │
┌────────────────────▼────────────────────────┐
│            HYBRID STORAGE LAYER             │
│                                             │
│  SQLite                  MongoDB Atlas      │
│  price_records           news_headlines     │
│  - run_id ───────────── runId               │
│  - price                 - title            │
│  - timestamp             - url              │
│                          - source           │
└────────────────────┬────────────────────────┘
                     │
┌────────────────────▼────────────────────────┐
│              OUTPUT LAYER                   │
│                                             │
│  Express API          CLI Report            │
│  /api/pulse           npm run report        │
└─────────────────────────────────────────────┘
\```

## Database Design Decisions

### Why SQLite for Prices?
Price data is structured and consistent — every record has
the exact same fields every time. SQLite gives us:
- REAL type for full decimal precision (critical in fintech)
- Indexed timestamps for fast historical queries
- UNIQUE constraint on run_id to prevent duplicates
- Zero setup — runs anywhere without a server

### Why MongoDB for News?
News data varies by source — different sources may include
summaries, images, authors or not. MongoDB gives us:
- Flexible schema — any news source fits without breaking
- Native JSON storage — no transformation needed
- Simple querying by runId to fetch correlated headlines

### The System Link — runId
Every pipeline run generates a UUID (runId).
This ID is saved in both databases:
- SQLite price record stores the runId
- Every MongoDB news document stores the same runId

This lets you query:
"Give me the BTC price at 2:30pm AND the news at that exact moment"

## Project Structure

\```
global-pulse/
├── src/
│   ├── config/
│   │   └── database.js        # MongoDB connection
│   ├── ingestion/
│   │   ├── priceFetcher.js    # CoinGecko API
│   │   └── newsScraper.js     # CoinDesk RSS scraper
│   ├── models/
│   │   └── newsHeadline.js    # Mongoose schema
│   ├── storage/
│   │   ├── sqlStore.js        # SQLite operations
│   │   └── noSqlStore.js      # MongoDB operations
│   ├── routes/
│   │   └── pulseRoutes.js     # Express API endpoints
│   ├── pipeline.js            # Orchestrator + scheduler
│   └── pulseReport.js         # CLI dashboard
├── server.js                  # Express entry point
├── config.js                  # Central configuration
├── .env.example
└── package.json
\```

## Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier)

### 1. Clone the repository
\```bash
git clone https://github.com/durgeshhhhhhhh/global-pulse.git
cd global-pulse
\```

### 2. Install dependencies
\```bash
npm install
\```

### 3. Configure environment
\```bash
cp .env.example .env
\```
Fill in your MongoDB Atlas connection string in `.env`:
\```
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/global_pulse
PORT=3000
\```

### 4. Create data directory
\```bash
mkdir data
\```

## Running the System

### Terminal 1 — Start the data pipeline
Fetches BTC price + news every 5 minutes:
\```bash
npm run pipeline
\```

### Terminal 2 — Start the API server
\```bash
npm start
\```

### Generate CLI Pulse Report (any terminal)
\```bash
npm run report
\```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/pulse` | Latest price records with correlated news |
| GET | `/api/pulse/:runId` | Single pulse report by runId |
| GET | `/api/prices` | Historical price records from SQLite |
| GET | `/api/news` | Latest headlines from MongoDB |

## Tech Stack

| Technology | Purpose |
|---|---|
| Node.js | Runtime |
| Express | REST API server |
| axios | HTTP requests to CoinGecko |
| rss-parser | RSS feed parsing |
| better-sqlite3 | SQL price storage |
| Mongoose + MongoDB Atlas | NoSQL news storage |
| node-cron | Task scheduling |
| uuid | RunId generation for system link |
| chalk + cli-table3 | CLI report formatting |
