export const queries = {
  createUsersTable: `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      unique_code VARCHAR(20) UNIQUE NOT NULL
    );`,

  createRoomsTable: `
    CREATE TABLE IF NOT EXISTS rooms (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      location VARCHAR(255),
      contact VARCHAR(50) NOT NULL,
      extension VARCHAR(50),
      rent_amount NUMERIC(10, 2) NOT NULL,
      parking BOOLEAN DEFAULT false,
      availability BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,

  createRoomFeaturesTable: `
    CREATE TABLE IF NOT EXISTS room_features (
      id SERIAL PRIMARY KEY,
      room_id INT REFERENCES rooms(id) ON DELETE CASCADE,
      feature_name VARCHAR(100) NOT NULL
    );`,

  createRoomImagesTable: `
    CREATE TABLE IF NOT EXISTS room_images (
      id SERIAL PRIMARY KEY,
      room_id INT REFERENCES rooms(id) ON DELETE CASCADE,
      image_url TEXT NOT NULL
    );`,

  insertUser: "INSERT INTO users (unique_code) VALUES ($1) RETURNING id",
  findUserByCode: "SELECT id FROM users WHERE unique_code = $1",
  insertRoom: `
    INSERT INTO rooms
    (user_id, name, location, contact, extension, rent_amount, parking, availability)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id;
  `,
  insertFeature:
    "INSERT INTO room_features (room_id, feature_name) VALUES ($1, $2)",
  insertImage: "INSERT INTO room_images (room_id, image_url) VALUES ($1, $2)",
  deleteRoom: "DELETE FROM rooms WHERE id = $1 RETURNING id",
  getRoomBase: `
    SELECT 
      r.id,
      r.name,
      r.location,
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
  `,
    updateRoom: `
    UPDATE rooms
    SET name = $1,
        location = $2,
        contact = $3,
        extension = $4,
        rent_amount = $5,
        parking = $6,
        availability = $7
    WHERE id = $8
  `,
  deleteFeatures: "DELETE FROM room_features WHERE room_id = $1",
  deleteImages: "DELETE FROM room_images WHERE room_id = $1",
};
