import Class from "../models/class.model.js";
import User from "../models/user.model.js";

export const createClass = async (req, res) => {
  try {
    const { className, section, userCode } = req.body; // expect teacher userCode in `userCode`

    if (!userCode) return res.status(400).json({ error: "Missing teacher userCode" });

    const teacher = await User.findOne({ userCode, role: "teacher" });
    if (!teacher) return res.status(400).json({ error: "Invalid teacher userCode" });

    const newClass = await Class.create({
      className,
      section,
      teacherId: teacher._id,
    });

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
    const { className, section, userCode } = req.body; // expect teacher userCode when updating

    const updatePayload = {};
    if (className !== undefined) updatePayload.className = className;
    if (section !== undefined) updatePayload.section = section;

    if (userCode !== undefined) {
      const teacher = await User.findOne({ userCode, role: "teacher" });
      if (!teacher) return res.status(400).json({ error: "Invalid teacher userCode" });
      updatePayload.teacherId = teacher._id;
    }

    const updated = await Class.findByIdAndUpdate(req.params.id, updatePayload, { new: true });
    if (!updated) return res.status(404).json({ error: "Class not found" });
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
    return res.json({ message: "Class deleted" });
  } catch (error) {
    console.error("Error deleting class:", error.message);
    return res.status(500).json({ error: error.message });
  }
};
