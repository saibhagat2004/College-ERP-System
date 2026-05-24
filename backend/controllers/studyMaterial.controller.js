import { v2 as cloudinary } from "cloudinary";
import Class from "../models/class.model.js";
import StudyMaterial from "../models/studyMaterialSchema.model.js";

const uploadBufferToCloudinary = (fileBuffer, fileName) =>
	new Promise((resolve, reject) => {
		const cleanFileName = fileName.replace(/\.[^/.]+$/, "");
		const stream = cloudinary.uploader.upload_stream(
			{
				resource_type: "image",
				folder: "college-erp/study-materials",
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

const parseMaybeJSON = (value) => {
	if (typeof value === "string" && value.trim()) {
		try {
			return JSON.parse(value);
		} catch {
			return value;
		}
	}

	return value;
};

export const createStudyMaterial = async (req, res) => {
	try {
		const { title, description, subject, classId, teacherId } = req.body;

		if (!title?.trim() || !subject?.trim() || !classId) {
			return res.status(400).json({ error: "title, subject and classId are required" });
		}

		const cls = await Class.findById(classId);
		if (!cls) {
			return res.status(404).json({ error: "Class not found" });
		}

		let assignedTeacherId = req.user._id;
		if (req.user.role === "admin" && teacherId) {
			assignedTeacherId = teacherId;
		}

		if (req.user.role === "teacher") {
			const ownsClass = cls.teacherId?.toString() === req.user._id.toString();
			if (!ownsClass) {
				return res.status(403).json({ error: "You can only upload material for your own classes" });
			}
		}

		let fileUrl = "";
		if (req.file) {
			const uploadResult = await uploadBufferToCloudinary(req.file.buffer, req.file.originalname);
			fileUrl = uploadResult.secure_url || "";
		}

		if (!fileUrl) {
			return res.status(400).json({ error: "A file is required" });
		}

		const studyMaterial = await StudyMaterial.create({
			title: title.trim(),
			description: description?.trim() || "",
			subject: subject.trim(),
			classId,
			teacherId: assignedTeacherId,
			fileUrl,
		});

		return res.status(201).json(studyMaterial);
	} catch (error) {
		console.error("Error creating study material:", error.message);
		return res.status(500).json({ error: "Internal Server Error" });
	}
};

export const updateStudyMaterial = async (req, res) => {
	try {
		const { id } = req.params;
		const studyMaterial = await StudyMaterial.findById(id);

		if (!studyMaterial) {
			return res.status(404).json({ error: "Study material not found" });
		}

		if (studyMaterial.teacherId.toString() !== req.user._id.toString()) {
			return res.status(403).json({ error: "You can only update your own study materials" });
		}

		const nextClassId = req.body.classId || studyMaterial.classId;
		if (req.body.classId) {
			const cls = await Class.findById(req.body.classId);
			if (!cls) {
				return res.status(404).json({ error: "Class not found" });
			}

			if (req.user.role === "teacher" && cls.teacherId?.toString() !== req.user._id.toString()) {
				return res.status(403).json({ error: "You can only move material to your own classes" });
			}
		}

		let fileUrl = studyMaterial.fileUrl;
		if (req.file) {
			const uploadResult = await uploadBufferToCloudinary(req.file.buffer, req.file.originalname);
			fileUrl = uploadResult.secure_url || fileUrl;
		}

		studyMaterial.title = req.body.title?.trim() || studyMaterial.title;
		studyMaterial.description = req.body.description?.trim() || "";
		studyMaterial.subject = req.body.subject?.trim() || studyMaterial.subject;
		studyMaterial.classId = nextClassId;
		studyMaterial.fileUrl = fileUrl;

		await studyMaterial.save();

		return res.json(studyMaterial);
	} catch (error) {
		console.error("Error updating study material:", error.message);
		return res.status(500).json({ error: "Internal Server Error" });
	}
};

export const deleteStudyMaterial = async (req, res) => {
	try {
		const { id } = req.params;
		const studyMaterial = await StudyMaterial.findById(id);

		if (!studyMaterial) {
			return res.status(404).json({ error: "Study material not found" });
		}

		if (studyMaterial.teacherId.toString() !== req.user._id.toString()) {
			return res.status(403).json({ error: "You can only delete your own study materials" });
		}

		await StudyMaterial.findByIdAndDelete(id);

		return res.json({ message: "Study material deleted successfully" });
	} catch (error) {
		console.error("Error deleting study material:", error.message);
		return res.status(500).json({ error: "Internal Server Error" });
	}
};

export const getStudyMaterials = async (req, res) => {
	try {
		let filter = {};

		if (req.user.role === "student") {
			const classId = req.user.classId?._id?.toString() ?? req.user.classId?.toString();
			if (!classId) {
				return res.status(404).json({ error: "No class assigned to this student" });
			}

			filter = { classId };
		}

		if (req.user.role === "teacher") {
			filter = { teacherId: req.user._id };
		}

		const studyMaterials = await StudyMaterial.find(filter)
			.populate("classId", "className section")
			.populate("teacherId", "fullName email userCode profilePicture")
			.sort({ createdAt: -1 });

		return res.json(studyMaterials);
	} catch (error) {
		console.error("Error fetching study materials:", error.message);
		return res.status(500).json({ error: "Internal Server Error" });
	}
};