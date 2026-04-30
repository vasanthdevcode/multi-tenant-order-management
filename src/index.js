import Fastify from "fastify";
import mongoose from "mongoose";
import "dotenv/config";
import { tenantRoute } from "./routes/tenant.js";
import { tenantChecker } from "./middlewares/tenantChecker.js";
import { productRoute } from "./routes/product.js";
import { orderRoute } from "./routes/order.js";
import { userRoute } from "./routes/user.js";
import { analyticsRoute } from "./routes/analytics.js";

const fastify = Fastify({ logger: true });
fastify.register(tenantRoute, { prefix: "api/tenant" });
fastify.register(productRoute, { prefix: "api/product" });
fastify.register(orderRoute, { prefix: "api/order" });
fastify.register(userRoute, { prefix: "api/user" });
fastify.register(analyticsRoute, { prefix: "api/analytics/revenue" });
fastify.addHook("preHandler", tenantChecker);

const PORT = process.env.PORT;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("DB connected...");
  })
  .catch((err) => console.error(err));

fastify
  .listen({ port: PORT })
  .then(() => console.log(`Server running successfully on ${PORT}`))
  .catch((err) => {
    console.error(err);
  });
