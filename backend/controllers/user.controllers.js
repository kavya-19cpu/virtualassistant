import geminiResponse from "../gemini.js";
import User from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import moment from "moment";

export const getCurrentUser=async(req,res)=>{
    try{
        const user=await User.findById(req.userId).select("-password");

        if(!user){
            return res.status(404).json({
                message:"User not found"
            });
        }

        return res.status(200).json(user);
    }catch(error){
        return res.status(500).json({
            message:"Get current user error",
            error:error.message
        });
    }
};

export const updateAssistant=async(req,res)=>{
    try{
        const {assistantName}=req.body;

        let imageUrl;

        if(req.file){
            imageUrl=await uploadOnCloudinary(req.file.path);
        }

        const updateData={};

        if(assistantName){
            updateData.assistantName=assistantName;
        }

        if(imageUrl){
            updateData.assistantImage=imageUrl;
        }

        const user=await User.findByIdAndUpdate(
            req.userId,
            updateData,
            {new:true}
        ).select("-password");

        if(!user){
            return res.status(404).json({
                message:"User not found"
            });
        }

        return res.status(200).json(user);
    }catch(error){
        return res.status(500).json({
            message:"Update assistant error",
            error:error.message
        });
    }
};

export const saveHistory=async(req,res)=>{
    try{
        const {command,answer}=req.body;

        if(
            typeof command!=="string"||
            typeof answer!=="string"
        ){
            return res.status(400).json({
                message:"Command and answer must be strings"
            });
        }

        const user=await User.findById(req.userId);

        if(!user){
            return res.status(404).json({
                message:"User not found"
            });
        }

        user.history.unshift({
            command:command.trim(),
            answer:answer.trim()
        });

        if(user.history.length>50){
            user.history=user.history.slice(0,50);
        }

        await user.save();

        return res.status(200).json({
            message:"History saved",
            history:user.history
        });
    }catch(error){
        console.error("SAVE HISTORY ERROR:",error);

        return res.status(500).json({
            message:"Could not save history",
            error:error.message
        });
    }
};

export const askToAssistant=async(req,res)=>{
    try{
        const {command}=req.body;

        if(!command||typeof command!=="string"){
            return res.status(400).json({
                message:"Command is required"
            });
        }

        const user=await User.findById(req.userId);

        if(!user){
            return res.status(404).json({
                message:"User not found"
            });
        }

        const userName=user.name||"User";
        const assistantName=user.assistantName||"Assistant";

        const lowerCommand=command.toLowerCase().trim();

        if(
            lowerCommand.includes("what is your name")||
            lowerCommand.includes("who are you")||
            lowerCommand.includes("your name")
        ){
            return res.status(200).json({
                type:"general",
                userInput:command,
                response:`My name is ${assistantName}.`
            });
        }

        if(
            lowerCommand.includes("who created you")||
            lowerCommand.includes("who made you")||
            lowerCommand.includes("who is your creator")
        ){
            return res.status(200).json({
                type:"general",
                userInput:command,
                response:"I was created by my developer."
            });
        }

        if(
            lowerCommand.includes("what time is it")||
            lowerCommand==="time"||
            lowerCommand.includes("current time")
        ){
            return res.status(200).json({
                type:"general",
                userInput:command,
                response:`The current time is ${moment().format("hh:mm A")}.`
            });
        }

        if(
            lowerCommand.includes("what is today's date")||
            lowerCommand.includes("what is the date")||
            lowerCommand==="date"||
            lowerCommand.includes("today's date")
        ){
            return res.status(200).json({
                type:"general",
                userInput:command,
                response:`Today's date is ${moment().format("DD MMMM YYYY")}.`
            });
        }

        if(
            lowerCommand.includes("what day is it")||
            lowerCommand==="day"||
            lowerCommand.includes("today's day")
        ){
            return res.status(200).json({
                type:"general",
                userInput:command,
                response:`Today is ${moment().format("dddd")}.`
            });
        }

        if(
            lowerCommand.includes("what month is it")||
            lowerCommand==="month"
        ){
            return res.status(200).json({
                type:"general",
                userInput:command,
                response:`This month is ${moment().format("MMMM")}.`
            });
        }

        const result=await geminiResponse(
            command,
            assistantName,
            userName
        );

        let data=result;

        if(typeof result==="string"){
            try{
                data=JSON.parse(result);
            }catch{
                data={
                    type:"general",
                    response:result
                };
            }
        }

        return res.status(200).json({
            type:data?.type||"general",
            userInput:command,
            response:
                data?.response||
                data?.answer||
                "Sorry, I could not understand that."
        });
    }catch(error){
        console.error("ASK ASSISTANT ERROR:",error);

        return res.status(500).json({
            message:"Assistant error",
            error:error.message
        });
    }
};