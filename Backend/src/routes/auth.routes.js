// Keeping auth routes together makes the server bootstrap clean
// and gives all account-related endpoints one obvious home.
import express from "express";
import { registerUser, loginUser, logoutUser, adminRegister, deleteUser, updateProfile, resetPassword } from "../controllers/UserAuth.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import adminMiddleware from "../middleware/admin.middleware.js";

const authRouter = express.Router();

authRouter.post("/login", loginUser);
authRouter.post("/logout", authMiddleware, logoutUser);
authRouter.post("/register", registerUser);
authRouter.post("/admin/register", adminMiddleware, adminRegister);
authRouter.delete("/delete/:id", authMiddleware, deleteUser);
authRouter.patch("/profile", authMiddleware, updateProfile);
authRouter.post("/reset-password", authMiddleware, resetPassword);

// Session restore: called once on app boot to rehydrate Redux auth state from cookie.
authRouter.get("/check", authMiddleware, (req, res) => {
    const reply = {
        firstname: req.result.firstname,
        lastname: req.result.lastname,
        emailId: req.result.emailId,
        role: req.result.role,
        _id: req.result._id
    };
    res.status(200).json({
        user: reply,
        message: "Authorized"
    });
});

export default authRouter;
