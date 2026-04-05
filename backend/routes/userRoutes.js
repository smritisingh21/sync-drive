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
router.get('/users',checkAuth, getAllUsers)



export default router;
