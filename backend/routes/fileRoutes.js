import express from "express";
import validateIdMiddleware from "../middlewares/validateIdMiddleware.js";
import {
  deleteFile,
  getAllFileSize,
  getFile,
  renameFile,
  uploadFile,
} from "../controllers/filesController.js";
import checkAuth from "../middlewares/authMiddleware.js"

const router = express.Router();

router.param("parentDirId", validateIdMiddleware);
router.param("id", validateIdMiddleware);

router.get("/getStorage", getAllFileSize);
router.get("/:id", getFile);

router.post("/:parentDirId?", uploadFile);
router.patch("/:id", renameFile);

router.delete("/:id", deleteFile);

export default router;
