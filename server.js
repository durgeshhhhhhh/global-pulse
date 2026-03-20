import "dotenv/config";
import express from "express";
import { connectDB } from "./src/config/database.js";
import { pulseRouter } from "./src/routes/pulseRoutes.js";

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use("/api", pulseRouter);

connectDB()
  .then(() => {
    console.log("Connection Established Successfully...");

    app.listen(port, () => {
      console.log("Server is running on port:", port);
    });
  })
  .catch((err) => {
    console.error("Error during connection Established: ", err);
  });
