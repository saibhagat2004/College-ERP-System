
import mongoose from "mongoose";

const studyMaterialSchema = new mongoose.Schema(
{
    title: {
        type: String,
        required: true
    },

    description: {
        type: String
    },

    subject: {
        type: String,
        required: true
    },

    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
        required: true
    },

    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    fileUrl: {
        type: String,
        required: true
    }
},
{
    timestamps: true
}
);

export default mongoose.model("StudyMaterial", studyMaterialSchema);