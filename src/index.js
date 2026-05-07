import Fastify from "fastify";
import mongoose from "mongoose";
import "dotenv/config";
import jwt from "@fastify/jwt";
import { tenantRoute } from "./routes/tenant.js";
import { tenantChecker } from "./middlewares/tenantChecker.js";
import { productRoute } from "./routes/product.js";
import { orderRoute } from "./routes/order.js";
import { userRoute } from "./routes/user.js";
import { analyticsRoute } from "./routes/analytics.js";
import { worker } from "./worker/worker.js";
import { loginRoute } from "./routes/login.js";
import { authChecker } from "./middlewares/auth.js";

const fastify = Fastify({ logger: true });
fastify.register(tenantRoute, { prefix: "api/tenant" });
fastify.register(productRoute, { prefix: "api/product" });
fastify.register(orderRoute, { prefix: "api/order" });
fastify.register(userRoute, { prefix: "api/user" });
fastify.register(analyticsRoute, { prefix: "api/analytics/revenue" });
fastify.register(loginRoute, { prefix: "/api/login" });
fastify.register(jwt, {
  secret: process.env.JWT_SECRET,
});
fastify.addHook("preHandler", tenantChecker);
fastify.addHook("preHandler", authChecker);

const PORT = process.env.PORT;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("DB connected...");
  })
  .catch((err) => console.error(err));

fastify
  .listen({ port: PORT })
  .then(() => {
    console.log(`Server running successfully on ${PORT}`);
  })
  .catch((err) => {
    console.error(err);
  });

await worker();
