import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema(
{
    title: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
        default: null
    },

    noticeType: {
        type: String,
        enum: ["notice", "circular", "announcement"],
        default: "notice"
    },

    fileUrl: {
        type: String
    },

    isForAllClasses: {
        type: Boolean,
        default: false
    }
},
{
    timestamps: true
}
);

export default mongoose.model("Notice", noticeSchema);