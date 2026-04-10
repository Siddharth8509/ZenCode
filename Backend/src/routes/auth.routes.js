import express from "express";
import { registerUser, loginUser, logoutUser, adminRegister, deleteUser, updateProfile, resetPassword, uploadProfilePic } from "../controllers/UserAuth.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import adminMiddleware from "../middleware/admin.middleware.js";
import multer from "multer";
import serializeUser from "../utils/serializeUser.js";

const authRouter = express.Router();

const storage = multer.memoryStorage();
const uploadMemory = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype?.startsWith("image/")) {
            return cb(new Error("Only image files are allowed."));
        }
        cb(null, true);
    }
});

authRouter.post("/login", loginUser);
authRouter.post("/logout", logoutUser);
authRouter.post("/register", registerUser);
authRouter.post("/admin/register", adminMiddleware, adminRegister);
authRouter.delete("/delete/:id", authMiddleware, deleteUser);
authRouter.patch("/profile", authMiddleware, updateProfile);
authRouter.post("/reset-password", authMiddleware, resetPassword);
authRouter.post("/profile-pic", authMiddleware, (req, res, next) => {
    uploadMemory.single("image")(req, res, (err) => {
        if (err) {
            const message =
                err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE"
                    ? "Image must be 5MB or smaller."
                    : err.message;

            return res.status(400).json({ message });
        }
        next();
    });
}, uploadProfilePic);

// Session restore: called once on app boot to rehydrate Redux auth state from cookie.
authRouter.get("/check", authMiddleware, (req, res) => {
    res.status(200).json({
        user: serializeUser(req.result),
        message: "Authorized"
    });
});

export default authRouter;
