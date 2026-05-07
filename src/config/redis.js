import { createClient } from "redis";

const redis = createClient();
redis.on("error", (err) => console.log("Redis Client Error", err));

redis
  .connect()
  .then(() => console.log("redis connected"))
  .catch((err) => console.log(err));

const redisWorker = createClient();
redisWorker
  .connect()
  .then(() => console.log("redisWorker connected"))
  .catch((err) => console.log(err));

export { redis, redisWorker };
