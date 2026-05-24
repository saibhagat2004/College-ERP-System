import Assignment from "../models/assignment.model.js";
import Class from "../models/class.model.js";
import Submission from "../models/submission.model.js";
import { v2 as cloudinary } from "cloudinary";


const uploadBufferToCloudinary = (fileBuffer, fileName) =>
	new Promise((resolve, reject) => {

		// remove extension from filename
		const cleanFileName =
			fileName.replace(/\.[^/.]+$/, "");

		const stream = cloudinary.uploader.upload_stream(
			{
				resource_type: "image",
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

				console.log(result);
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