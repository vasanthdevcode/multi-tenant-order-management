import { loginController } from "../controllers/login.js";

export const loginRoute = (fastify, options) => {
  fastify.post(
    "/",
    {
      config: { skipAuth: true },
    },
    loginController,
  );
};
