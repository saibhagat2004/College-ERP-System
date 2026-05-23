import mongoose from "mongoose";

// CLASS SCHEMA
const classSchema = new mongoose.Schema(
{
    className: {
        type: String,
        required: true
    },

    section: {
        type: String,
        required: true
    },

    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    feesStructure: {
        tuitionFees: {
            type: Number,
            min: 0,
            default: 0
        },
        developmentFees: {
            type: Number,
            min: 0,
            default: 0
        }
    },

    students: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ]
},
{
    timestamps: true
}
)

export default mongoose.model("Class", classSchema)