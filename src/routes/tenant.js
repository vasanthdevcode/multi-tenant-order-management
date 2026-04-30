import tenantController from "../controllers/tenant.js";

export const tenantRoute = (fastify, options) => {
  fastify.post("/", tenantController.createTenant);
};
