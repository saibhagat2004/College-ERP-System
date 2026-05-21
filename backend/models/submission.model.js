// SUBMISSION SCHEMA
const submissionSchema = new mongoose.Schema(
{
    assignmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Assignment",
        required: true
    },

    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    submissionUrl: {
        type: String
    },

    subjectiveAnswer: {
        type: String
    },

    obtainedMarks: {
        type: Number,
        default: 0
    },

    feedback: {
        type: String
    },

    status: {
        type: String,
        enum: ["pending", "submitted", "evaluated", "late"],
        default: "pending"
    },

    submittedAt: {
        type: Date
    }
},
{
    timestamps: true
}
)

export default mongoose.model("Submission", submissionSchema)