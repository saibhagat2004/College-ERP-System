import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";
import { upload } from "../middleware/upload.js";
import {
	createStudyMaterial,
	deleteStudyMaterial,
	getStudyMaterials,
	updateStudyMaterial,
} from "../controllers/studyMaterial.controller.js";

const router = express.Router();

router.post("/create", protectRoute, authorizeRoles("admin", "teacher"), upload.single("file"), createStudyMaterial);
router.put("/:id", protectRoute, authorizeRoles("teacher"), upload.single("file"), updateStudyMaterial);
router.delete("/:id", protectRoute, authorizeRoles("teacher"), deleteStudyMaterial);
router.get("/", protectRoute, authorizeRoles("student", "teacher"), getStudyMaterials);

export default router;