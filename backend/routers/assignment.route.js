import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";
import { upload } from "../middleware/upload.js";
import { createAssignment, getAssignmentById, getAssignmentsByClass, getMyAssignments, updateAssignment, deleteAssignment } from "../controllers/assignment.controller.js";

const router = express.Router();

router.post("/", protectRoute, authorizeRoles("teacher"), upload.single("assignmentFile"), createAssignment);
router.get("/class/:classId", protectRoute, authorizeRoles("teacher", "admin"), getAssignmentsByClass);
router.get("/my-assignments", protectRoute, authorizeRoles("student"), getMyAssignments);
router.get("/:assignmentId", protectRoute, authorizeRoles("teacher", "student"), getAssignmentById);

router.put("/:assignmentId", protectRoute, authorizeRoles("teacher", "admin"), upload.single("assignmentFile"), updateAssignment);
router.delete("/:assignmentId", protectRoute, authorizeRoles("teacher", "admin"), deleteAssignment);

export default router;