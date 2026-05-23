import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      sparse: true, // Allows Google users to sign up without a username
    },
    fullName: {
      type: String,
      required: false,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },
    password: {
      type: String,
      minLength: 6,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    profilePicture: {
      type: String,
      default: "",
    },

    userCode: {
      type: String,
      unique: true
    },
  
    role: {
        type: String,
        enum: ["admin", "teacher", "student"],
        required: true
    },
     // Student Fields
    rollNo: {
        type: String
    },

    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class"
    },

    fees: {
      tuitionFees: {
        type: Number,
        min: 0,
        default: 0,
      },
      developmentFees: {
        type: Number,
        min: 0,
        default: 0,
      },
      totalFees: {
        type: Number,
        min: 0,
        default: 0,
      },
      paidAmount: {
        type: Number,
        min: 0,
        default: 0,
      },
      remainingAmount: {
        type: Number,
        min: 0,
        default: 0,
      },
      paymentStatus: {
        type: String,
        enum: ["paid", "pending", "partial"],
        default: "pending",
      },
    },

    // Teacher Fields
    subjects: [
        {
            type: String
        }
    ],

    assignedClasses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Class"
        }
    ]
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
