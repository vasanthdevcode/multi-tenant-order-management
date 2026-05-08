import { redis } from "../config/redis.js";
import { Product } from "../models/Product.js";
import { generateProductKey } from "../utils/redisKey.js";

const createProduct = async (req, reply) => {
  try {
    const product = new Product(req.body);
    product.tenantId = req.tenantId;
    await product.save();

    reply
      .status(201)
      .send({ sucess: true, message: "Successfully product created" });
  } catch (error) {
    reply.status(500).send({
      sucess: false,
      message: "Failed to create product: " + error.message,
    });
  }
};

const getAllProducts = async (req, reply) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      tags,
      sort,
      page = 1,
      limit = 10,
    } = req.query;
    console.log(tags, "tag**");
    const parsedMinPrice = Number(minPrice);
    const parsedMaxPrice = Number(maxPrice);

    let query = { tenantId: req.tenantId };

    if (category) {
      query.category = category;
    }

    if (tags) {
      query.tags = { $in: Array.isArray(tags) ? tags : [tags] };
    }

    if (!isNaN(parsedMinPrice) && !isNaN(parsedMaxPrice)) {
      query.price = {};
      if (parsedMinPrice > parsedMaxPrice) {
        return reply.status(400).send({
          sucess: false,
          message: "Min price should be lower than max price amount",
        });
      }
      query.price.$gte = parsedMinPrice;
      query.price.$lte = parsedMaxPrice;
    }

    let sortOption = {};

    if (sort) {
      if (sort === "price_asc") {
        sortOption.price = 1;
      }

      if (sort === "price_desc") {
        sortOption.price = -1;
      }
    }
    const redisProductKey = generateProductKey({
      tenantId: req.tenantId,
      category,
      minPrice,
      maxPrice,
      sort,
    });

    console.log(redisProductKey, "redisProductKey");
    const redisData = await redis.get(redisProductKey);
    console.log(redisData, "*** redisData");
    const totalItems = await Product.countDocuments({ tenantId: req.tenantId });

    if (redisData) {
      console.log("CACHE_HIT");
      // console.log(await redis.keys("*"), "keys");
      return reply.status(200).send({
        sucess: true,
        data: JSON.parse(redisData),
        page,
        limit,
        total: totalItems,
      });
    } else {
      console.log("CACHE_MISS");
      const allProducts = await Product.find(query)
        .sort(sortOption)
        .skip((page - 1) * limit)
        .limit(limit);
      redis.set(redisProductKey, JSON.stringify(allProducts));
      console.log(await redis.keys("*"), "keys");
      return reply
        .status(200)
        .send({
          sucess: true,
          data: allProducts,
          page,
          limit,
          total: totalItems,
        });
    }
  } catch (error) {
    return reply.status(500).send({
      sucess: false,
      message: "Getting error while fetching products " + error.message,
    });
  }
};

export default { createProduct, getAllProducts };
