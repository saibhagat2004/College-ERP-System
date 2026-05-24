import Notice from "../models/notice.model.js";
import Class from "../models/class.model.js";

const parseBoolean = (value) => value === true || value === "true" || value === 1 || value === "1";

const buildNoticeFilter = (req) => {
	const { classId } = req.query;
	const requestedClassId = classId || req.user?.classId?._id || req.user?.classId;

	if (!requestedClassId) {
		return {};
	}

	return {
		$or: [{ classId: requestedClassId }, { isForAllClasses: true }],
	};
};

export const createNotice = async (req, res) => {
	try {
		const { title, description, noticeType = "notice", fileUrl, classId } = req.body;
		const isForAllClasses = parseBoolean(req.body.isForAllClasses);

		if (!title || !description) {
			return res.status(400).json({ error: "Title and description are required" });
		}

		let targetClassId = null;
		if (!isForAllClasses) {
			if (!classId) {
				return res.status(400).json({ error: "classId is required when notice is not for all classes" });
			}

			const classDoc = await Class.findById(classId);
			if (!classDoc) {
				return res.status(400).json({ error: "Invalid classId" });
			}

			targetClassId = classDoc._id;
		}

		const notice = await Notice.create({
			title,
			description,
			createdBy: req.user._id,
			classId: targetClassId,
			noticeType,
			fileUrl,
			isForAllClasses,
		});

		return res.status(201).json(notice);
	} catch (error) {
		console.error("Error creating notice:", error.message);
		return res.status(500).json({ error: "Internal Server Error" });
	}
};

export const updateNotice = async (req, res) => {
	try {
		const notice = await Notice.findById(req.params.id);
		if (!notice) {
			return res.status(404).json({ error: "Notice not found" });
		}

		const { title, description, noticeType, fileUrl, classId } = req.body;
		const isForAllClasses = req.body.isForAllClasses;

		if (title !== undefined) notice.title = title;
		if (description !== undefined) notice.description = description;
		if (noticeType !== undefined) notice.noticeType = noticeType;
		if (fileUrl !== undefined) notice.fileUrl = fileUrl;

		if (isForAllClasses !== undefined) {
			notice.isForAllClasses = parseBoolean(isForAllClasses);
			if (notice.isForAllClasses) {
				notice.classId = null;
			}
		}

		if (classId !== undefined) {
			if (classId === null || classId === "") {
				notice.classId = null;
			} else {
				const classDoc = await Class.findById(classId);
				if (!classDoc) {
					return res.status(400).json({ error: "Invalid classId" });
				}

				notice.classId = classDoc._id;
				notice.isForAllClasses = false;
			}
		}

		await notice.save();
		return res.json(notice);
	} catch (error) {
		console.error("Error updating notice:", error.message);
		return res.status(500).json({ error: "Internal Server Error" });
	}
};

export const deleteNotice = async (req, res) => {
	try {
		const deletedNotice = await Notice.findByIdAndDelete(req.params.id);
		if (!deletedNotice) {
			return res.status(404).json({ error: "Notice not found" });
		}

		return res.json({ message: "Notice deleted" });
	} catch (error) {
		console.error("Error deleting notice:", error.message);
		return res.status(500).json({ error: "Internal Server Error" });
	}
};

export const getNotices = async (req, res) => {
	try {
		const filter = buildNoticeFilter(req);
		const notices = await Notice.find(filter)
			.populate("createdBy", "fullName email userCode role profilePicture")
			.populate("classId", "className section")
			.sort({ createdAt: -1 });

		return res.json(notices);
	} catch (error) {
		console.error("Error fetching notices:", error.message);
		return res.status(500).json({ error: "Internal Server Error" });
	}
};
