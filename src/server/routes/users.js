// routes/users.js
import express from "express";
import * as db from "../../database/index.js";

const router = express.Router();

// POST /api/users
router.post("/", async (req, res) => {
  const result = await db.addUser(req.body);
  res.status(result.success ? 201 : 400).json(result);
});

export default router;
