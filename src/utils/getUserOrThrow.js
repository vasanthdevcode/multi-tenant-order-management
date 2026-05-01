import { User } from "../models/User.js";

export const getUserOrThrow = async (userId, tenantId) => {
  if (!userId) {
    const error = new Error("User id is missing");
    error.statusCode = 400;
    throw error;
  }
  if (!tenantId) {
    const error = new Error("Tenant id is missing");
    error.statusCode = 400;
    throw error;
  }

  const user = await User.find({ _id: userId, tenantId });

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return user;
};
