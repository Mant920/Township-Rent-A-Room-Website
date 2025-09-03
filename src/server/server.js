// server.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import morgan from "morgan";

import setupRoutes from "./routes/setup.js";
import userRoutes from "./routes/users.js";
import roomRoutes from "./routes/rooms.js";

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/setup", setupRoutes);
app.use("/api/users", userRoutes);
app.use("/api/rooms", roomRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
