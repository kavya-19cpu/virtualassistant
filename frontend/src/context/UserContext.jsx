import React, {
    createContext,
    useState,
    useEffect
} from "react";

import axios from "axios";


export const userDataContext =
    createContext(null);


const UserContext = ({
    children
}) => {

    const serverUrl =
        "https://virtualassistant-backend-26od.onrender.com";

    const [
        userData,
        setUserData
    ] = useState(null);


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        frontendImage,
        setFrontendImage
    ] = useState(null);


    const [
        backendImage,
        setBackendImage
    ] = useState(null);


    const [
        selectedImage,
        setSelectedImage
    ] = useState(null);


    /*
    =====================================================
    CURRENT USER
    =====================================================
    */

    const handleCurrentUser =
        async () => {

            try {

                const result =
                    await axios.get(
                        `${serverUrl}/api/user/current`,
                        {
                            withCredentials:
                                true
                        }
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


    /*
    =====================================================
    NORMAL GEMINI
    =====================================================
    */

    const getGeminiResponse =
        async command => {

            try {

                const result =
                    await axios.post(

                        `${serverUrl}/api/user/asktoassistant`,

                        {
                            command
                        },

                        {
                            withCredentials:
                                true
                        }

                    );

                return result.data;

            } catch (error) {

                console.error(
                    "GET GEMINI RESPONSE ERROR:",
                    error.response?.data ||
                    error.message
                );

                throw error;

            }

        };


    /*
    =====================================================
    PDF ANALYSIS
    =====================================================
    */

    const analyzePdfFile =
        async (
            file,
            command
        ) => {

            if (!file) {

                throw new Error(
                    "PDF file is required"
                );

            }

            const formData =
                new FormData();

            formData.append(
                "pdf",
                file
            );

            formData.append(
                "command",
                command ||
                "Analyze this PDF and explain its important contents."
            );

            const result =
                await axios.post(

                    `${serverUrl}/api/user/analyze-pdf`,

                    formData,

                    {
                        withCredentials:
                            true,

                        timeout:
                            180000
                    }

                );

            return result.data;

        };


    useEffect(() => {

        handleCurrentUser();

    }, []);


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

        getGeminiResponse,

        analyzePdfFile

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