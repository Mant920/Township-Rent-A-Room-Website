// routes/rooms.js
import express from "express";
import * as db from "../../database/index.js";

const router = express.Router();

// POST /api/rooms
router.post("/", async (req, res) => {
  const result = await db.addRoom(req.body);
  res.status(result.success ? 201 : 400).json(result);
});

// GET /api/rooms/:id
router.get("/:id", async (req, res) => {
  const result = await db.getRoomById(req.params.id);
  res.status(result.success ? 200 : 404).json(result);
});

// GET /api/rooms/owner/:uniqueCode
router.get("/owner/:uniqueCode", async (req, res) => {
  const result = await db.getAllRoomsByOwner(req.params.uniqueCode);
  res.status(result.success ? 200 : 404).json(result);
});

// GET /api/rooms/available
router.get("/", async (_req, res) => {
  const result = await db.getAvailableRooms();
  res.status(result.success ? 200 : 404).json(result);
});

// PUT /api/rooms/:id
router.put("/:id", async (req, res) => {
  const result = await db.updateRoomById(req.params.id, req.body);
  res.status(result.success ? 200 : 400).json(result);
});

// DELETE /api/rooms/:id
router.delete("/:id", async (req, res) => {
  const result = await db.deleteRoomById(req.params.id);
  res.status(result.success ? 200 : 404).json(result);
});

// POST /api/rooms/search
router.post("/search", async (req, res) => {
  const result = await db.searchRooms(req.body);
  res.status(result.success ? 200 : 400).json(result);
});

export default router;
