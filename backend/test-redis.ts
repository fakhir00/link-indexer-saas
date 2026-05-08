import Redis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) throw new Error("No REDIS_URL found");

const redis = new Redis(redisUrl);

redis.ping().then(res => {
  console.log("Redis Ping Result:", res);
  process.exit(0);
}).catch(err => {
  console.error("Redis Connection Error:", err);
  process.exit(1);
});
