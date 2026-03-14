import { createClient } from 'redis';

const redisClient = createClient();

redisClient.on('error', (err) => 
    console.log('Redis Client Error', err));
await redisClient.connect();   
await redisClient.set('age', '20');
const value = await redisClient.get('age');   
console.log(value);
export default redisClient;