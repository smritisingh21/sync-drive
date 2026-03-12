import express from "express"
import { loginWithGoogle } from "../controllers/authControllers.js";

const router = express.Router();

router.post("/google" , loginWithGoogle)

export default router;