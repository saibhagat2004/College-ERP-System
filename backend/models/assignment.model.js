import mongoose from "mongoose";

// ASSIGNMENT SCHEMA
const assignmentSchema = new mongoose.Schema(
{
    title: {
        type: String,
        required: true
    },

    description: {
        type: String
    },

    assignmentType: {
        type: String,
        enum: ["mcq", "subjective"],
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

    totalMarks: {
        type: Number,
        // required: true
    },

    dueDate: {
        type: Date,
        required: true
    },

    fileUrl: {
        type: String
    },

    submittedAssignments: [
        {
            submissionId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Submission",
            },

            studentId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },

            submittedAt: {
                type: Date,
            },

            status: {
                type: String,
                enum: ["submitted", "late"],
            },
        }
    ],

    mcqQuestions: [
        {
            question: String,
            options: [String],
            correctAnswer: String
        }
    ]
},
{
    timestamps: true
}
)

export default mongoose.model("Assignment", assignmentSchema)