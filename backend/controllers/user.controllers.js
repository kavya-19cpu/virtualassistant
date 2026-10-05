import geminiResponse, {
    geminiImageResponse,
    geminiPdfResponse
} from "../gemini.js";

import User from "../models/user.model.js";

import uploadOnCloudinary from "../utils/cloudinary.js";

import moment from "moment";


/*
=====================================================
GET CURRENT USER
=====================================================
*/

export const getCurrentUser = async (req, res) => {

    try {

        const user = await User.findById(req.userId)
            .select("-password");

        if (!user) {

            return res.status(404).json({
                message: "User not found"
            });

        }

        return res.status(200).json(user);

    } catch (error) {

        console.error(
            "GET CURRENT USER ERROR:",
            error
        );

        return res.status(500).json({
            message: "Get current user error",
            error: error.message
        });

    }
};


/*
=====================================================
UPDATE ASSISTANT
=====================================================
*/

export const updateAssistant = async (
    req,
    res
) => {

    try {

        const {
            assistantName,
            imageUrl
        } = req.body;

        let finalImageUrl = imageUrl;

        if (req.file) {

            finalImageUrl =
                await uploadOnCloudinary(
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

        const user =
            await User.findByIdAndUpdate(
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


/*
=====================================================
SAVE HISTORY
=====================================================
*/

export const saveHistory = async (
    req,
    res
) => {

    try {

        const {
            command,
            answer,
            type = "text",
            image = ""
        } = req.body;

        if (
            typeof command !== "string" ||
            typeof answer !== "string"
        ) {

            return res.status(400).json({
                message:
                    "Command and answer must be strings"
            });

        }

        const trimmedCommand =
            command.trim();

        const trimmedAnswer =
            answer.trim();

        if (
            !trimmedCommand ||
            !trimmedAnswer
        ) {

            return res.status(400).json({
                message:
                    "Command and answer cannot be empty"
            });

        }

        /*
        -------------------------------------------------
        VALID HISTORY TYPES
        -------------------------------------------------
        */

        const validTypes = [
            "text",
            "voice",
            "image",
            "pdf"
        ];

        const historyType =
            validTypes.includes(type)
                ? type
                : "text";

        /*
        -------------------------------------------------
        IMAGE VALIDATION
        -------------------------------------------------
        */

        let historyImage = "";

        if (
            historyType === "image" &&
            image
        ) {

            if (
                typeof image !== "string"
            ) {

                return res.status(400).json({
                    message:
                        "Image must be a string"
                });

            }

            const maximumImageSize =
                2.5 * 1024 * 1024;

            if (
                image.length >
                maximumImageSize
            ) {

                return res.status(400).json({
                    message:
                        "Image is too large to save in history."
                });

            }

            historyImage = image;

        }

        /*
        -------------------------------------------------
        FIND USER
        -------------------------------------------------
        */

        const user =
            await User.findById(req.userId);

        if (!user) {

            return res.status(404).json({
                message: "User not found"
            });

        }

        /*
        -------------------------------------------------
        SAVE HISTORY
        -------------------------------------------------
        */

        user.history.unshift({

            command:
                trimmedCommand,

            answer:
                trimmedAnswer,

            type:
                historyType,

            image:
                historyImage

        });

        await user.save();

        return res.status(200).json({

            message:
                "History saved",

            history:
                user.history

        });

    } catch (error) {

        console.error(
            "SAVE HISTORY ERROR:",
            error
        );

        return res.status(500).json({

            message:
                "Could not save history",

            error:
                error.message

        });

    }
};


/*
=====================================================
DELETE ONE HISTORY ITEM
=====================================================
*/

export const deleteHistory = async (
    req,
    res
) => {

    try {

        const {
            historyId
        } = req.params;

        const user =
            await User.findById(req.userId);

        if (!user) {

            return res.status(404).json({
                message: "User not found"
            });

        }

        const historyItem =
            user.history.id(historyId);

        if (!historyItem) {

            return res.status(404).json({
                message:
                    "History item not found"
            });

        }

        historyItem.deleteOne();

        await user.save();

        return res.status(200).json({

            message:
                "History deleted",

            history:
                user.history

        });

    } catch (error) {

        console.error(
            "DELETE HISTORY ERROR:",
            error
        );

        return res.status(500).json({

            message:
                "Could not delete history"

        });

    }
};


/*
=====================================================
CLEAR ALL HISTORY
=====================================================
*/

export const clearHistory = async (
    req,
    res
) => {

    try {

        const user =
            await User.findById(req.userId);

        if (!user) {

            return res.status(404).json({
                message: "User not found"
            });

        }

        user.history = [];

        await user.save();

        return res.status(200).json({

            message:
                "All history cleared",

            history:
                []

        });

    } catch (error) {

        console.error(
            "CLEAR HISTORY ERROR:",
            error
        );

        return res.status(500).json({

            message:
                "Could not clear history"

        });

    }
};


/*
=====================================================
ASK ASSISTANT
=====================================================
*/

export const askToAssistant = async (
    req,
    res
) => {

    try {

        const {
            command
        } = req.body;

        if (
            !command ||
            typeof command !== "string"
        ) {

            return res.status(400).json({
                message:
                    "Command is required"
            });

        }

        const user =
            await User.findById(req.userId);

        if (!user) {

            return res.status(404).json({
                message: "User not found"
            });

        }

        const userName =
            user.name || "User";

        const assistantName =
            user.assistantName ||
            "Assistant";

        const lowerCommand =
            command.toLowerCase().trim();


        /*
        =================================================
        ASSISTANT NAME
        =================================================
        */

        if (
            lowerCommand.includes(
                "what is your name"
            ) ||
            lowerCommand.includes(
                "who are you"
            ) ||
            lowerCommand.includes(
                "your name"
            )
        ) {

            return res.status(200).json({

                type:
                    "general",

                userInput:
                    command,

                response:
                    `My name is ${assistantName}.`

            });

        }


        /*
        =================================================
        CREATOR
        =================================================
        */

        if (
            lowerCommand.includes(
                "who created you"
            ) ||
            lowerCommand.includes(
                "who made you"
            ) ||
            lowerCommand.includes(
                "who is your creator"
            )
        ) {

            return res.status(200).json({

                type:
                    "general",

                userInput:
                    command,

                response:
                    "I was created by my developer."

            });

        }

        // ==========================================
        // TIME
        // ==========================================

        if (
            lowerCommand.includes("what time") ||
            lowerCommand.includes("current time") ||
            lowerCommand.includes("time now") ||
            lowerCommand.includes("tell me the time")
        ) {

            return res.status(200).json({
                type: "get_time",
                userInput: command,
                response:
                    `Current time is ${moment().format("h:mm A")}`
            });
        }


        // ==========================================
        // DATE
        // ==========================================

        if (
            lowerCommand.includes("what date") ||
            lowerCommand.includes("today's date") ||
            lowerCommand.includes("todays date") ||
            lowerCommand.includes("current date")
        ) {

            return res.status(200).json({
                type: "get_date",
                userInput: command,
                response:
                    `Today's date is ${moment().format("MMMM Do, YYYY")}`
            });
        }


        // ==========================================
        // DAY
        // ==========================================

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
                response:
                    `Today is ${moment().format("dddd")}`
            });
        }


        // ==========================================
        // MONTH
        // ==========================================

        if (
            lowerCommand.includes("what month") ||
            lowerCommand.includes("which month") ||
            lowerCommand.includes("current month") ||
            lowerCommand.includes("month now")
        ) {

            return res.status(200).json({
                type: "get_month",
                userInput: command,
                response:
                    `The current month is ${moment().format("MMMM")}`
            });
        }


        /*
        =================================================
        GEMINI
        =================================================
        */

        const result =
            await geminiResponse(
                command,
                assistantName,
                userName
            );

        let data = result;

        if (
            typeof result === "string"
        ) {

            try {

                data =
                    JSON.parse(result);

            } catch {

                data = {

                    type:
                        "general",

                    response:
                        result

                };

            }

        }

        return res.status(200).json({

            type:
                data?.type ||
                "general",

            userInput:
                command,

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

            message:
                "Assistant error",

            error:
                error.message

        });

    }
};


/*
=====================================================
IMAGE ANALYSIS
=====================================================
*/

export const analyzeImage = async (
    req,
    res
) => {

    try {

        const {
            command
        } = req.body;

        if (!req.file) {

            return res.status(400).json({
                message:
                    "Image is required"
            });

        }

        const user =
            await User.findById(req.userId);

        if (!user) {

            return res.status(404).json({
                message:
                    "User not found"
            });

        }

        const userName =
            user.name || "User";

        const assistantName =
            user.assistantName ||
            "Assistant";

        const question =
            command?.trim() ||
            "Please analyze this image and explain what you see.";

        const response =
            await geminiImageResponse(
                question,
                req.file.buffer,
                req.file.mimetype,
                assistantName,
                userName
            );

        return res.status(200).json({

            type:
                "image",

            userInput:
                question,

            response

        });

    } catch (error) {

        console.error(
            "IMAGE ANALYSIS ERROR:",
            error
        );

        return res.status(500).json({

            message:
                "Unable to analyze image",

            error:
                error.message

        });

    }
};


/*
=====================================================
PDF ANALYSIS
=====================================================
*/

export const analyzePdf = async (
    req,
    res
) => {

    try {

        const {
            command
        } = req.body;

        if (!req.file) {

            return res.status(400).json({

                message:
                    "PDF file is required"

            });

        }

        const user =
            await User.findById(req.userId);

        if (!user) {

            return res.status(404).json({

                message:
                    "User not found"

            });

        }

        const userName =
            user.name || "User";

        const assistantName =
            user.assistantName ||
            "Assistant";

        const question =
            command?.trim() ||
            "Analyze this PDF and explain its important contents.";

        const response =
            await geminiPdfResponse(

                question,

                req.file.buffer,

                assistantName,

                userName

            );

        return res.status(200).json({

            type:
                "pdf",

            fileName:
                req.file.originalname,

            userInput:
                question,

            response

        });

    } catch (error) {

        console.error(
            "PDF ANALYSIS ERROR:",
            error
        );

        return res.status(500).json({

            message:
                "Unable to analyze PDF",

            error:
                error.message

        });

    }
};