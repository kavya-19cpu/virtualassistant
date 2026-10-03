import geminiResponse from "../gemini.js";
import User from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import moment from "moment";


// =====================================================
// GET CURRENT USER
// =====================================================

export const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json(user);

    } catch (error) {
        return res.status(500).json({
            message: "Get current user error",
            error: error.message
        });
    }
};


// =====================================================
// UPDATE ASSISTANT
// =====================================================

export const updateAssistant = async (req, res) => {
    try {
        const { assistantName, imageUrl } = req.body;

        let finalImageUrl = imageUrl;

        if (req.file) {
            finalImageUrl = await uploadOnCloudinary(
                req.file.path
            );
        }

        const updateData = {};

        if (
            assistantName &&
            assistantName.trim()
        ) {
            updateData.assistantName =
                assistantName.trim();
        }

        if (finalImageUrl) {
            updateData.assistantImage =
                finalImageUrl;
        }

        const user = await User.findByIdAndUpdate(
            req.userId,
            updateData,
            {
                new: true
            }
        ).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json(user);

    } catch (error) {
        console.error(
            "UPDATE ASSISTANT ERROR:",
            error
        );

        return res.status(500).json({
            message: "Update assistant error",
            error: error.message
        });
    }
};


// =====================================================
// SAVE HISTORY
// =====================================================

export const saveHistory = async (req, res) => {
    try {
        const { command, answer } = req.body;

        if (
            typeof command !== "string" ||
            typeof answer !== "string"
        ) {
            return res.status(400).json({
                message: "Command and answer must be strings"
            });
        }

        const trimmedCommand = command.trim();
        const trimmedAnswer = answer.trim();

        if (
            !trimmedCommand ||
            !trimmedAnswer
        ) {
            return res.status(400).json({
                message: "Command and answer cannot be empty"
            });
        }

        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Save history permanently in this user's account
        user.history.unshift({
            command: trimmedCommand,
            answer: trimmedAnswer
        });

        // IMPORTANT:
        // No 50-item limit.
        // History remains stored in MongoDB.

        await user.save();

        return res.status(200).json({
            message: "History saved",
            history: user.history
        });

    } catch (error) {
        console.error(
            "SAVE HISTORY ERROR:",
            error
        );

        return res.status(500).json({
            message: "Could not save history",
            error: error.message
        });
    }
};


// =====================================================
// ASK ASSISTANT
// =====================================================

export const askToAssistant = async (req, res) => {
    try {
        const { command } = req.body;

        if (
            !command ||
            typeof command !== "string"
        ) {
            return res.status(400).json({
                message: "Command is required"
            });
        }

        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const userName =
            user.name || "User";

        const assistantName =
            user.assistantName || "Assistant";

        const lowerCommand =
            command.toLowerCase().trim();


        // =================================================
        // ASSISTANT NAME
        // =================================================

        if (
            lowerCommand.includes("what is your name") ||
            lowerCommand.includes("who are you") ||
            lowerCommand.includes("your name")
        ) {
            return res.status(200).json({
                type: "general",
                userInput: command,
                response:
                    `My name is ${assistantName}.`
            });
        }


        // =================================================
        // CREATOR
        // =================================================

        if (
            lowerCommand.includes("who created you") ||
            lowerCommand.includes("who made you") ||
            lowerCommand.includes("who is your creator")
        ) {
            return res.status(200).json({
                type: "general",
                userInput: command,
                response:
                    "I was created by my developer."
            });
        }


        // =================================================
        // TIME
        // =================================================

        if (
            lowerCommand.includes("what time is it") ||
            lowerCommand === "time" ||
            lowerCommand.includes("current time")
        ) {
            return res.status(200).json({
                type: "general",
                userInput: command,
                response:
                    `The current time is ${moment().format("hh:mm A")}.`
            });
        }


        // =================================================
        // DATE
        // =================================================

        if (
            lowerCommand.includes("what is today's date") ||
            lowerCommand.includes("what is the date") ||
            lowerCommand === "date" ||
            lowerCommand.includes("today's date")
        ) {
            return res.status(200).json({
                type: "general",
                userInput: command,
                response:
                    `Today's date is ${moment().format("DD MMMM YYYY")}.`
            });
        }


        // =================================================
        // DAY
        // =================================================

        if (
            lowerCommand.includes("what day is it") ||
            lowerCommand === "day" ||
            lowerCommand.includes("today's day")
        ) {
            return res.status(200).json({
                type: "general",
                userInput: command,
                response:
                    `Today is ${moment().format("dddd")}.`
            });
        }


        // =================================================
        // MONTH
        // =================================================

        if (
            lowerCommand.includes("what month is it") ||
            lowerCommand === "month"
        ) {
            return res.status(200).json({
                type: "general",
                userInput: command,
                response:
                    `This month is ${moment().format("MMMM")}.`
            });
        }


        // =================================================
        // GEMINI
        // =================================================

        const result = await geminiResponse(
            command,
            assistantName,
            userName
        );

        let data = result;

        if (typeof result === "string") {
            try {
                data = JSON.parse(result);
            } catch {
                data = {
                    type: "general",
                    response: result
                };
            }
        }

        return res.status(200).json({
            type: data?.type || "general",
            userInput: command,
            response:
                data?.response ||
                data?.answer ||
                "Sorry, I could not understand that."
        });

    } catch (error) {
        console.error(
            "ASK ASSISTANT ERROR:",
            error
        );

        return res.status(500).json({
            message: "Assistant error",
            error: error.message
        });
    }
};