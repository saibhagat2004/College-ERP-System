import Assignment from "../models/assignment.model.js";
import Class from "../models/class.model.js";
import Submission from "../models/submission.model.js";
import { v2 as cloudinary } from "cloudinary";


// const uploadBufferToCloudinary = (fileBuffer, fileName) =>
// 	new Promise((resolve, reject) => {

// 		// remove extension from filename
// 		const cleanFileName =
// 			fileName.replace(/\.[^/.]+$/, "");

// 		const stream = cloudinary.uploader.upload_stream(
// 			{
// 				resource_type: "image",
// 				folder: "college-erp/assignments",
// 				public_id: cleanFileName,
// 				use_filename: true,
// 				unique_filename: false,
// 			},
// 			(error, result) => {
// 				if (error) {
// 					reject(error);
// 					return;
// 				}

// 				console.log(result);
// 				resolve(result);
// 			},
// 		);

// 		stream.end(fileBuffer);
// 	});



const uploadBufferToCloudinary = (fileBuffer, fileName) =>
	new Promise((resolve, reject) => {

		const cleanFileName =
			fileName.replace(/\.[^/.]+$/, "");

		const isPdf =
			fileName.toLowerCase().endsWith(".pdf");

		const stream = cloudinary.uploader.upload_stream(
			{
				resource_type: isPdf ? "image" : "raw",

				folder: "college-erp/assignments",

				public_id: cleanFileName,

				use_filename: true,

				unique_filename: false,
			},
			(error, result) => {
				if (error) {
					reject(error);
					return;
				}

				resolve(result);
			},
		);

		stream.end(fileBuffer);
	});

export const createAssignment = async (req, res) => {
	try {
		const { title, description, assignmentType, classId, totalMarks, dueDate, mcqQuestions } = req.body;
		let fileUrl = "";
		let parsedMcqQuestions = [];

		if (typeof mcqQuestions === "string" && mcqQuestions.trim()) {
			try {
				parsedMcqQuestions = JSON.parse(mcqQuestions);
			} catch {
				return res.status(400).json({ error: "mcqQuestions must be valid JSON" });
			}
		} else if (Array.isArray(mcqQuestions)) {
			parsedMcqQuestions = mcqQuestions;
		}

		if (req.file) {
			const uploadResult = await uploadBufferToCloudinary(req.file.buffer, req.file.originalname);
			fileUrl = uploadResult.secure_url || "";
		}

		if (!title || !assignmentType || !classId || !dueDate) {
			return res.status(400).json({ error: "title, assignmentType, classId and dueDate are required" });
		}

		const cls = await Class.findOne({ _id: classId, teacherId: req.user._id });
		if (!cls) {
			return res.status(403).json({ error: "You can only create assignments for your own classes" });
		}

		const assignment = await Assignment.create({
			title: title.trim(),
			description: description?.trim() || "",
			assignmentType,
			classId,
			teacherId: req.user._id,
			totalMarks: totalMarks === "" || totalMarks === undefined ? undefined : Number(totalMarks),
			dueDate,
			fileUrl,
			mcqQuestions: parsedMcqQuestions,
		});

		return res.status(201).json(assignment);
	} catch (error) {
		console.error("Error creating assignment:", error.message);
		return res.status(500).json({ error: "Internal Server Error" });
	}
};

export const getAssignmentsByClass = async (req, res) => {
	try {
		const { classId } = req.params;
		const teacherFilter = req.user?.role === "teacher" ? { teacherId: req.user._id } : {};
		const assignments = await Assignment.find({ classId, ...teacherFilter })
			.populate("classId", "className section")
			.populate("teacherId", "fullName email userCode profilePicture")
			.sort({ createdAt: -1 });

		return res.json(assignments);
	} catch (error) {
		console.error("Error fetching class assignments:", error.message);
		return res.status(500).json({ error: "Internal Server Error" });
	}
};

export const getMyAssignments = async (req, res) => {
	try {
		if (req.user.role !== "student") {
			return res.status(403).json({ error: "Only students can access this route" });
		}

		if (!req.user.classId) {
			return res.status(404).json({ error: "No class assigned to this student" });
		}

		const classId = req.user.classId?._id ?? req.user.classId;
		const assignments = await Assignment.find({ classId })
			.populate("classId", "className section")
			.populate("teacherId", "fullName email userCode profilePicture")
			.sort({ createdAt: -1 });

		const submissions = await Submission.find({ studentId: req.user._id }).select("assignmentId status submittedAt");
		const submissionMap = new Map(submissions.map((submission) => [submission.assignmentId.toString(), submission]));

		const assignmentsWithStatus = assignments.map((assignment) => {
			const mySubmission = submissionMap.get(assignment._id.toString());

			return {
				...assignment.toObject(),
				isSubmitted: Boolean(mySubmission),
				submissionStatus: mySubmission?.status || null,
				submittedAt: mySubmission?.submittedAt || null,
			};
		});

		return res.json(assignmentsWithStatus);
	} catch (error) {
		console.error("Error fetching student assignments:", error.message);
		return res.status(500).json({ error: "Internal Server Error" });
	}
};

