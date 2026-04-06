import express from "express";
import checkAuth from "../middlewares/authMiddleware.js";
import { checkRegularUser, checkAdmin } from "../middlewares/authMiddleware.js";
import {
  getAllUsers,
  getCurrentUser,
  login,
  logout,
  logoutAllDevices,
  logoutById,
  deleteUser,
  register,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/user", checkAuth, getCurrentUser);
router.post("/user/register", register);
router.post("/user/login", login);
router.post("/user/logout", logout);
router.post("/user/logoutAllDevices", logoutAllDevices);

router.post("/user/:userId/logout", checkAuth, checkRegularUser, logoutById);
router.delete("/user/:userId", checkAuth, checkAdmin, deleteUser);

router.get('/users', checkAuth, checkRegularUser, getAllUsers);



export default router;
