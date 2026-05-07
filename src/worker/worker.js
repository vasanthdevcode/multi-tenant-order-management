import { redis, redisWorker } from "../config/redis.js";
import { emailSender } from "../utils/emailSender.js";

console.log("worker is start listening..");

export const worker = async () => {
  while (true) {
    console.log("worker start working...");

    const result = await redisWorker.xRead(
      [{ key: "queue:email:orders", id: "$" }],
      {
        BLOCK: 0,
      },
    );
    console.log("worker reads the value...");

    if (!result) continue;
    console.log(result[0].messages[0].message.emailType, "worker");

    if (result[0].messages[0].message.emailType === "ORDER_CONFIRMATION") {
      try {
        await emailSender(
          "vasanthakumar.selvam@halleyx.com",
          "Order confirmation",
          `order id: ${result[0].messages[0].message.order}`,
        );
      } catch (error) {
        console.error("EMAIL_FAILED");
      }
    }
  }
};
