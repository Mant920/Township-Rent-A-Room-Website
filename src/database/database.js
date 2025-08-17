import pool from "./database-configs.js";

export const queries = {
  createUsersTable: `CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY, 
      unique_code VARCHAR(10) UNIQUE NOT NULL);`,
  createRoomsTable: `
    CREATE TABLE IF NOT EXISTS rooms (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      contact VARCHAR(50) NOT NULL,
      extension VARCHAR(50),
      rent_amount NUMERIC(10, 2) NOT NULL,
      parking BOOLEAN DEFAULT false,
      availability BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,
  createRoomFeaturesTable: `CREATE TABLE IF NOT EXISTS room_features (
    id SERIAL PRIMARY KEY, 
    room_id INT REFERENCES rooms(id) ON DELETE CASCADE, 
    feature_name VARCHAR(100) NOT NULL);`,
  createRoomImagesTable: `CREATE TABLE IF NOT EXISTS room_images (
    id SERIAL PRIMARY KEY, 
    room_id INT REFERENCES rooms(id) ON DELETE CASCADE, 
    image_url TEXT NOT NULL);`,
};

export async function createUsersTable() {
  const query = queries.createUsersTable;

  return pool.query(query);
}

export async function createRoomsTable() {
  const query = queries.createRoomsTable;
  return pool.query(query);
}

export async function createRoomFeaturesTable() {
  const query = queries.createRoomFeaturesTable;
  return pool.query(query);
}

export async function createRoomImagesTable() {
  const query = queries.createRoomImagesTable;
  return pool.query(query);
}

export async function addRoom(roomData) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1 Get user_id from unique code
    const userRes = await client.query(
      "SELECT id FROM users WHERE unique_code = $1",
      [roomData.uniqueCode]
    );

    if (userRes.rows.length === 0) {
      throw new Error("Invalid unique code");
    }

    const userId = userRes.rows[0].id;

    // 2 Insert into rooms table
    const roomRes = await client.query(
      `INSERT INTO rooms 
       (user_id, name, contact, extension, rent_amount, parking, availability) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [
        userId,
        roomData.name,
        roomData.contact,
        roomData.extension,
        roomData.rentAmount,
        roomData.parking,
        roomData.availability,
      ]
    );

    const roomId = roomRes.rows[0].id;

    // 3 Insert features
    for (let feature of roomData.features) {
      await client.query(
        "INSERT INTO room_features (room_id, feature_name) VALUES ($1, $2)",
        [roomId, feature]
      );
    }

    // 4 Insert images
    for (let image of roomData.images) {
      await client.query(
        "INSERT INTO room_images (room_id, image_url) VALUES ($1, $2)",
        [roomId, image]
      );
    }

    await client.query("COMMIT");

    return { success: true, roomId };
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error adding room:", err);
    throw err;
  } finally {
    client.release();
  }
}

export async function getRoomById(roomId) {
  try {
    const query = `
      SELECT 
        r.id,
        r.name,
        r.contact,
        r.extension,
        r.rent_amount,
        r.parking,
        r.availability,
        COALESCE(json_agg(DISTINCT f.feature_name) FILTER (WHERE f.feature_name IS NOT NULL), '[]') AS features,
        COALESCE(json_agg(DISTINCT i.image_url) FILTER (WHERE i.image_url IS NOT NULL), '[]') AS images
      FROM rooms r
      LEFT JOIN room_features f ON r.id = f.room_id
      LEFT JOIN room_images i ON r.id = i.room_id
      WHERE r.id = $1
      GROUP BY r.id;
    `;

    const result = await pool.query(query, [roomId]);
    return result.rows[0] || null;
  } catch (err) {
    console.error("Error fetching room by ID:", err);
    throw err;
  }
}

export async function getAllRoomsByOwner(uniqueCode) {
  try {
    const query = `
      SELECT 
        r.id,
        r.name,
        r.contact,
        r.extension,
        r.rent_amount,
        r.parking,
        r.availability,
        COALESCE(json_agg(DISTINCT f.feature_name) FILTER (WHERE f.feature_name IS NOT NULL), '[]') AS features,
        COALESCE(json_agg(DISTINCT i.image_url) FILTER (WHERE i.image_url IS NOT NULL), '[]') AS images
      FROM rooms r
      JOIN users u ON r.user_id = u.id
      LEFT JOIN room_features f ON r.id = f.room_id
      LEFT JOIN room_images i ON r.id = i.room_id
      WHERE u.unique_code = $1
      GROUP BY r.id
      ORDER BY r.id;
    `;

    const result = await pool.query(query, [uniqueCode]);
    return result.rows;
  } catch (err) {
    console.error("Error fetching rooms:", err);
    throw err;
  }
}

