import express from "express";
import validateIdMiddleware from "../middlewares/validateIdMiddleware.js";

import {
  createDirectory,
  deleteDirectory,
  getDirectory,
  renameDirectory,
  getBreadcrumb,
} from "../controllers/directoryContoller.js";

const router = express.Router();

router.param("parentDirId", validateIdMiddleware);
router.param("id", validateIdMiddleware);

router.get("/:id/breadcrumb", getBreadcrumb);

router.get("/:id?", getDirectory);

router.post("/:parentDirId?", createDirectory);

router.patch("/:id", renameDirectory);

router.delete("/:id", deleteDirectory);

export default router;
