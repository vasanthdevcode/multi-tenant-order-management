import tenantController from "../controllers/tenant.js";

export const tenantRoute = (fastify, options) => {
  fastify.post(
    "/",
    { config: { skipTenant: true } },
    tenantController.createTenant,
  );
};
