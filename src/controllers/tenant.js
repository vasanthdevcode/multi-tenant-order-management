import { Tenant } from "../models/Tenant.js";

const createTenant = async (req, reply) => {
  try {
    const tenant = new Tenant(req.body);
    const createdTenant = await tenant.save();

    return reply.status(201).send({ sucess: true, data: createdTenant });
  } catch (error) {
    return reply
      .status(500)
      .send({ sucess: false, message: `Error: ${error.message}` });
  }
};

export default { createTenant };
