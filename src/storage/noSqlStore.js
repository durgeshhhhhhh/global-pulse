import NewsHeadline from "../models/newsHeadline.js";

export async function insertHeadlines(headlines) {
  const result = await NewsHeadline.insertMany(headlines);
  console.log(`${result.length} headlines saved to MongoDB`);
}

export async function getNewsByRunId(runId) {
  return await NewsHeadline.find({ runId });
}

export async function getLatestNews(limit = 5) {
  return await NewsHeadline.find()
    .sort({ fetchedAt: -1 })
    .limit(limit);
}
