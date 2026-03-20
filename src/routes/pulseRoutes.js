import express from "express";
import { getLatestPrices, getPriceByRunId } from "../storage/sqlStore.js";
import { getNewsByRunId, getLatestNews } from "../storage/noSqlStore.js";

export const pulseRouter = express.Router();

// Latest 5 price records each with their news context
pulseRouter.get("/pulse", async (req, res) => {
  try {
    const prices = getLatestPrices(5);

    // for each price record, fetch its matching news from MongoDB
    const pulse = await Promise.all(
      prices.map(async (price) => ({
        runId: price.run_id,
        asset: price.asset.toUpperCase(),
        price: price.price,
        currency: price.currency.toUpperCase(),
        timestamp: price.timestamp,
        news: await getNewsByRunId(price.run_id),
      })),
    );

    res.status(200).json({
      success: true,
      count: pulse.length,
      data: pulse,
    });
  } catch (err) {
    console.error("/api/pulse error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Single pulse report for a specific runId
pulseRouter.get("/pulse/:runId", async (req, res) => {
  try {
    const { runId } = req.params;

    const price = getPriceByRunId(runId);

    if (!price) {
      return res.status(404).json({
        success: false,
        message: `No price record found for runId: ${runId}`,
      });
    }

    const news = await getNewsByRunId(runId);

    res.status(200).json({
      success: true,
      data: {
        runId,
        asset: price.asset.toUpperCase(),
        price: price.price,
        currency: price.currency.toUpperCase(),
        timestamp: price.timestamp,
        news,
      },
    });
  } catch (err) {
    console.error("/api/pulse/:runId error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// All historical price records from SQLite only
pulseRouter.get("/prices", (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const prices = getLatestPrices(limit);

    res.status(200).json({
      success: true,
      count: prices.length,
      data: prices,
    });
  } catch (err) {
    console.error("/api/prices error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Latest news headlines from MongoDB only
pulseRouter.get("/news", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const news = await getLatestNews(limit);

    res.status(200).json({
      success: true,
      count: news.length,
      data: news,
    });
  } catch (err) {
    console.error("/api/news error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});
