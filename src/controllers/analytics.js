import mongoose from "mongoose";
import { Order } from "../models/Order.js";

const getRevenueAnalytics = async (req, reply) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { tenantId: req.tenantId };
    if (startDate && endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: end,
      };
    }
    const revenue = await Order.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            date: { $dayOfMonth: "$createdAt" },
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          totalRevenue: { $sum: "$totalAmount" },
          paidOrders: {
            $sum: { $cond: [{ $eq: ["$status", "paid"] }, 1, 0] },
          },
          cancelledOrder: {
            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          _id: 1,
          totalRevenue: 1,
          paidOrders: 1,
          cancelledOrder: 1,
          averageOrderValue: { $avg: ["$paidOrders", "$cancelledOrder"] },
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
