import { queries } from "./queries.js";
import { runQuery } from "./helpers.js";
import pool from "./database-configs.js";

// Some messages are for future usage
export const roomsMessages = {
  success: {
    create: "Room created successfully.",
    getAll: "Rooms retrieved successfully.",
    getById: "Room retrieved successfully.",
    update: "Room updated successfully.",
    delete: "Room deleted successfully.",
    search: "Rooms search completed successfully.",
  },
  error: {
    create: "Error creating room.",
    getAll: "Error retrieving rooms.",
    getById: "Error retrieving room.",
    update: "Error updating room.",
    delete: "Error deleting room.",
    search: "Error searching rooms.",
    userExist: "User already exists.",
    userNotFound: "User not found.",
    roomNotFound: "Room not found.",
  },
};

export const createRoomsTable = () => runQuery(queries.createRoomsTable);
export const createRoomFeaturesTable = () =>
  runQuery(queries.createRoomFeaturesTable);
export const createRoomImagesTable = () =>
  runQuery(queries.createRoomImagesTable);

export async function addRoom(roomData) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Validate user
    const userRes = await client.query(queries.findUserByCode, [
      roomData.uniqueCode,
    ]);
    if (userRes.rows.length === 0) {
      throw new Error(roomsMessages.error.userNotFound);
    }
    const userId = userRes.rows[0].id;

    // 2. Insert room
    const roomRes = await client.query(queries.insertRoom, [
      userId,
      roomData.name,
      roomData.location,
      roomData.contact,
      roomData.extension,
      roomData.rentAmount,
      roomData.parking,
      roomData.availability,
    ]);
    const roomId = roomRes.rows[0].id;

    // 3. Insert features
    for (let feature of roomData.features || []) {
      await client.query(queries.insertFeature, [roomId, feature]);
    }

    // 4. Insert images
    for (let image of roomData.images || []) {
      await client.query(queries.insertImage, [roomId, image]);
    }

    await client.query("COMMIT");
    return { success: true, message: roomsMessages.success.create, roomId };
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(roomsMessages.error.create, err);
    return {
      success: false,
      message: roomsMessages.error.create,
      error: err.message,
    };
  } finally {
    client.release();
  }
}

export async function getRoomById(roomId) {
  try {
    const query = `
     ${queries.getRoomBase}
     WHERE r.id = $1
     GROUP BY r.id;
    `;
    const result = await pool.query(query, [roomId]);
    if (result.rows.length === 0) {
      return { success: false, message: roomsMessages.error.roomNotFound };
    }

    return {
      success: true,
      message: roomsMessages.success.getById,
      data: result.rows[0],
    };
  } catch (err) {
    console.error(roomsMessages.error.getById, err);
    return {
      success: false,
      message: roomsMessages.error.getById,
      error: err.message,
    };
  }
}

export async function getAllRoomsByOwner(uniqueCode) {
  try {
    const query = `
     ${queries.getRoomBase}
     JOIN users u ON r.user_id = u.id
     WHERE u.unique_code = $1
     GROUP BY r.id
     ORDER BY r.id;
    `;
    const result = await pool.query(query, [uniqueCode]);
    if (result.rows.length === 0) {
      return { success: false, message: roomsMessages.error.userNotFound };
    }

    return {
      success: true,
      message: roomsMessages.success.getAll,
      data: result.rows,
    };
  } catch (err) {
    console.error(roomsMessages.error.getAll, err);

    return {
      success: false,
      message: roomsMessages.error.getAll,
      error: err.message,
    };
  }
}

export async function getAvailableRooms() {
  try {
    const query = `
      ${queries.getRoomBase}
      WHERE r.availability = true
      GROUP BY r.id
      ORDER BY r.id;
    `;

    const result = await pool.query(query);
    if (result.rows.length === 0) {
      return [];
    }

    return {
      success: true,
      message: roomsMessages.success.getAll,
      data: result.rows,
    };
  } catch (err) {
    console.error(roomsMessages.error.getAll, err);
    return {
      success: false,
      message: roomsMessages.error.getAll,
      error: err.message,
    };
  }
}

export async function updateRoomById(roomId, roomData) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Update main room info
    const result = await client.query(queries.updateRoom, [
      roomData.name,
      roomData.location,
      roomData.contact,
      roomData.extension,
      roomData.rentAmount,
      roomData.parking,
      roomData.availability,
      roomId,
    ]);

    if (result.rowCount === 0) {
      return { success: false, message: roomsMessages.error.roomNotFound };
    }

    // 2. Update features: remove old, insert new
    await client.query(queries.deleteFeatures, [roomId]);
    for (let feature of roomData.features) {
      await client.query(queries.insertFeature, [roomId, feature]);
    }

    // 3. Update images: remove old, insert new
    await client.query(queries.deleteImages, [roomId]);
    for (let image of roomData.images) {
      await client.query(queries.insertImage, [roomId, image]);
    }

    await client.query("COMMIT");
    return {
      success: true,
      message: roomsMessages.success.update,
      data: {
        id: roomId,
        ...roomData,
      },
    };
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(roomsMessages.error.update, err);
    return {
      success: false,
      message: roomsMessages.error.update,
      error: err.message,
    };
  } finally {
    client.release();
  }
}

export async function deleteRoomById(roomId) {
  try {
    const result = await pool.query(queries.deleteRoom, [roomId]);

    if (result.rowCount === 0) {
      return { success: false, message: roomsMessages.error.roomNotFound };
    }

    return { success: true, message: roomsMessages.success.delete };
  } catch (err) {
    console.error(roomsMessages.error.delete, err);
    return {
      success: false,
      message: roomsMessages.error.delete,
      error: err.message,
    };
  }
}

export async function searchRooms(filters = {}) {
  try {
    const values = [];
    let conditions = [];

    // Room location filter
    if (filters.location) {
      values.push(`%${filters.location}%`);
      conditions.push(`r.location ILIKE $${values.length}`);
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
      queries.getRoomBase += " WHERE " + conditions.join(" AND ");
    }

    queries.getRoomBase += `
      GROUP BY r.id
      ORDER BY r.id;
    `;

    const result = await pool.query(queries.getRoomBase, values);
    return {
      success: true,
      message: roomsMessages.success.search,
      data: result.rows,
    };
  } catch (err) {
    console.error(roomsMessages.error.search, err);
    return {
      success: false,
      message: roomsMessages.error.search,
      error: err.message,
    };
  }
}
