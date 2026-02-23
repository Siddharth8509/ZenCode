import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config({ path: fileURLToPath(new URL("../../.env", import.meta.url)) });

async function dbConnection() {
    await mongoose.connect(process.env.DB_URL)
}

export default dbConnection;
