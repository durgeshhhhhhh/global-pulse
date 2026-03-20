// config.js
import "dotenv/config"; // ← cleaner way to load .env with ES modules

export const asset = "bitcoin";
export const assetSymbol = "BTC";
export const currency = "usd";

export const newsSource = {
  name: "CoinDesk",
  rssUrl: "https://www.coindesk.com/arc/outboundfeeds/rss/",
};

export const maxHeadlines = 3;

export const sqlDbPath = "./data/prices.db";

export const cronSchedule = '*/5 * * * *';