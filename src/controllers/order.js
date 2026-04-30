import { Order } from "../models/Order.js";

const createOrder = async (req, reply) => {
  try {
    const order = await Order(req.body);
    await order.save();
    reply
      .status(201)
      .send({ sucess: true, message: "Order sucessfully created" });
  } catch (error) {
    reply.status(400).send({
      sucess: false,
      message: "Error while create order " + error.message,
    });
  }
};

const getAllOrders = async (req, reply) => {
  const { sort } = req.query;
  try {
    const orders = await Order.find().sort({
      createdAt: sort === "asc" ? 1 : -1,
    });
    reply.status(200).send({ sucess: true, data: orders });
  } catch (error) {
    reply
      .status(500)
      .send({ sucess: false, message: "Getting errors while fetching orders" });
  }
};

export default { createOrder, getAllOrders };
