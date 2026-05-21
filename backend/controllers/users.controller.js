import User from "../models/user.model.js"
import Class from "../models/class.model.js"
import bcrypt from "bcryptjs"

export const createUser = async (req, res) => {
	try {
		const {
			fullName = "",
			username,
			email,
			password,
			role,
			userCode,
			rollNo,
			classId,
			subjects,
			assignedClasses,
			profilePicture,
		} = req.body;
		const normalizedClassId = classId && typeof classId === "object" ? classId._id : classId;

		if (!role || !["admin", "teacher", "student"].includes(role)) {
			return res.status(400).json({ error: "Invalid or missing role" });
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!email || !emailRegex.test(email)) {
			return res.status(400).json({ error: "Invalid or missing email" });
		}

		const existingEmail = await User.findOne({ email });
		if (existingEmail) return res.status(400).json({ error: "Email already taken" });

		if (username) {
			const existingUser = await User.findOne({ username });
			if (existingUser) return res.status(400).json({ error: "Username already taken" });
		}

		if (!userCode) {
			return res.status(400).json({ error: "User code is required" });
		}

		const existingUserCode = await User.findOne({ userCode });
		if (existingUserCode) return res.status(400).json({ error: "User code already taken" });

		let hashedPassword;
		if (password) {
			if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });
			const salt = await bcrypt.genSalt(10);
			hashedPassword = await bcrypt.hash(password, salt);
		}

		const userData = {
			fullName,
			username,
			email,
			role,
			userCode,
			profilePicture: profilePicture || "",
		};

		if (hashedPassword) userData.password = hashedPassword;

		if (role === "student") {
			if (rollNo) userData.rollNo = rollNo;
			if (normalizedClassId) userData.classId = normalizedClassId;
		}

		if (role === "teacher") {
			if (subjects) {
				userData.subjects = Array.isArray(subjects)
					? subjects
					: String(subjects)
							.split(",")
							.map((s) => s.trim())
							.filter(Boolean);
			}
			if (assignedClasses) {
				userData.assignedClasses = Array.isArray(assignedClasses)
					? assignedClasses
					: String(assignedClasses)
							.split(",")
							.map((s) => s.trim())
							.filter(Boolean);
			}
		}

		const newUser = new User(userData);
		await newUser.save();

		if (role === "student" && normalizedClassId) {
			const classDoc = await Class.findById(normalizedClassId);
			if (!classDoc) {
				await User.findByIdAndDelete(newUser._id);
				return res.status(400).json({ error: "Invalid classId" });
			}

			await Class.findByIdAndUpdate(normalizedClassId, {
				$addToSet: { students: newUser._id },
			});
		}

		const resp = await User.findById(newUser._id).select("-password");
		res.status(201).json(resp);
	} catch (error) {
		console.error("Error in createUser:", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const updateUser = async (req, res) => {
	try {
		const { userId, updates } = req.body;
		if (!userId || !updates) return res.status(400).json({ error: "Missing userId or updates" });

		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ error: "User not found" });

		Object.keys(updates).forEach((key) => {
			if (key === "password") return; // don't allow password update here
			user[key] = updates[key];
		});

		if (updates.classId && typeof updates.classId === "object") {
			user.classId = updates.classId._id;
		}

		if (!user.userCode) {
			return res.status(400).json({ error: "User code is required" });
		}

		if (updates.userCode) {
			const existingUserCode = await User.findOne({ userCode: updates.userCode });
			if (existingUserCode && existingUserCode._id.toString() !== userId) {
				return res.status(400).json({ error: "User code already taken" });
			}
		}

		await user.save();
		res.status(200).json({ message: "User updated successfully" });
	} catch (error) {
		console.error("Error in updateUser:", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const updateUserRole = async (req, res) => {
	try {
		const { userId, newRole } = req.body;
		if (!userId || !newRole) return res.status(400).json({ error: "Missing userId or newRole" });
		if (!["admin", "teacher", "student"].includes(newRole)) return res.status(400).json({ error: "Invalid role" });

		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ error: "User not found" });

		if (!user.userCode) {
			return res.status(400).json({ error: "User code is required" });
		}

		user.role = newRole;
		await user.save();
		res.status(200).json({ message: "Role updated" });
	} catch (error) {
		console.error("Error in updateUserRole:", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const createAdmin = async (req, res) => {
	try {
		// Ensure role is admin
		req.body.role = "admin";
		return await createUser(req, res);
	} catch (error) {
		console.error("Error in createAdmin:", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const deleteUser = async (req, res) => {
	try {
		const userId = req.params.id;
		if (!userId) return res.status(400).json({ error: "Missing user id" });

		// prevent admin from deleting themselves
		if (req.user && req.user._id && req.user._id.toString() === userId) {
			return res.status(400).json({ error: "Cannot delete the currently authenticated admin" });
		}

		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ error: "User not found" });

		await User.findByIdAndDelete(userId);
		res.status(200).json({ message: "User deleted" });
	} catch (error) {
		console.error("Error in deleteUser:", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const getTeachers = async (req, res) => {
	try {
		const teachers = await User.find({ role: "teacher" }).select("fullName userCode email");
		return res.status(200).json(teachers);
	} catch (error) {
		console.error("Error in getTeachers:", error.message);
		return res.status(500).json({ error: "Internal Server Error" });
	}
};

export default {};

