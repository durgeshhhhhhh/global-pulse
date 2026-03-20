// src/pipeline.js
import cron from "node-cron";
import { fetchPrice } from "./ingestion/priceFetcher.js";
import { scrapeHeadlines } from "./ingestion/newsScraper.js";
import { initSqlDb, insertPrice } from "./storage/sqlStore.js";
import { insertHeadlines } from "./storage/noSqlStore.js";
import { connectDB } from "./config/database.js";
import { cronSchedule } from "../config.js";

async function runPipeline() {
  console.log(`\nPipeline started at ${new Date().toISOString()}`);

  try {
    const priceData = await fetchPrice();
    console.log(`Price fetched successfully : $${priceData.price} at ${priceData.timestamp}`);

    const [savedPrice, headlines] = await Promise.all([
      insertPrice(priceData),
      scrapeHeadlines(priceData.runId),
    ]);

    await insertHeadlines(headlines);

    console.log(`Pipeline complete for runId: ${priceData.runId}`);
  } catch (err) {
    console.error("Pipeline failed:", err.message);
  }
}

async function startPipeline() {
  initSqlDb();

  await connectDB();
  console.log("MongoDB connected Successfully...");

  await runPipeline();

  cron.schedule(cronSchedule, async () => {
    await runPipeline();
  });

  console.log(`Scheduler running on ${cronSchedule}`);
}

startPipeline();
