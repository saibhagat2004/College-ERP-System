import express from "express";
import Class from "../models/class.model.js";
import { protectRoute } from "../middleware/protectRoute.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";

const router = express.Router();

router.get("/my-classes", protectRoute, authorizeRoles("teacher"), async (req, res) => {
	try {
		const classes = await Class.find({ teacherId: req.user._id })
			.populate("students", "fullName email userCode rollNo profilePicture")
			.sort({ createdAt: -1 });

		return res.json(classes);
	} catch (error) {
		console.error("Error fetching teacher classes:", error.message);
		return res.status(500).json({ error: "Internal Server Error" });
	}
});

router.get("/classes/:classId/students", protectRoute, authorizeRoles("teacher"), async (req, res) => {
	try {
		const classDoc = await Class.findOne({ _id: req.params.classId, teacherId: req.user._id })
			.populate("teacherId", "fullName email userCode profilePicture")
			.populate("students", "fullName email userCode rollNo gender profilePicture fees");

		if (!classDoc) {
			return res.status(404).json({ error: "Class not found" });
		}

		return res.json(classDoc);
	} catch (error) {
		console.error("Error fetching class students:", error.message);
		return res.status(500).json({ error: "Internal Server Error" });
	}
});

export default router;
