import { redis } from "../config/redis.js";

export const authChecker = async (req, reply) => {
  console.log(req.routeOptions.config, "**");
  try {
    if (req.routeOptions.config?.skipAuth) {
      return;
    }
    await req.jwtVerify();

    const { tenantId, userId } = req.user;
    console.log(req.user, "user ****");

    const { token } = JSON.parse(
      await redis.get(`session:${tenantId}:${userId}`),
    ) || { token: null };
    console.log(token, "token ***");
    if (!token) {
      reply.status(401).send({ success: false, message: "Unauthorized user" });
    }
  } catch (err) {
    return reply.status(401).send({
      success: false,
      message: "Unauthorized:" + err.message,
    });
  }
};
