import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
        },
        fullName: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
        },
        /*lastLogin: {
            type: Date,
            default: Date.now
        },
        isVerified: {
            type: Boolean,
            default: false
        },*/
        profilePic: {
            type: String,
            default: "",
        },
        /*resetPasswordToken: String,
        resetPasswordExpiredAt: Date,
        verificationToken: String,
        verificationTokenExpiredAt: Date,*/

    },
    { timestamps: true }
)

const User = mongoose.model("User", userSchema)

export default User