export const getAssignmentById = async (req, res) => {
	try {
		let assignment = await Assignment.findById(req.params.assignmentId)
			.populate("classId", "className section students teacherId")
			.populate("teacherId", "fullName email userCode profilePicture subjects");

		if (!assignment) {
			return res.status(404).json({ error: "Assignment not found" });
		}

		if (req.user?.role === "teacher" && assignment.teacherId?._id?.toString() !== req.user._id.toString()) {
			return res.status(403).json({ error: "You can only view your own assignments" });
		}

		if (req.user?.role === "student") {
			const studentClassId = req.user.classId?._id?.toString() ?? req.user.classId?.toString();
			const assignmentClassId = assignment.classId?._id?.toString() ?? assignment.classId?.toString();

			if (!studentClassId || studentClassId !== assignmentClassId) {
				return res.status(403).json({ error: "You can only view assignments from your own class" });
			}
		}

		if (req.user?.role === "student") {
			const mySubmission = await Submission.findOne({ assignmentId: assignment._id, studentId: req.user._id }).select("status submittedAt submissionUrl subjectiveAnswer mcqAnswers obtainedMarks feedback");
			assignment = assignment.toObject();
			assignment.mySubmission = mySubmission;
			assignment.isSubmitted = Boolean(mySubmission);
		}

		return res.json(assignment);
	} catch (error) {
		console.error("Error fetching assignment details:", error.message);
		return res.status(500).json({ error: "Internal Server Error" });
	}
};

export const updateAssignment = async (req, res) => {
	try {
		const { assignmentId } = req.params;

		const assignment = await Assignment.findById(assignmentId);
		if (!assignment) return res.status(404).json({ error: "Assignment not found" });

		// Only teachers who created the assignment or admins can update
		if (req.user?.role === "teacher") {
			if (assignment.teacherId?.toString() !== req.user._id.toString()) {
				return res.status(403).json({ error: "You can only update your own assignments" });
			}
		} else if (req.user?.role !== "admin") {
			return res.status(403).json({ error: "Only teachers or admins can update assignments" });
		}

		const { title, description, assignmentType, totalMarks, dueDate, mcqQuestions } = req.body;

		if (title !== undefined) assignment.title = title.trim();
		if (description !== undefined) assignment.description = description?.trim() || "";
		if (assignmentType !== undefined) assignment.assignmentType = assignmentType;
		if (totalMarks !== undefined) assignment.totalMarks = totalMarks === "" ? undefined : Number(totalMarks);
		if (dueDate !== undefined) assignment.dueDate = dueDate;

		// parse mcqQuestions if provided
		if (mcqQuestions !== undefined) {
			if (typeof mcqQuestions === "string" && mcqQuestions.trim()) {
				try {
					assignment.mcqQuestions = JSON.parse(mcqQuestions);
				} catch {
					return res.status(400).json({ error: "mcqQuestions must be valid JSON" });
				}
			} else if (Array.isArray(mcqQuestions)) {
				assignment.mcqQuestions = mcqQuestions;
			} else {
				assignment.mcqQuestions = [];
			}
		}

		// handle optional file replacement
		if (req.file) {
			const uploadResult = await uploadBufferToCloudinary(req.file.buffer, req.file.originalname);
			assignment.fileUrl = uploadResult.secure_url || assignment.fileUrl || "";
		}

		const updated = await assignment.save();

		return res.json(updated);
	} catch (error) {
		console.error("Error updating assignment:", error.message);
		return res.status(500).json({ error: "Internal Server Error" });
	}
};

export const deleteAssignment = async (req, res) => {
	try {
		const { assignmentId } = req.params;

		const assignment = await Assignment.findById(assignmentId);
		if (!assignment) return res.status(404).json({ error: "Assignment not found" });

		// Only teachers who created the assignment or admins can delete
		if (req.user?.role === "teacher") {
			if (assignment.teacherId?.toString() !== req.user._id.toString()) {
				return res.status(403).json({ error: "You can only delete your own assignments" });
			}
		} else if (req.user?.role !== "admin") {
			return res.status(403).json({ error: "Only teachers or admins can delete assignments" });
		}

		// delete related submissions
		try {
			await Submission.deleteMany({ assignmentId: assignment._id });
		} catch (err) {
			console.error("Failed to delete submissions for assignment:", err.message);
		}

		await Assignment.findByIdAndDelete(assignmentId);

		return res.json({ message: "Assignment deleted" });
	} catch (error) {
		console.error("Error deleting assignment:", error.message);
		return res.status(500).json({ error: "Internal Server Error" });
	}
};