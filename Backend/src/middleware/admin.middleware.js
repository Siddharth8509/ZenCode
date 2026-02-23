import redisClient from "../config/redis.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config({ path: fileURLToPath(new URL("../../.env", import.meta.url)) });

const adminMiddleware = async(req,res,next)=>{
    try 
    {
        const token = req.cookies?.token;
        if(!token)
            return res.status(401).send("Token doesn't exist")

        const isBlocked = await redisClient.exists(`token:${token}`);
        if(isBlocked)
            return res.status(401).send("Session expired please login again")

        const decoded = jwt.verify(token,process.env.JWT_SECRET)
        req.userId = decoded._id;

        if(decoded.role!="admin")
            return res.status(401).send("Invalid token")

        next();
    } 
    catch (error) 
    {
        return res.status(401).send("Invalid Token")
    }
}

export default adminMiddleware;
