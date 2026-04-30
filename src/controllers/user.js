import { User } from "../models/user.js";

const createUser = async (req, reply) => {
  try {
    const user = await User(req.body);
    await user.save();
    reply
      .status(201)
      .send({ message: true, message: "Successfully created the user" });
  } catch (error) {
    reply.status(500).send({
      sucess: false,
      message: "Getting error while create user " + error.message,
    });
  }
};

export default { createUser };
