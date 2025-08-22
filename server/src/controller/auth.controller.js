import cloudinary from "../lib/cloudinary.js";
import { generateJWT, generateVerificationCode } from "../lib/utils.js";
import { sendEmail } from "../lib/nodemailer.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { VERIFICATION_EMAIL_TEMPLATE } from "../mailtrap/emailTemplate.js";

export const signup = async (req, res) => {
    const {fullName, email, password} = req.body;
    try {

        if (!fullName || !email || !password) {
            return res.status(400).json({message: 'Nhập tất cả các trường'});
        }
        // mã hóa mk
        if (password.length < 6) {
            return res.status(400).json({ message: "Mật khẩu phải ít nhất có 6 ký tự"});
        } else if (password.length > 20)
            return res.status(400).json({message: "Mật khẩu không được quá 20 ký tự"});

        const user = await User.findOne({email});

        if (user) 
            return res.status(400).json({message: "Email đã tồn tại"});
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password,salt);

        const newUser = new User({
            fullName,
            email,
            password: hashedPass,
        });

        if (newUser) {
            generateJWT(newUser._id, res);
            await newUser.save();

            res.status(201).json({
                success: true,
                message: "Đăng ký thành công",
                newUser: {
                    ...newUser._doc,
                    password: undefined
                }
            });
        } else {
            res.status(400).json({message: "Dữ liệu không hợp lệ"});
        }
    } catch (error) {
        console.log("Lỗi đăng ký trong server: ", error.message);
        res.status(500).json({message: "Lỗi đăng ký controller"});
    }
};

export const login = async (req, res) => {
    const {email, password} = req.body;
    try {
        const user = await User.findOne({email});
        if (!user) {
            return res.status(400).json({message: "Email không hợp lệ, vui lòng thử lại"});
        }

        const isPassCorrect = await bcrypt.compare(password, user.password);
        if(!isPassCorrect) {
            return res.status(400).json({message: "Mật khẩu sai, vui lòng thử lại"});
        }

        const code = generateVerificationCode();
        user.twoFactorAuthCode = code;
        user.twoFactorAuthCodeExpiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save();

        const emailBody = VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", code);
        await sendEmail(user.email, 'Your 2FA Code', emailBody);

        res.status(200).json({
            message: "A 2FA code has been sent to your email.",
            email: user.email
        });
    } catch (error) {
        console.log("Lỗi đăng nhập", error.message);
        res.status(500).json({message: "Lỗi đăng nhập controller"});
    }
};

export const verifyTwoFactorAuth = async (req, res) => {
    const { email, code } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid email." });
        }

        if (user.twoFactorAuthCode !== code) {
            return res.status(400).json({ message: "Invalid 2FA code." });
        }

        if (user.twoFactorAuthCodeExpiresAt < Date.now()) {
            return res.status(400).json({ message: "2FA code has expired." });
        }

        user.twoFactorAuthCode = undefined;
        user.twoFactorAuthCodeExpiresAt = undefined;
        user.lastLogin = Date.now();
        await user.save();

        generateJWT(user._id, res);

        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
            message: "Đăng nhập thành công"
        });
    } catch (error) {
        console.log("Lỗi xác thực 2FA", error.message);
        res.status(500).json({ message: "Lỗi xác thực 2FA controller" });
    }
};

export const resendTwoFactorCode = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid email." });
        }

        const code = generateVerificationCode();
        user.twoFactorAuthCode = code;
        user.twoFactorAuthCodeExpiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save();

        const emailBody = VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", code);
        await sendEmail(user.email, 'Your New 2FA Code', emailBody);

        res.status(200).json({ message: "New 2FA code sent to your email." });
    } catch (error) {
        console.log("Lỗi gửi lại mã 2FA", error.message);
        res.status(500).json({ message: "Lỗi gửi lại mã 2FA controller" });
    }
};

export const logout = (req, res) => {
    try {
        res.cookie("jwt","",{maxAge:0});
        res.status(200).json({message: "Đăng xuất thành công"});
    } catch (error) {
        console.log("Lỗi đăng xuất ", error.message);
        res.status(500).json({message: "Lỗi đăng xuất controller"});
    }
};

export const updateProfile = async (req, res) => {
    try {
      const { profilePic } = req.body;
      const userId = req.user._id;
  
      if (!profilePic) {
        return res.status(400).json({ message: "Profile pic is required" });
      }
  
      const uploadResponse = await cloudinary.uploader.upload(profilePic);
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { profilePic: uploadResponse.secure_url },
        { new: true }
      );
  
      res.status(200).json(updatedUser);
    } catch (error) {
      console.log("error in update profile:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

export const checkAuth = (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log("Lỗi checkAuth controller", error.message);
        res.status(500).json({message: "Lỗi server"});
    }
};