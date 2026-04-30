import revenueController from "../controllers/analytics.js";

export const analyticsRoute = (fastify, options) => {
  fastify.get("/:tenantId", revenueController.getRevenueAnalytics);
};
