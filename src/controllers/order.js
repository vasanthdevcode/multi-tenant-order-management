import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { User } from "../models/User.js";
import { getUserOrThrow } from "../utils/getUserOrThrow.js";

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

    /**
     * decrease inventoryCount when order placed
     */
    await Product.updateMany(
      { _id: { $in: products.map((p) => p._id) } },
      { $inc: { inventoryCount: -1 } },
    );

    await order.save();

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
