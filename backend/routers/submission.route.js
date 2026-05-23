import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";
import { upload } from "../middleware/upload.js";
import { getSubmissionsByAssignment, submitAssignment, updateSubmissionMarks } from "../controllers/submission.controller.js";

const router = express.Router();

router.post("/assignment/:assignmentId", protectRoute, authorizeRoles("student"), upload.single("submissionFile"), submitAssignment);
router.get("/assignment/:assignmentId", protectRoute, authorizeRoles("teacher", "admin"), getSubmissionsByAssignment);
router.patch("/:submissionId/marks", protectRoute, authorizeRoles("teacher"), updateSubmissionMarks);

export default router;