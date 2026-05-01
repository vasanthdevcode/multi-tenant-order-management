import { Tenant } from "../models/Tenant.js";

/**
 * Middleware - tenantChecker
 * @description - this middleware validate tenant and attach tenantId to req cycle
 * - check tenant id exist in headers
 * - check tenant exist is not
 * - attach the tenantId to req so controller can use it
 */
export const tenantChecker = async (req, reply) => {
  if (req.routeOptions.config?.skipTenant) {
    return;
  }
  try {
    const tenantId = req.headers[process.env.TENANT_API_KEY];
    if (!tenantId) {
      return reply
        .status(400)
        .send({ sucess: false, message: "Tenant id is require" });
    }

    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return reply
        .status(400)
        .send({ sucess: false, message: "Tenant not exist" });
    }

    req.tenantId = tenant._id;
  } catch (error) {
    return reply.status(500).send({
      success: false,
      message: "Error validating tenant: " + error.message,
    });
  }
};
