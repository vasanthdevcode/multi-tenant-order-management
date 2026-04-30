import orderController from "../controllers/order.js";

export const orderRoute = (fastify, options) => {
  fastify.post("/", orderController.createOrder);
  fastify.get("/", orderController.getAllOrders);
};
