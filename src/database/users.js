import { runQuery } from "./helpers.js";
import { queries } from "./queries.js";

// Some messages are for future usage
export const userMessages = {
  success: {
    create: "User created successfully.",
    getAll: "Users retrieved successfully.",
    getById: "User retrieved successfully.",
    update: "User updated successfully.",
    delete: "User deleted successfully.",
  },
  error: {
    create: "Error creating user.",
    getAll: "Error retrieving users.",
    getById: "Error retrieving user.",
    update: "Error updating user.",
    delete: "Error deleting user.",
    exist: "User already exists.",
  },
};

export const createUsersTable = () => runQuery(queries.createUsersTable);

export async function addUser({ uniqueCode }) {
  try {
    const result = await runQuery(queries.insertUser, [uniqueCode]);
    return {
      success: true,
      message: userMessages.success.create,
      userId: result.rows[0].id,
    };
  } catch (err) {
    if (err.code === "23505") {
      return { success: false, message: userMessages.error.exist };
    }
    console.error(userMessages.error.create, err);
    return {
      success: false,
      message: userMessages.error.create,
      error: err.message,
    };
  }
}
