import { Product } from "../models/Product.js";

const createProduct = async (req, reply) => {
  try {
    const product = await Product(req.body);
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
  console.log(req.query, "88888");
  try {
    const {
      category,
      minPrice,
      maxPrice,
      tags,
      page = 1,
      limit = 10,
    } = req.query;
    const parsedMinPrice = Number(minPrice);
    const parsedMaxPrice = Number(maxPrice);

    let query = {};

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
    console.log(query, "***");
    const allProducts = await Product.find(query)
      .skip((page - 1) * limit)
      .limit(limit);

    reply.status(200).send({ sucess: true, data: allProducts });
  } catch (error) {
    reply.status(500).send({
      sucess: false,
      message: "Getting error while fetching products",
    });
  }
};

export default { createProduct, getAllProducts };
