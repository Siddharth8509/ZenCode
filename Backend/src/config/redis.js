// Redis is only used here as a session blacklist store for logged-out JWTs.
// Keeping the client config isolated makes the auth flow easier to reason about.
import redis from "redis";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config({ path: fileURLToPath(new URL("../../.env", import.meta.url)) });

const redisClient = redis.createClient({
    username: process.env.REDIS_USERNAME || "default",
    password: process.env.REDIS_PASS,
    socket: {
        host: process.env.REDIS_HOST || "redis-15582.crce263.ap-south-1-1.ec2.cloud.redislabs.com",
        port: Number(process.env.REDIS_PORT) || 15582,
    }
});

export default redisClient;
