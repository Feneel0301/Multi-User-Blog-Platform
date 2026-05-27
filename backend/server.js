import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDb } from "./config/db.js";

// load environment variable from the .env file
dotenv.config();

// initialize the express application
const app = express();

// connect to db
connectDb();

// essential middlewares
app.use(express.json());
app.use(cors());

// test route
app.get("/", (req, res) => {
  res.send("multi user blog api is running securly");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on ${process.env.NODE_ENV}mode on port ${PORT}`);
});
