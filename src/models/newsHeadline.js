import mongoose from "mongoose";

const newsHeadlineSchema = new mongoose.Schema({
  runId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  url: {
    type: String,
  },
  source: {
    type: String,
  },
  publishedAt: {
    type: Date,
  },
  fetchedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("NewsHeadline", newsHeadlineSchema);
