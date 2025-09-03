import pool from "./database-configs.js";

export async function runQuery(query, params = []) {
  try {
    const result = await pool.query(query, params);
    return result;
  } catch (err) {
    console.error("DB Error:", err);
    throw err;
  }
}
