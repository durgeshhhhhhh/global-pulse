import Parser from "rss-parser";
import { newsSource, maxHeadlines } from "../../config.js";

const parser = new Parser();

export async function scrapeHeadlines(runId) {
  const feed = await parser.parseURL(newsSource.rssUrl);

  const headlines = feed.items.slice(0, maxHeadlines).map((item) => ({
    runId,
    title: item.title || "No title",
    url: item.link || "",
    source: newsSource.name,
    publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : null,
    fetchedAt: new Date().toISOString(),
  }));

  return headlines;
}