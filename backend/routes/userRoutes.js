import express from "express";
import checkAuth from "../middlewares/authMiddleware.js";
import {
  getAllUsers,
  getCurrentUser,
  login,
  logout,
  logoutAllDevices,
  register,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/user", checkAuth, getCurrentUser);
router.post("/user/register", register);
router.post("/user/login", login);
router.post("/user/logout", logout);
router.post("/user/logoutAllDevices", logoutAllDevices);
router.get('/users',
  checkAuth, (req,res,next) =>{
    if(req.user.role !== "User") return next();
    console.log("Only admins and managers can access users");
    res.status(403).json({err : "Only admins and managers can access users"})
  },
   getAllUsers)



export default router;
