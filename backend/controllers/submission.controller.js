import { v2 as cloudinary } from "cloudinary";
import Assignment from "../models/assignment.model.js";
import Submission from "../models/submission.model.js";

const uploadBufferToCloudinary = (fileBuffer, fileName) =>
	new Promise((resolve, reject) => {
		const stream = cloudinary.uploader.upload_stream(
			{
				resource_type: "auto",
				folder: "college-erp/submissions",
				public_id: fileName,
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

export const submitAssignment = async (req, res) => {
	try {
		if (req.user.role !== "student") {
			return res.status(403).json({ error: "Only students can submit assignments" });
		}

		const { assignmentId } = req.params;
		const { subjectiveAnswer, mcqAnswers } = req.body;
		const assignment = await Assignment.findById(assignmentId);

		if (!assignment) {
			return res.status(404).json({ error: "Assignment not found" });
		}

		const studentClassId = req.user.classId?._id?.toString() ?? req.user.classId?.toString();
		const assignmentClassId = assignment.classId?.toString();

		if (!studentClassId || studentClassId !== assignmentClassId) {
			return res.status(403).json({ error: "You can only submit assignments from your own class" });
		}

		const existingSubmission = await Submission.findOne({ assignmentId, studentId: req.user._id });
		if (existingSubmission) {
			return res.status(400).json({ error: "You already submitted this assignment" });
		}

		let submissionUrl = "";
		if (req.file) {
			const uploadResult = await uploadBufferToCloudinary(req.file.buffer, req.file.originalname);
			submissionUrl = uploadResult.secure_url || "";
		}

		let parsedMcqAnswers = [];
		if (typeof mcqAnswers === "string" && mcqAnswers.trim()) {
			try {
				parsedMcqAnswers = JSON.parse(mcqAnswers);
			} catch {
				return res.status(400).json({ error: "mcqAnswers must be valid JSON" });
			}
		} else if (Array.isArray(mcqAnswers)) {
			parsedMcqAnswers = mcqAnswers;
		}

		const cleanedAnswer = subjectiveAnswer?.trim() || "";
		if (assignment.assignmentType === "mcq" && parsedMcqAnswers.length === 0) {
			return res.status(400).json({ error: "Submit answers for the MCQ assignment" });
		}

		if (assignment.assignmentType !== "mcq" && !cleanedAnswer && !submissionUrl) {
			return res.status(400).json({ error: "Provide a file or a subjective answer" });
		}

		const status = new Date() > new Date(assignment.dueDate) ? "late" : "submitted";
		const submission = await Submission.create({
			assignmentId,
			studentId: req.user._id,
			submissionUrl,
			subjectiveAnswer: cleanedAnswer,
			mcqAnswers: parsedMcqAnswers,
			status,
			submittedAt: new Date(),
		});

		await Assignment.findByIdAndUpdate(assignmentId, {
			$push: {
				submittedAssignments: {
					submissionId: submission._id,
					studentId: req.user._id,
					submittedAt: submission.submittedAt,
					status,
				},
			},
		});

		return res.status(201).json(submission);
	} catch (error) {
		console.error("Error submitting assignment:", error.message);
		return res.status(500).json({ error: "Internal Server Error" });
	}
};

export const getSubmissionsByAssignment = async (req, res) => {
	try {
		const { assignmentId } = req.params;
		const assignment = await Assignment.findById(assignmentId);

		if (!assignment) {
			return res.status(404).json({ error: "Assignment not found" });
		}

		if (req.user.role === "teacher" && assignment.teacherId.toString() !== req.user._id.toString()) {
			return res.status(403).json({ error: "You can only view submissions for your own assignments" });
		}

		const submissions = await Submission.find({ assignmentId })
			.populate("studentId", "fullName email userCode rollNo profilePicture role")
			.populate("assignmentId", "title assignmentType dueDate classId teacherId")
			.sort({ submittedAt: -1, createdAt: -1 });

		return res.json(submissions);
	} catch (error) {
		console.error("Error fetching submissions:", error.message);
		return res.status(500).json({ error: "Internal Server Error" });
	}
};