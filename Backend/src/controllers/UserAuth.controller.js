// This controller owns the full account lifecycle:
// sign up, sign in, sign out, profile edits, password resets, and account deletion.
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../model/user.js";
import redisClient from "../config/redis.js";
import authValidate from "../utils/authValidator.js";
import submission from "../model/submission.js";
import cloudinary from "../config/cloudinary.js";
import serializeUser from "../utils/serializeUser.js";

const registerUser = async (req, res) => {
    try {
        authValidate(req.body);

        const normalizedEmailId = req.body.emailId.trim().toLowerCase();
        const { password, role, ...data } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            ...data,
            emailId: normalizedEmailId,
            password: hashedPassword,
            role: "user",
        });

        // The frontend relies on this cookie-based session, so we mint the token right after signup.
        const token = jwt.sign(
            { _id: newUser._id, emailId: normalizedEmailId, role: newUser.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.cookie("token", token, {
            maxAge: 60 * 60 * 1000,
            httpOnly: true,
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            secure: process.env.NODE_ENV === "production",
        });
        res.status(201).json({
            user: serializeUser(newUser),
            message: "User registered successfully"
        });
    }
    catch (error) {
        res.status(400).send(error.message);
    }
};

const loginUser = async (req, res) => {
    try {
        const emailId = req.body.emailId?.trim().toLowerCase();
        const { password } = req.body;

        // Use a generic error message to avoid leaking whether the email exists.
        if (!emailId || !password)
            throw new Error("Invalid credentials");

        const userData = await User.findOne({ emailId });
        if (!userData)
            throw new Error("Invalid credentials");

        const verifyPassword = await bcrypt.compare(password, userData.password);
        if (!verifyPassword)
            throw new Error("Invalid credentials");

        const token = jwt.sign(
            { _id: userData._id, emailId: emailId, role: userData.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.cookie("token", token, {
            maxAge: 60 * 60 * 1000,
            httpOnly: true,
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            secure: process.env.NODE_ENV === "production",
        });
        res.status(200).json({
            user: serializeUser(userData),
            message: "Login successful"
        });
    }
    catch (error) {
        res.status(401).json({ message: error.message });
    }
};

const logoutUser = async (req, res) => {
    try {
        const token = req.cookies?.token;
        if (token) {
            const payload = jwt.decode(token);
            if (payload && payload.exp) {
                // Blacklisting lets us "invalidate" a stateless JWT until it naturally expires.
                await redisClient.set(`token:${token}`, "Blocked");
                await redisClient.expireAt(`token:${token}`, payload.exp);
            }
        }
    }
    catch (error) {
        console.error("Logout warning:", error.message);
    }
    finally {
        res.clearCookie("token", {
            httpOnly: true,
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            secure: process.env.NODE_ENV === "production",
        });
        res.status(200).send("Logout successfully");
    }
};

const adminRegister = async (req, res) => {
    try {
        authValidate(req.body);

        const normalizedEmailId = req.body.emailId.trim().toLowerCase();
        const { password, role, ...data } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            ...data,
            emailId: normalizedEmailId,
            password: hashedPassword,
            role: "admin",
        });

        const token = jwt.sign(
            { _id: newUser._id, emailId: normalizedEmailId, role: newUser.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.cookie("token", token, {
            maxAge: 60 * 60 * 1000,
            httpOnly: true,
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            secure: process.env.NODE_ENV === "production",
        });
        res.status(201).json({
            user: serializeUser(newUser),
            message: "Admin created successfully!"
        });
    }
    catch (error) {
        res.status(400).send(error.message);
    }
};

const deleteUser = async (req, res) => {
    try {
        const id = req.userId;
        if (!id)
            return res.status(401).send("Invalid token");

        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).send("Invalid user id");

        const userExist = await User.findById(id);
        if (!userExist)
            return res.status(404).send("User does not exist");

        // Submissions are removed alongside the account so profile stats do not keep orphaned data around.
        await submission.deleteMany({ userId: id });
        await User.findByIdAndDelete(id);

        return res.status(200).send("User deleted successfully");
    }
    catch (error) {
        res.status(500).send("Unexpected error occurred: " + error.message);
    }
};

const updateProfile = async (req, res) => {
    try {
        const id = req.userId;
        if (!id) return res.status(401).send("Invalid token");

        const { firstname, lastname, age, gender } = req.body;

        // Email stays immutable in this product, so the profile edit form only touches editable identity fields.
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { firstname, lastname, age, gender },
            { new: true, runValidators: true }
        ).select("-password");

        if (!updatedUser) return res.status(404).send("User not found");

        res.status(200).json({
            user: serializeUser(updatedUser),
            message: "Profile updated successfully"
        });
    } catch (error) {
        res.status(500).send("Unexpected error occurred: " + error.message);
    }
};

const resetPassword = async (req, res) => {
    try {
        const id = req.userId;
        if (!id) return res.status(401).send("Invalid token");

        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            return res.status(400).send("Please provide both old and new passwords");
        }

        const userExist = await User.findById(id);
        if (!userExist) return res.status(404).send("User not found");

        const verifyPassword = await bcrypt.compare(oldPassword, userExist.password);
        if (!verifyPassword) {
            return res.status(401).json({ message: "Incorrect old password" });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        userExist.password = hashedNewPassword;
        await userExist.save();

        res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        res.status(500).send("Unexpected error occurred: " + error.message);
    }
};

const uploadProfilePic = async (req, res) => {
    try {
        const id = req.userId;
        if (!id) return res.status(401).send("Invalid token");

        if (!req.file || !req.file.buffer) {
            return res.status(400).send("No image provided.");
        }
        
        // Use a Promise to wrap the Cloudinary upload stream
        const uploadStream = () => new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder: 'zencode_profile_pics' },
                (error, result) => {
                    if (result) {
                        resolve(result);
                    } else {
                        reject(error);
                    }
                }
            );
            stream.end(req.file.buffer);
        });

        const result = await uploadStream();
        const profilePicUrl = result.secure_url;

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { profilePic: profilePicUrl },
            { new: true }
        ).select("-password -__v");

        if (!updatedUser) {
            return res.status(404).send("User not found");
        }

        res.status(200).json({
            user: serializeUser(updatedUser),
            message: "Profile picture updated successfully"
        });
    } catch (error) {
        res.status(500).send("Unexpected error occurred: " + error.message);
    }
};

export { registerUser, logoutUser, loginUser, adminRegister, deleteUser, updateProfile, resetPassword, uploadProfilePic };
