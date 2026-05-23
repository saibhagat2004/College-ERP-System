import Class from "../models/class.model.js";
import User from "../models/user.model.js";

export const createClass = async (req, res) => {
  try {
    const {
      className,
      section,
      userCode,
      feesStructure = {},
    } = req.body; // expect teacher userCode in `userCode`

    if (!userCode) return res.status(400).json({ error: "Missing teacher userCode" });

    const teacher = await User.findOne({ userCode, role: "teacher" });
    if (!teacher) return res.status(400).json({ error: "Invalid teacher userCode" });

    const newClass = await Class.create({
      className,
      section,
      teacherId: teacher._id,
      feesStructure: {
        tuitionFees: Number(feesStructure.tuitionFees) || 0,
        developmentFees: Number(feesStructure.developmentFees) || 0,
      },
    });

    // Add this class to the teacher's assignedClasses (avoid duplicates)
    try {
      await User.findByIdAndUpdate(teacher._id, { $addToSet: { assignedClasses: newClass._id } });
    } catch (err) {
      console.error("Failed to add class to teacher.assignedClasses:", err.message);
    }

    return res.status(201).json(newClass);
  } catch (error) {
    console.error("Error creating class:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

export const getClasses = async (req, res) => {
  try {
    const classes = await Class.find().populate("teacherId students", "fullName email userCode");
    return res.json(classes);
  } catch (error) {
    console.error("Error fetching classes:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

export const getMyClass = async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ error: "Only students can access this route" });
    }

    const classId = req.user.classId?._id ?? req.user.classId;

    if (!classId) {
      return res.status(404).json({ error: "No class assigned to this student" });
    }

    const cls = await Class.findById(classId).populate([
      {
        path: "teacherId",
        select: "fullName email userCode profilePicture role subjects assignedClasses",
      },
      {
        path: "students",
        select: "fullName email userCode profilePicture role rollNo classId gender",
      },
    ]);

    if (!cls) {
      return res.status(404).json({ error: "Class not found" });
    }

    return res.json(cls);
  } catch (error) {
    console.error("Error fetching student class:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

export const getClassById = async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id).populate("teacherId students", "fullName email userCode");
    if (!cls) return res.status(404).json({ error: "Class not found" });
    return res.json(cls);
  } catch (error) {
    console.error("Error fetching class:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

export const updateClass = async (req, res) => {
  try {
    const {
      className,
      section,
      userCode,
      feesStructure,
    } = req.body; // expect teacher userCode when updating

    const updatePayload = {};
    if (className !== undefined) updatePayload.className = className;
    if (section !== undefined) updatePayload.section = section;
    if (feesStructure !== undefined) {
      updatePayload.feesStructure = {
        tuitionFees: Number(feesStructure.tuitionFees) || 0,
        developmentFees: Number(feesStructure.developmentFees) || 0,
      };
    }

    let newTeacher = null;
    if (userCode !== undefined) {
      newTeacher = await User.findOne({ userCode, role: "teacher" });
      if (!newTeacher) return res.status(400).json({ error: "Invalid teacher userCode" });
      updatePayload.teacherId = newTeacher._id;
    }

    // Fetch existing class to detect teacher change
    const existingClass = await Class.findById(req.params.id);
    if (!existingClass) return res.status(404).json({ error: "Class not found" });

    const updated = await Class.findByIdAndUpdate(req.params.id, updatePayload, { new: true });
    if (!updated) return res.status(404).json({ error: "Class not found" });

    // If teacher changed, update assignedClasses for old and new teachers
    try {
      const oldTeacherId = existingClass.teacherId?.toString();
      const newTeacherId = updated.teacherId?.toString();

      if (oldTeacherId && oldTeacherId !== newTeacherId) {
        await User.findByIdAndUpdate(oldTeacherId, { $pull: { assignedClasses: updated._id } });
      }

      if (newTeacherId && oldTeacherId !== newTeacherId) {
        await User.findByIdAndUpdate(newTeacherId, { $addToSet: { assignedClasses: updated._id } });
      }
    } catch (err) {
      console.error("Failed to sync teacher assignedClasses during class update:", err.message);
    }

    return res.json(updated);
  } catch (error) {
    console.error("Error updating class:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

export const deleteClass = async (req, res) => {
  try {
    const deleted = await Class.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Class not found" });

    // Remove this class id from the teacher's assignedClasses
    try {
      if (deleted.teacherId) {
        await User.findByIdAndUpdate(deleted.teacherId, { $pull: { assignedClasses: deleted._id } });
      }
    } catch (err) {
      console.error("Failed to remove class from teacher.assignedClasses on delete:", err.message);
    }

    return res.json({ message: "Class deleted" });
  } catch (error) {
    console.error("Error deleting class:", error.message);
    return res.status(500).json({ error: error.message });
  }
};
