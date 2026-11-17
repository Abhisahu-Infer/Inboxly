import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import auth from "./routes/auth.js";
import api from "./routes/api.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", auth);
app.use("/api", api);
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Server error" });
});

await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/inboxly");
const port = process.env.PORT || 5000;
app.listen(port, () => console.log("Inboxly API running on port " + port));
