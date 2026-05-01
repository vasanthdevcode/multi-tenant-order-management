import mongoose from "mongoose";
import { Order } from "../models/Order.js";

const getRevenueAnalytics = async (req, reply) => {
  try {
    const revenue = await Order.aggregate([
      { $match: { tenantId: req.tenantId } },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          totalRevenue: { $sum: "$totalAmount" },
          createdOrders: {
            $sum: { $cond: [{ $eq: ["$status", "created"] }, 1, 0] },
          },
          cancelledOrder: {
            $sum: { $cond: [{ $eq: ["$status", "cancel"] }, 1, 0] },
          },
        },
      },
    ]);

    reply.status(200).send({ sucess: true, data: revenue });
  } catch (error) {
    reply.status(500).send({
      sucess: false,
      message: "Getting error while fetch revenue " + error.message,
    });
  }
};

export default { getRevenueAnalytics };
