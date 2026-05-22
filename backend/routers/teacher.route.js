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

export default router;
