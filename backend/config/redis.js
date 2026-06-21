import dotenv from "dotenv";
dotenv.config()
import { createClient } from 'redis';

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
// (Removed FT index creation - using simple JSON queries instead)

export default redisClient;