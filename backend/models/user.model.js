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

    feesStatus: {
        type: String,
        enum: ["paid", "pending"],
        required: function () {            //if role = student → feesStatus MUST exist
            return this.role === "student";
        },
        default: function () {
            return this.role === "student" ? "pending" : undefined;
        }
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
