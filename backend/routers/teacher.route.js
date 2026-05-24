import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";
import { getTeacherClasses, getClassStudentsForTeacher } from "../controllers/class.controller.js";

const router = express.Router();

router.get("/my-classes", protectRoute, authorizeRoles("teacher"), getTeacherClasses);
router.get(
  "/classes/:classId/students",
  protectRoute,
  authorizeRoles("teacher"),
  getClassStudentsForTeacher
);

export default router;