export async function getAvailableRooms() {
  try {
    const query = `
      SELECT 
        r.id,
        r.name,
        r.contact,
        r.extension,
        r.rent_amount,
        r.parking,
        r.availability,
        COALESCE(json_agg(DISTINCT f.feature_name) FILTER (WHERE f.feature_name IS NOT NULL), '[]') AS features,
        COALESCE(json_agg(DISTINCT i.image_url) FILTER (WHERE i.image_url IS NOT NULL), '[]') AS images
      FROM rooms r
      LEFT JOIN room_features f ON r.id = f.room_id
      LEFT JOIN room_images i ON r.id = i.room_id
      WHERE r.availability = true
      GROUP BY r.id
      ORDER BY r.id;
    `;

    const result = await pool.query(query);
    return result.rows;
  } catch (err) {
    console.error("Error fetching available rooms:", err);
    throw err;
  }
}

export async function updateRoomById(roomId, roomData) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1 Update main room info
    await client.query(
      `UPDATE rooms
       SET name = $1,
           contact = $2,
           extension = $3,
           rent_amount = $4,
           parking = $5,
           availability = $6
       WHERE id = $7`,
      [
        roomData.name,
        roomData.contact,
        roomData.extension,
        roomData.rentAmount,
        roomData.parking,
        roomData.availability,
        roomId,
      ]
    );

    // 2 Update features: remove old, insert new
    await client.query("DELETE FROM room_features WHERE room_id = $1", [
      roomId,
    ]);
    for (let feature of roomData.features) {
      await client.query(
        "INSERT INTO room_features (room_id, feature_name) VALUES ($1, $2)",
        [roomId, feature]
      );
    }

    // 3 Update images: remove old, insert new
    await client.query("DELETE FROM room_images WHERE room_id = $1", [roomId]);
    for (let image of roomData.images) {
      await client.query(
        "INSERT INTO room_images (room_id, image_url) VALUES ($1, $2)",
        [roomId, image]
      );
    }

    await client.query("COMMIT");
    return { success: true };
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error updating room:", err);
    throw err;
  } finally {
    client.release();
  }
}

export async function deleteRoomById(roomId) {
  try {
    const result = await pool.query(
      "DELETE FROM rooms WHERE id = $1 RETURNING id",
      [roomId]
    );

    if (result.rowCount === 0) {
      return { success: false, message: "Room not found" };
    }

    return { success: true, message: `Room ${roomId} deleted` };
  } catch (err) {
    console.error("Error deleting room:", err);
    throw err;
  }
}

export async function searchRooms(filters = {}) {
  try {
    const values = [];
    let conditions = [];

    // Room name filter
    if (filters.name) {
      values.push(`%${filters.name}%`);
      conditions.push(`r.name ILIKE $${values.length}`);
    }

    // Rent filters
    if (filters.minRent) {
      values.push(filters.minRent);
      conditions.push(`r.rent_amount >= $${values.length}`);
    }
    if (filters.maxRent) {
      values.push(filters.maxRent);
      conditions.push(`r.rent_amount <= $${values.length}`);
    }

    // Parking filter
    if (filters.parking !== undefined) {
      values.push(filters.parking);
      conditions.push(`r.parking = $${values.length}`);
    }

    // Availability filter
    if (filters.available !== undefined) {
      values.push(filters.available);
      conditions.push(`r.availability = $${values.length}`);
    }

    // Build the base query
    let query = `
      SELECT
        r.id,
        r.name,
        r.contact,
        r.extension,
        r.rent_amount,
        r.parking,
        r.availability,
        COALESCE(json_agg(DISTINCT f.feature_name) FILTER (WHERE f.feature_name IS NOT NULL), '[]') AS features,
        COALESCE(json_agg(DISTINCT i.image_url) FILTER (WHERE i.image_url IS NOT NULL), '[]') AS images
      FROM rooms r
      LEFT JOIN room_features f ON r.id = f.room_id
      LEFT JOIN room_images i ON r.id = i.room_id
    `;

    // Feature filter (requires INNER JOIN if filtering by features)
    if (filters.features && filters.features.length > 0) {
      query += `
        INNER JOIN room_features rf_filter ON r.id = rf_filter.room_id
      `;
      const featureConditions = filters.features.map((feat, idx) => {
        values.push(feat);
        return `$${values.length} = rf_filter.feature_name`;
      });
      conditions.push(`(${featureConditions.join(" OR ")})`);
    }

    // Add WHERE conditions
    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += `
      GROUP BY r.id
      ORDER BY r.id;
    `;

    const result = await pool.query(query, values);
    return result.rows;
  } catch (err) {
    console.error("Error searching rooms:", err);
    throw err;
  }
}
