import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";
import { createNotice, deleteNotice, getNotices, updateNotice } from "../controllers/notice.controller.js";

const router = express.Router();

router.get("/", protectRoute, getNotices);
router.post("/create", protectRoute, authorizeRoles("admin", "teacher"), createNotice);
router.put("/:id", protectRoute, authorizeRoles("admin", "teacher"), updateNotice);
router.delete("/:id", protectRoute, authorizeRoles("admin", "teacher"), deleteNotice);

export default router;
