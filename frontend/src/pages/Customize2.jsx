import React, { useState, useContext } from "react";
import { userDataContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { IoMdArrowBack } from "react-icons/io";

const Customize2 = () => {
    const {
        userData,
        backendImage,
        selectedImage,
        serverUrl,
        setUserData
    } = useContext(userDataContext);

    const [assistantName, setAssistantName] = useState(
        userData?.assistantName || ""
    );

    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleUpdateAssistant = async () => {
        if (!assistantName.trim()) {
            alert("Please enter assistant name");
            return;
        }

        if (!backendImage && !selectedImage) {
            alert("Please select an assistant image");
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();

            // Assistant name
            formData.append(
                "assistantName",
                assistantName.trim()
            );

            // Assistant image
            if (backendImage) {
                formData.append(
                    "assistantImage",
                    backendImage
                );
            } else if (selectedImage) {
                formData.append(
                    "imageUrl",
                    selectedImage
                );
            }

            // Debug information
            console.log("================================");
            console.log("UPDATING ASSISTANT");
            console.log("================================");

            console.log(
                "assistantName:",
                assistantName
            );

            console.log(
                "backendImage:",
                backendImage
            );

            console.log(
                "selectedImage:",
                selectedImage
            );

            console.log("FORM DATA:");

            for (const [key, value] of formData.entries()) {
                console.log(key, value);
            }

            console.log(
                "REQUEST URL:",
                `${serverUrl}/api/user/update`
            );

            console.log(
                "REQUEST METHOD: PUT"
            );

            // IMPORTANT:
            // Backend route is router.put("/update")
            const result = await axios.put(
                `${serverUrl}/api/user/update`,
                formData,
                {
                    withCredentials: true
                }
            );

            console.log("================================");
            console.log("ASSISTANT UPDATED SUCCESSFULLY");
            console.log("================================");

            console.log(
                "UPDATE RESPONSE:",
                result.data
            );

            // Update user data in Context
            setUserData(result.data);

            // Go to Home
            navigate("/");
        } catch (error) {
            console.error("================================");
            console.error("UPDATE ASSISTANT ERROR");
            console.error("================================");

            console.error(
                "Error:",
                error
            );

            console.error(
                "Status:",
                error.response?.status
            );

            console.error(
                "Backend Response:",
                error.response?.data
            );

            console.error(
                "Message:",
                error.message
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full h-screen bg-linear-to-t from-[black] to-[#030353] flex justify-center items-center flex-col p-5 relative">

            {/* Back Button */}
            <IoMdArrowBack
                className="absolute top-7.5 left-7.5 text-white cursor-pointer w-6.25 h-6.25"
                onClick={() => navigate("/customize")}
            />

            {/* Heading */}
            <h1 className="text-white mb-7.5 text-7.5 text-center">
                Enter your
                <span className="text-blue-200">
                    {" "}Assistant Name
                </span>
            </h1>

            {/* Assistant Name Input */}
            <input
                type="text"
                placeholder="eg. Sophia"
                className="w-full max-w-150 h-15 outline-none border-2 border-white bg-transparent text-white placeholder-gray-300 px-5 py-2.5 rounded-full text-4.5"
                required
                value={assistantName}
                onChange={(e) =>
                    setAssistantName(e.target.value)
                }
            />

            {/* Create Assistant Button */}
            {assistantName.trim() && (
                <button
                    type="button"
                    disabled={loading}
                    className="min-w-37.5 h-15 mt-7.5 px-6 text-black font-semibold cursor-pointer bg-white rounded-full text-4.75 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleUpdateAssistant}
                >
                    {loading
                        ? "Loading..."
                        : "Finally Create your Assistant"}
                </button>
            )}
        </div>
    );
};

export default Customize2;