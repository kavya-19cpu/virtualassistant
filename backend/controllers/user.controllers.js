
import geminiResponse from "../gemini.js";
import User from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import moment from "moment";

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("GET CURRENT USER ERROR:", error);
    return res.status(500).json({
      message: "Could not get current user",
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

    if (!assistantName?.trim()) {
      return res.status(400).json({
        message: "Assistant name is required"
      });
    }

    let assistantImage = imageUrl || "";

    if (req.file) {
      const uploadedImage = await uploadOnCloudinary(req.file.path);

      if (!uploadedImage) {
        return res.status(500).json({ message: "Image upload failed" });
      }

      assistantImage =
        uploadedImage.secure_url ||
        uploadedImage.url ||
        uploadedImage;
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
      message: "Could not update assistant",
      error: error.message
    });
  }
};

export const saveHistory = async (req, res) => {
  try {
    const { command, answer } = req.body;

    if (
      typeof command !== "string" ||
      typeof answer !== "string" ||
      !command.trim() ||
      !answer.trim()
    ) {
      return res.status(400).json({
        message: "Command and answer are required"
      });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!Array.isArray(user.history)) {
      user.history = [];
    }

    user.history.unshift({
      command: command.trim(),
      answer: answer.trim()
    });

    user.history = user.history.slice(0, 50);

    await user.save();

    return res.status(200).json({
      message: "History saved",
      history: user.history
    });
  } catch (error) {
    console.error("SAVE HISTORY ERROR:", error);
    return res.status(500).json({
      message: "Could not save history",
      error: error.message
    });
  }
};

export const askToAssistant = async (req, res) => {
  try {
    const { command } = req.body;

    if (typeof command !== "string" || !command.trim()) {
      return res.status(400).json({
        type: "general",
        userInput: "",
        response: "Please enter or say a question."
      });
    }

    const cleanCommand = command.trim();
    const lowerCommand = cleanCommand.toLowerCase();

    // Handle questions that do not need Gemini or a database lookup.
    if (
      lowerCommand.includes("what time") ||
      lowerCommand.includes("current time") ||
      lowerCommand.includes("time now") ||
      lowerCommand.includes("tell me the time")
    ) {
      return res.status(200).json({
        type: "get_time",
        userInput: cleanCommand,
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
        userInput: cleanCommand,
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
        userInput: cleanCommand,
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
        userInput: cleanCommand,
        response: `The current month is ${moment().format("MMMM")}`
      });
    }

    const asksAssistantName =
      lowerCommand.includes("what is your name") ||
      lowerCommand.includes("what's your name") ||
      lowerCommand.includes("tell me your name") ||
      lowerCommand.includes("who are you");

    const asksCreator =
      lowerCommand.includes("who created you") ||
      lowerCommand.includes("who made you") ||
      lowerCommand.includes("who built you") ||
      lowerCommand.includes("who developed you") ||
      lowerCommand.includes("who is your creator");

    // Only fetch the user when personalization is needed.
    let user = null;

    if (asksAssistantName || asksCreator || !asksAssistantName) {
      user = await User.findById(req.userId).select("name assistantName");

      if (!user) {
        return res.status(404).json({
          type: "general",
          userInput: cleanCommand,
          response: "User not found."
        });
      }
    }

    const assistantName = user?.assistantName || "Mark";
    const userName = user?.name || "my user";

    if (asksAssistantName) {
      return res.status(200).json({
        type: "general",
        userInput: cleanCommand,
        response: `My name is ${assistantName}.`
      });
    }

    if (asksCreator) {
      return res.status(200).json({
        type: "general",
        userInput: cleanCommand,
        response: `I was created by ${userName}.`
      });
    }

    const result = await geminiResponse(
      cleanCommand,
      assistantName,
      userName
    );

    if (!result) {
      return res.status(500).json({
        type: "general",
        userInput: cleanCommand,
        response: "Sorry, I could not get a response."
      });
    }

    let parsedResult;

    try {
      if (typeof result === "object") {
        parsedResult = result;
      } else {
        const cleanedResult = String(result)
          .replace(/```json/gi, "")
          .replace(/```/g, "")
          .trim();

        const jsonMatch = cleanedResult.match(/\{[\s\S]*\}/);

        if (!jsonMatch) {
          return res.status(200).json({
            type: "general",
            userInput: cleanCommand,
            response: cleanedResult
          });
        }

        parsedResult = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error("GEMINI JSON PARSE ERROR:", parseError);

      return res.status(200).json({
        type: "general",
        userInput: cleanCommand,
        response:
          typeof result === "string"
            ? result
            : "Sorry, I could not understand the response."
      });
    }

    return res.status(200).json({
      type: parsedResult.type || "general",
      userInput: parsedResult.userInput || cleanCommand,
      response:
        typeof parsedResult.response === "string"
          ? parsedResult.response
          : "Sorry, I could not understand the response."
    });
  } catch (error) {
    console.error("ASK ASSISTANT ERROR:", error);

    return res.status(500).json({
      type: "general",
      userInput: req.body?.command || "",
      response: "Sorry, something went wrong while answering.",
      error: error.message
    });
  }
};
