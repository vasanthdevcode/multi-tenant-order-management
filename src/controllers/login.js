import { redis } from "../config/redis.js";
import { User } from "../models/User.js";

export const loginController = async (req, reply) => {
  try {
    const { email, password } = req.body;
    console.log(req.tenantId, email, password, "****");
    const user = await User.findOne({ tenantId: req.tenantId, email });
    if (!user) {
      return reply
        .status(400)
        .send({ sucess: false, message: "Invalid credential" });
    }
    console.log(user, "user");
    const isMatch = await user.comparePassword(password);
    console.log(isMatch, password, "**");
    if (!isMatch) {
      return reply
        .status(400)
        .send({ sucess: false, message: "Invalid credential" });
    }
    const token = req.server.jwt.sign(
      { tenantId: req.tenantId.toString(), userId: user._id },
      { expiresIn: "1hr" },
    );

    const sessionKey = `session:${req.tenantId}:${user._id}`;
    await redis.set(
      sessionKey,
      JSON.stringify({
        token,
        loginTime: Date.now(),
        ip: req.ip,
      }),
      { EX: 60 * 60 },
    );

    return reply.status(200).send({ sucess: true, token, expiresIn: 60 * 60 });
  } catch (error) {
    return reply
      .status(500)
      .send({ sucess: false, message: "Login failed:" + error.message });
  }
};
