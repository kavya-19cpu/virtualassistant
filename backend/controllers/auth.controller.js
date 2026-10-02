import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { genToken } from "../utils/token.js";

const cookieOptions = {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: "none",
    secure: true
};

export const signUp = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const cleanName = name?.trim();
        const cleanEmail = email?.trim().toLowerCase();

        if (!cleanName || !cleanEmail || !password) {
            return res.status(400).json({
                message: "Name, email and password are required"
            });
        }

        const nameRegex = /^[A-Za-z]+(?: [A-Za-z]+)*$/;

        if (!nameRegex.test(cleanName)) {
            return res.status(400).json({
                message: "Name should contain letters and spaces only"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });
        }

        const existEmail = await User.findOne({
            email: cleanEmail
        });

        if (existEmail) {
            return res.status(400).json({
                message: "Email already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name: cleanName,
            password: hashedPassword,
            email: cleanEmail
        });

        const token = await genToken(user._id);

        res.cookie("token", token, cookieOptions);

        return res.status(201).json(user);
    } catch (error) {
        console.error("SIGN UP ERROR:", error);

        return res.status(500).json({
            message: "Sign up error"
        });
    }
};

export const Login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const cleanEmail = email?.trim().toLowerCase();

        if (!cleanEmail || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const user = await User.findOne({
            email: cleanEmail
        });

        if (!user) {
            return res.status(400).json({
                message: "Email does not exist"
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(400).json({
                message: "Incorrect password"
            });
        }

        const token = await genToken(user._id);

        res.cookie("token", token, cookieOptions);

        return res.status(200).json(user);
    } catch (error) {
        console.error("LOGIN ERROR:", error);

        return res.status(500).json({
            message: "Login error"
        });
    }
};

export const changePassword = async (req, res) => {
    try {
        const { name, email, newPassword } = req.body;

        const cleanName = name?.trim();
        const cleanEmail = email?.trim().toLowerCase();

        if (!cleanName || !cleanEmail || !newPassword) {
            return res.status(400).json({
                message: "Name, email and new password are required"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });
        }

        const user = await User.findOne({
            name: cleanName,
            email: cleanEmail
        });

        if (!user) {
            return res.status(400).json({
                message: "Name and email do not match any account"
            });
        }

        user.password = await bcrypt.hash(
            newPassword,
            10
        );

        await user.save();

        return res.status(200).json({
            message: "Password changed successfully"
        });
    } catch (error) {
        console.error("CHANGE PASSWORD ERROR:", error);

        return res.status(500).json({
            message: "Unable to change password"
        });
    }
};

export const logOut = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            sameSite: "none",
            secure: true
        });

        return res.status(200).json({
            message: "Logout successfully"
        });
    } catch (error) {
        return res.status(500).json({
            message: "Logout error"
        });
    }
};