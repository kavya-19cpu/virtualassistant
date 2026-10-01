

import React, {
    createContext,
    useState,
    useEffect
} from "react";

import axios from "axios";

export const userDataContext =
    createContext(null);

const UserContext = ({ children }) => {

    const serverUrl =
        "http://localhost:6001";

    const [userData, setUserData] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [frontendImage, setFrontendImage] =
        useState(null);

    const [backendImage, setBackendImage] =
        useState(null);

    const [selectedImage, setSelectedImage] =
        useState(null);

    // ==========================================
    // CURRENT USER
    // ==========================================

    const handleCurrentUser = async () => {

        try {

            const result =
                await axios.get(
                    `${serverUrl}/api/user/current`,
                    {
                        withCredentials: true
                    }
                );

            console.log(
                "CURRENT USER:",
                result.data
            );

            setUserData(
                result.data
            );

        } catch (error) {

            console.error(
                "CURRENT USER ERROR:",
                error.response?.data ||
                error.message
            );

            setUserData(null);

        } finally {

            setLoading(false);
        }
    };

    // ==========================================
    // GEMINI
    // ==========================================

    const getGeminiResponse =
        async (command) => {

            try {

                console.log(
                    "📤 Sending command to backend:",
                    command
                );

                const result =
                    await axios.post(
                        `${serverUrl}/api/user/asktoassistant`,
                        {
                            command
                        },
                        {
                            withCredentials: true
                        }
                    );

                console.log(
                    "🤖 Gemini backend response:",
                    result.data
                );

                return result.data;

            } catch (error) {

                console.error(
                    "❌ Gemini Response Error"
                );

                console.error(
                    "Status:",
                    error.response?.status
                );

                console.error(
                    "Backend message:",
                    error.response?.data
                );

                console.error(
                    "Error message:",
                    error.message
                );

                return null;
            }
        };

    // ==========================================
    // LOAD USER
    // ==========================================

    useEffect(() => {

        handleCurrentUser();

    }, []);

    // ==========================================
    // CONTEXT
    // ==========================================

    const value = {

        serverUrl,

        userData,
        setUserData,

        loading,
        setLoading,

        frontendImage,
        setFrontendImage,

        backendImage,
        setBackendImage,

        selectedImage,
        setSelectedImage,

        getGeminiResponse
    };

    return (
        <userDataContext.Provider
            value={value}
        >
            {children}
        </userDataContext.Provider>
    );
};

export default UserContext;