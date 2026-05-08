import { redis } from "../config/redis.js";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { User } from "../models/User.js";
import { getUserOrThrow } from "../utils/getUserOrThrow.js";
import { generateLockKey } from "../utils/redisKey.js";

const createOrder = async (req, reply) => {
  try {
    const idemKey = req.headers["idempotency-key"];

    const userId = req.body.userId;
    await getUserOrThrow(userId, req.tenantId);

    const productIds = req.body.items.map((i) => i.productId);

    const products = await Product.find({
      _id: { $in: productIds },
      tenantId: req.tenantId,
    });

    /**
     * check products are belongs to tenant
     */
    if (productIds.length !== products.length) {
      return reply.status(400).send({
        sucess: false,
        message: "Some products do not belong to this tenant",
      });
    }

    /**
     * check stock of these products
     */
    const outStockProduct = products.filter((p) => {
      return p.inventoryCount < 1;
    });

    if (outStockProduct.length > 0) {
      return reply.status(400).send({
        sucess: false,
        message: `Some of the product are out of stock such as ${outStockProduct.map((os) => os.name).join()}`,
      });
    }

    const order = new Order(req.body);

    order.tenantId = req.tenantId;
    /**
     * calculate total price of orders
     */
    order.totalAmount = order.items.reduce(
      (acc, value) => acc + value.priceAtPurchase * value.quantity,
      0,
    );

    // generate minute in decimal and terminate secends count by Math.floor
    const minute = Math.floor(Date.now() / 60000);
    // key change per minute
    const redisRateLimitKey = `rate_limit:${req.tenantId}:${userId}:${minute}`;

    /**
     * if key not exist redis automatically create key with value 0 then increament by 1
     */
    const count = await redis.incr(redisRateLimitKey);

    if (count === 1) {
      await redis.expire(redisRateLimitKey, 60);
    }

    /**
     * same key within min: if exceed count 1 then api rate limited for minute
     */
    if (count > 10) {
      return reply.status(429).send({
        sucess: false,
        message: "Rate limit exceeded",
      });
    }

    const redisLockKey = generateLockKey({
      tenantId: req.tenantId,
      userId,
      idemKey,
    });
    const redisIdemKey = generateIdemKey({
      tenantId: req.tenantId,
      userId,
      idemKey,
    });

    const existingResponse = await redis.get(redisIdemKey);

    if (existingResponse) {
      return reply.status(201).send(JSON.parse(existingResponse));
    }

    const isLocked = await redis.set(redisLockKey, "processing", {
      NX: true,
      PX: 10000,
    });

    if (!isLocked) {
      return reply
        .status(409)
        .semd({ sucess: false, message: "Duplicate order submission" });
    }

    const savedOrder = await order.save();

    /**
     * decrease inventoryCount when order placed
     */
    await Product.updateMany(
      { _id: { $in: products.map((p) => p._id) } },
      { $inc: { inventoryCount: -1 } },
    );

    await redis.set(
      redisIdemKey,
      JSON.stringify({
        sucess: true,
        orderId: savedOrder._id,
        message: "Order sucessfully created",
      }),
      {
        EX: 60 * 60 * 24,
      },
    );

    await redis.incr(`stats:orders:${req.tenantId}`);
    await redis.incrBy(`stats:revenue:${req.tenantId}`, order.totalAmount);

    await redis.xAdd("queue:email:orders", "*", {
      tenantId: req.tenantId.toString(),
      userId,
      order: savedOrder._id.toString(),
      emailType: "ORDER_CONFIRMATION",
    });

    return reply.status(201).send({
      sucess: true,
      orderId: savedOrder._id,
      message: "Order sucessfully created",
    });
  } catch (error) {
    return reply.status(400).send({
      sucess: false,
      message: "Error while create order " + error.message,
    });
  }
};

const getAllOrders = async (req, reply) => {
  const { sort, status, startDate, endDate, page = 1, limit = 10 } = req.query;
  try {
    const query = { tenantId: req.tenantId };
    if (status) {
      query.status = status;
    }
    if (startDate && endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(end),
      };
    }
    const sortOptions = {};
    if (sort) {
      if (sort === "asc") sortOptions.createdAt = 1;
      if (sort === "desc") sortOptions.createdAt = -1;
    }
    console.log(sortOptions, "sorttt");
    const orders = await Order.find(query)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(limit);

    return reply.status(200).send({ sucess: true, data: orders });
  } catch (error) {
    return reply.status(500).send({
      sucess: false,
      message: "Getting errors while fetching orders " + error.message,
    });
  }
};

export default { createOrder, getAllOrders };
