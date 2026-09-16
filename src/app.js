import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import meetingRoutes from "./routes/meetingRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import morgan from "morgan";

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.status(200).json({
    message: "API is running",
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/meetings", meetingRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
