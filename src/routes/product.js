import productController from "../controllers/product.js";

export const productRoute = (fastify, options) => {
  fastify.post("/", productController.createProduct);
  fastify.get("/", productController.getAllProducts);
};
