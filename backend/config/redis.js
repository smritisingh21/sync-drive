import dotenv from "dotenv";
dotenv.config()
import { createClient } from 'redis';


console.log({
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: process.env.REDIS_PORT,
  REDIS_USER: process.env.REDIS_USER,
  REDIS_PWD: process.env.REDIS_PWD ? "loaded" : "missing"
});
const redisClient = createClient({
    username: process.env.REDIS_USER,
    password: process.env.REDIS_PWD,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    }
});

redisClient.on('error', err =>
     console.log('Redis Client Error', err));

await redisClient.connect();

export default redisClient;