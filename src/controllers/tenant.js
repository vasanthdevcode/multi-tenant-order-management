import { Tenant } from "../models/Tenant.js";

const createTenant = async (req, reply) => {
  try {
    const tenant = await Tenant(req.body);
    const createdTenant = await tenant.save();
    reply.status(201).send({ sucess: true, data: createdTenant });
  } catch (error) {
    reply.status(500).send({ sucess: false, message: `Error: ${error}` });
  }
};

export default { createTenant };
