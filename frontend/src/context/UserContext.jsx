
import React, { createContext, useCallback, useEffect, useState } from "react";
import axios from "axios";

export const userDataContext = createContext(null);

const UserContext = ({ children }) => {
  const serverUrl = "https://virtualassistant-backend-9mos.onrender.com";

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [frontendImage, setFrontendImage] = useState(null);
  const [backendImage, setBackendImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleCurrentUser = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `${serverUrl}/api/user/current`,
        { withCredentials: true }
      );
      setUserData(data);
      return data;
    } catch (error) {
      setUserData(null);
      console.error(
        "GET CURRENT USER ERROR:",
        error.response?.data || error.message
      );
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getGeminiResponse = useCallback(
    async (command) => {
      try {
        const { data } = await axios.post(
          `${serverUrl}/api/user/asktoassistant`,
          { command },
          { withCredentials: true }
        );
        return data;
      } catch (error) {
        console.error(
          "ASSISTANT RESPONSE ERROR:",
          error.response?.data || error.message
        );
        return {
          type: "general",
          userInput: command,
          response:
            error.response?.data?.response ||
            error.response?.data?.message ||
            "Sorry, I could not connect to the assistant. Please try again."
        };
      }
    },
    []
  );

  const saveHistory = useCallback(
    async (command, answer) => {
      try {
        const { data } = await axios.post(
          `${serverUrl}/api/user/savehistory`,
          { command, answer },
          { withCredentials: true }
        );
        return data;
      } catch (error) {
        console.error(
          "SAVE HISTORY ERROR:",
          error.response?.data || error.message
        );
        return null;
      }
    },
    []
  );

  useEffect(() => {
    handleCurrentUser();
  }, [handleCurrentUser]);

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
    handleCurrentUser,
    getGeminiResponse,
    saveHistory
  };

  return (
    <userDataContext.Provider value={value}>
      {children}
    </userDataContext.Provider>
  );
};

export default UserContext;
