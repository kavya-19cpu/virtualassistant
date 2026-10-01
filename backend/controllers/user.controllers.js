import geminiResponse from "../gemini.js";
import User from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import moment from "moment";

export const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "user not found" });
        }
        return res.status(200).json(user);
    } catch (error) {
        console.error("GET CURRENT USER ERROR:", error);
        return res.status(500).json({
            message: "get current user error",
            error: error.message
        });
    }
};

export const updateAssistant = async (req, res) => {
    try {
        const { assistantName, imageUrl } = req.body;

        if (!req.userId) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        if (!assistantName || !assistantName.trim()) {
            return res.status(400).json({ message: "Assistant name is required" });
        }

        let assistantImage = imageUrl || "";

        if (req.file) {
            const cloudinaryResult = await uploadOnCloudinary(req.file.path);

            if (!cloudinaryResult) {
                return res.status(500).json({ message: "Image upload failed" });
            }

            assistantImage =
                cloudinaryResult.secure_url ||
                cloudinaryResult.url ||
                cloudinaryResult;
        }

        const user = await User.findByIdAndUpdate(
            req.userId,
            {
                assistantName: assistantName.trim(),
                assistantImage
            },
            {
                new: true,
                runValidators: true
            }
        ).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json(user);
    } catch (error) {
        console.error("UPDATE ASSISTANT ERROR:", error);
        return res.status(500).json({
            message: "update assistant error",
            error: error.message
        });
    }
};

export const askToAssistant = async (req, res) => {
    try {
        const { command } = req.body;

        if (!command || typeof command !== "string") {
            return res.status(400).json({
                type: "general",
                userInput: "",
                response: "Please say something."
            });
        }

        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                type: "general",
                userInput: command,
                response: "User not found."
            });
        }

        user.history.push(command);
        await user.save();
        const userName = user.name;
        const assistantName = user.assistantName || "Assistant";
        const lowerCommand = command.toLowerCase().trim();

        if (
            lowerCommand.includes("what is your name") ||
            lowerCommand.includes("what's your name") ||
            lowerCommand.includes("tell me your name") ||
            lowerCommand.includes("who are you")
        ) {
            return res.status(200).json({
                type: "general",
                userInput: command,
                response: `My name is ${assistantName}.`
            });
        }

        if (
            lowerCommand.includes("who created you") ||
            lowerCommand.includes("who made you") ||
            lowerCommand.includes("who built you") ||
            lowerCommand.includes("who developed you") ||
            lowerCommand.includes("who is your creator")
        ) {
            return res.status(200).json({
                type: "general",
                userInput: command,
                response: `I was created by ${userName}.`
            });
        }

        if (
            lowerCommand.includes("what time") ||
            lowerCommand.includes("current time") ||
            lowerCommand.includes("time now") ||
            lowerCommand.includes("tell me the time")
        ) {
            return res.status(200).json({
                type: "get_time",
                userInput: command,
                response: `Current time is ${moment().format("h:mm A")}`
            });
        }

        if (
            lowerCommand.includes("what date") ||
            lowerCommand.includes("today's date") ||
            lowerCommand.includes("todays date") ||
            lowerCommand.includes("current date")
        ) {
            return res.status(200).json({
                type: "get_date",
                userInput: command,
                response: `Today's date is ${moment().format("MMMM Do, YYYY")}`
            });
        }

        if (
            lowerCommand.includes("what day") ||
            lowerCommand.includes("which day") ||
            lowerCommand.includes("what is the day") ||
            lowerCommand.includes("what's the day") ||
            lowerCommand.includes("day today")
        ) {
            return res.status(200).json({
                type: "get_day",
                userInput: command,
                response: `Today is ${moment().format("dddd")}`
            });
        }

        if (
            lowerCommand.includes("what month") ||
            lowerCommand.includes("which month") ||
            lowerCommand.includes("current month") ||
            lowerCommand.includes("month now")
        ) {
            return res.status(200).json({
                type: "get_month",
                userInput: command,
                response: `The current month is ${moment().format("MMMM")}`
            });
        }

        const result = await geminiResponse(
            command,
            assistantName,
            userName
        );

        if (!result) {
            return res.status(500).json({
                type: "general",
                userInput: command,
                response: "Sorry, I could not get a response."
            });
        }

        let gemResult;

        try {
            if (typeof result === "object") {
                gemResult = result;
            } else {
                const cleanedResult = result
                    .replace(/```json/gi, "")
                    .replace(/```/g, "")
                    .trim();

                const jsonMatch = cleanedResult.match(/{[\s\S]*}/);

                if (!jsonMatch) {
                    return res.status(200).json({
                        type: "general",
                        userInput: command,
                        response: cleanedResult
                    });
                }

                gemResult = JSON.parse(jsonMatch[0]);
            }
        } catch (error) {
            console.error("GEMINI JSON PARSE ERROR:", error);
            return res.status(200).json({
                type: "general",
                userInput: command,
                response:
                    typeof result === "string"
                        ? result
                        : "Sorry, I could not understand the response."
            });
        }

        return res.status(200).json({
            type: gemResult.type || "general",
            userInput: gemResult.userInput || command,
            response: gemResult.response || ""
        });
    } catch (error) {
        console.error("ASK ASSISTANT ERROR:", error);
        return res.status(500).json({
            type: "general",
            userInput: req.body?.command || "",
            response: "ask Assistant error",
            error: error.message
        });
    }
};