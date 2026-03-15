import { createClient } from 'redis';

const redisClient = createClient({
    url: process.env.REDIS_URL
});
console.log(process.env.REDIS_URL);
redisClient.on('error', (err) => 
    console.log('Redis Client Error', err));
await redisClient.connect();   
await redisClient.set('age', '20');
const value = await redisClient.get('age');   
console.log(value);
export default redisClient;