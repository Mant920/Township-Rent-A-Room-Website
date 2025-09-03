// routes/setup.js
import express from "express";
import * as db from "../../database/index.js";


const router = express.Router();

// GET /api/setup
router.get("/", async (_req, res) => {
  try {
    await db.createUsersTable();
    await db.createRoomsTable();
    await db.createRoomFeaturesTable();
    await db.createRoomImagesTable();

    res.status(200).json({
      success: true,
      message: "All tables created successfully.",
    });
  } catch (err) {
    console.error("Error creating tables:", err);
    res.status(500).json({
      success: false,
      message: "Error creating tables.",
      error: err.message,
    });
  }
});

export default router;
