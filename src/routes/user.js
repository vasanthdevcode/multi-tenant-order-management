import userController from "../controllers/user.js";

export const userRoute = (fastify, options) => {
  fastify.post("/", userController.createUser);
  fastify.get("/", userController.getAllUsers);
};
