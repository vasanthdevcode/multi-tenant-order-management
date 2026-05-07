import { redis } from "../config/redis.js";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { User } from "../models/User.js";
import { getUserOrThrow } from "../utils/getUserOrThrow.js";
import { generateLockKey } from "../utils/redisKey.js";

const createOrder = async (req, reply) => {
  try {
    console.log(req.body.userId);
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
    const redisOrderKey = `rate_limit:${req.tenantId}:${userId}:${minute}`;
    console.log(redisOrderKey, "redisOrderKey");
    console.log("Redis connected:", redis.isOpen);
    /**
     * if key not exist redis automatically create key with value 0 then increament by 1
     */
    const count = await redis.incr(redisOrderKey);
    console.log("crossed!");

    if (count === 1) {
      await redis.expire(redisOrderKey, 60);
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

    /**
     * decrease inventoryCount when order placed
     */
    await Product.updateMany(
      { _id: { $in: products.map((p) => p._id) } },
      { $inc: { inventoryCount: -1 } },
    );

    const redisLockKey = generateLockKey({ tenantId: req.tenantId, userId });
    console.log(redisLockKey, "redisLockKey --------");

    const isLocked = await redis.set(redisLockKey, "locked", {
      NX: true,
      PX: 10000,
    });

    console.log(isLocked, "isLocked ------");
    if (!isLocked) {
      return reply.status(409).send({
        sucess: false,
        message: "Duplicate order submission detected",
      });
    }

    const savedOrder = await order.save();
    await redis.incr(`stats:orders:${req.tenantId}`);
    await redis.incrBy(`stats:revenue:${req.tenantId}`, order.totalAmount);
    console.log(
      await redis.mGet([
        `stats:orders:${req.tenantId}`,
        `stats:revenue:${req.tenantId}`,
      ]),
      "orderss ***",
    );

    await redis.xAdd("queue:email:orders", "*", {
      tenantId: req.tenantId.toString(),
      userId,
      order: savedOrder._id.toString(),
      emailType: "ORDER_CONFIRMATION",
    });

    return reply
      .status(201)
      .send({ sucess: true, message: "Order sucessfully created" });
  } catch (error) {
    return reply.status(400).send({
      sucess: false,
      message: "Error while create order " + error.message,
    });
  }
};

const getAllOrders = async (req, reply) => {
  const { sort } = req.query;
  try {
    const orders = await Order.find({
      tenantId: req.tenantId,
    }).sort({
      createdAt: sort === "asc" ? 1 : -1,
    });

    return reply.status(200).send({ sucess: true, data: orders });
  } catch (error) {
    return reply.status(500).send({
      sucess: false,
      message: "Getting errors while fetching orders " + error.message,
    });
  }
};

export default { createOrder, getAllOrders };
