import { User } from "../models/user.js";
import { getUserOrThrow } from "../utils/getUserOrThrow.js";

const createUser = async (req, reply) => {
  try {
    const user = new User(req.body);
    await user.save();

    return reply
      .status(201)
      .send({ sucess: true, message: "Successfully created the user" });
  } catch (error) {
    return reply.status(500).send({
      sucess: false,
      message: "Getting error while create user " + error.message,
    });
  }
};

const getAllUsers = async (req, reply) => {
  try {
    const user = await User.find({ tenantId: req.tenantId });
    return reply.status(200).send({ sucess: true, data: user });
  } catch (error) {
    return reply
      .status(500)
      .send({ sucess: false, message: `Error: ${error.message}` });
  }
};

export default { createUser, getAllUsers };
