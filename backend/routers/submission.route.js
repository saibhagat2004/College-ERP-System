import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";
import { upload } from "../middleware/upload.js";
import { getSubmissionsByAssignment, submitAssignment } from "../controllers/submission.controller.js";

const router = express.Router();

router.post("/assignment/:assignmentId", protectRoute, authorizeRoles("student"), upload.single("submissionFile"), submitAssignment);
router.get("/assignment/:assignmentId", protectRoute, authorizeRoles("teacher", "admin"), getSubmissionsByAssignment);

export default router;