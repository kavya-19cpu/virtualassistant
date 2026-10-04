import React, {
  useContext,
  useEffect,
  useRef,
  useState
} from "react";

import {
  userDataContext
} from "../context/UserContext";

import {
  useNavigate
} from "react-router-dom";

import axios from "axios";

import userImg from "../assets/user.gif";
import aiImg from "../assets/ai.gif";

import {
  IoMdMenu,
  IoMdClose
} from "react-icons/io";

import {
  FiMic,
  FiMicOff,
  FiImage,
  FiSend,
  FiTrash2,
  FiSearch,
  FiX,
  FiClock
} from "react-icons/fi";


function Home() {

  const {
    userData,
    serverUrl,
    setUserData,
    getGeminiResponse
  } = useContext(userDataContext);

  const navigate =
    useNavigate();


  /*
  ===================================================
  STATE
  ===================================================
  */

  const [
    isListening,
    setIsListening
  ] = useState(false);

  const [
    isAIActive,
    setIsAIActive
  ] = useState(false);

  const [
    userText,
    setUserText
  ] = useState("");

  const [
    aiText,
    setAiText
  ] = useState("");

  const [
    showAIText,
    setShowAIText
  ] = useState(false);

  const [
    showMenu,
    setShowMenu
  ] = useState(false);

  const [
    historyItems,
    setHistoryItems
  ] = useState([]);

  const [
    typedText,
    setTypedText
  ] = useState("");

  const [
    isSending,
    setIsSending
  ] = useState(false);

  const [
    historySearch,
    setHistorySearch
  ] = useState("");

  const [
    selectedImage,
    setSelectedImage
  ] = useState(null);

  const [
    imagePreview,
    setImagePreview
  ] = useState("");

  const [
    imageQuestion,
    setImageQuestion
  ] = useState("");

  const [
    isImageAnalyzing,
    setIsImageAnalyzing
  ] = useState(false);


  /*
  ===================================================
  REFS
  ===================================================
  */

  const imageInputRef =
    useRef(null);

  const recognitionRef =
    useRef(null);

  const listeningRef =
    useRef(false);

  const speakingRef =
    useRef(false);

  const processingRef =
    useRef(false);

  const restartTimeoutRef =
    useRef(null);

  const assistantNameRef =
    useRef("");


  /*
  ===================================================
  ASSISTANT NAME
  ===================================================
  */

  useEffect(() => {

    assistantNameRef.current =
      userData?.assistantName ||
      "Assistant";

  }, [
    userData?.assistantName
  ]);


  /*
  ===================================================
  LOAD HISTORY
  ===================================================
  */

  useEffect(() => {

    setHistoryItems(
      Array.isArray(
        userData?.history
      )
        ? userData.history
        : []
    );

  }, [
    userData?.history
  ]);


  /*
  ===================================================
  SAVE HISTORY
  ===================================================
  */

  const addHistory = async (
    command,
    answer,
    type = "text"
  ) => {

    const temporaryItem = {
      _id:
        `temp-${Date.now()}`,

      command,
      answer,
      type,
      createdAt:
        new Date().toISOString()
    };

    setHistoryItems(
      previous => [
        temporaryItem,
        ...previous
      ]
    );


    try {

      const response =
        await axios.post(
          `${serverUrl}/api/user/savehistory`,
          {
            command,
            answer,
            type
          },
          {
            withCredentials: true
          }
        );


      if (
        response.data?.history
      ) {

        setHistoryItems(
          response.data.history
        );

        setUserData(
          previous => ({
            ...previous,
            history:
              response.data.history
          })
        );
      }

    } catch (error) {

      console.error(
        "HISTORY SAVE ERROR:",
        error.response?.data ||
        error.message
      );

    }
  };


  /*
  ===================================================
  DELETE HISTORY
  ===================================================
  */

  const deleteHistory =
    async historyId => {

      if (!historyId) return;

      try {

        const response =
          await axios.delete(
            `${serverUrl}/api/user/history/${historyId}`,
            {
              withCredentials: true
            }
          );


        setHistoryItems(
          response.data.history ||
          []
        );


        setUserData(
          previous => ({
            ...previous,
            history:
              response.data.history ||
              []
          })
        );

      } catch (error) {

        console.error(
          "DELETE HISTORY ERROR:",
          error.response?.data ||
          error.message
        );
      }
    };


  /*
  ===================================================
  CLEAR HISTORY
  ===================================================
  */

  const clearHistory =
    async () => {

      if (
        historyItems.length === 0
      ) {
        return;
      }

      const confirmed =
        window.confirm(
          "Clear all history?"
        );

      if (!confirmed) {
        return;
      }

      try {

        await axios.delete(
          `${serverUrl}/api/user/history`,
          {
            withCredentials: true
          }
        );


        setHistoryItems([]);

        setUserData(
          previous => ({
            ...previous,
            history: []
          })
        );

      } catch (error) {

        console.error(
          "CLEAR HISTORY ERROR:",
          error.response?.data ||
          error.message
        );
      }
    };


  /*
  ===================================================
  SPEAK
  ===================================================
  */

  const speak = text => {

    if (!text) return;

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(
        String(text)
      );

    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.lang = "en-US";


    utterance.onstart = () => {

      speakingRef.current = true;

      setIsAIActive(true);

    };


    utterance.onend = () => {

      speakingRef.current = false;

      setIsAIActive(false);

      if (
        listeningRef.current &&
        !processingRef.current &&
        recognitionRef.current
      ) {

        try {

          recognitionRef.current.start();

        } catch {}
      }
    };


    utterance.onerror = () => {

      speakingRef.current = false;

      setIsAIActive(false);

    };


    window.speechSynthesis.speak(
      utterance
    );
  };


  /*
  ===================================================
  OPEN URL
  ===================================================
  */

  const openUrl = url => {

    if (!url) return;

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  };


  /*
  ===================================================
  PROCESS COMMAND
  ===================================================
  */

  const processCommand =
    async (
      command,
      type = "text",
      shouldSpeak = true
    ) => {

      const cleanedCommand =
        command.trim();

      if (!cleanedCommand) {
        return;
      }


      setUserText(
        cleanedCommand
      );

      setAiText("");

      setShowAIText(false);

      setIsAIActive(true);

      setIsSending(true);

      processingRef.current =
        true;


      try {

        /*
        =============================================
        GOOGLE
        =============================================
        */

        const googleMatch =
          cleanedCommand.match(
            /^(?:search|find|look up)\s+(.+?)(?:\s+on|\s+in|\s+at)?\s+google$/i
          );


        if (googleMatch) {

          const query =
            googleMatch[1].trim();

          const answer =
            `Searching Google for ${query}.`;

          setAiText(answer);

          setShowAIText(true);

          addHistory(
            cleanedCommand,
            answer,
            type
          );

          openUrl(
            `https://www.google.com/search?q=${encodeURIComponent(
              query
            )}`
          );

          if (shouldSpeak) {
            speak(answer);
          }

          return;
        }


        /*
        =============================================
        DIRECT GOOGLE SEARCH
        =============================================
        */

        const googleSearch =
          cleanedCommand.match(
            /^(?:search|google)\s+(.+)$/i
          );


        if (googleSearch) {

          const query =
            googleSearch[1].trim();

          const answer =
            `Searching Google for ${query}.`;

          setAiText(answer);

          setShowAIText(true);

          addHistory(
            cleanedCommand,
            answer,
            type
          );

          openUrl(
            `https://www.google.com/search?q=${encodeURIComponent(
              query
            )}`
          );

          if (shouldSpeak) {
            speak(answer);
          }

          return;
        }


        /*
        =============================================
        YOUTUBE
        =============================================
        */

        const youtubeMatch =
          cleanedCommand.match(
            /^(?:search|find|play)\s+(.+?)\s+(?:on|in)\s+youtube$/i
          );


        if (youtubeMatch) {

          const query =
            youtubeMatch[1].trim();

          const answer =
            `Searching YouTube for ${query}.`;

          setAiText(answer);

          setShowAIText(true);

          addHistory(
            cleanedCommand,
            answer,
            type
          );

          openUrl(
            `https://www.youtube.com/results?search_query=${encodeURIComponent(
              query
            )}`
          );

          if (shouldSpeak) {
            speak(answer);
          }

          return;
        }


        /*
        =============================================
        DIRECT WEBSITE
        =============================================
        */

        const websites = {
          google:
            "https://www.google.com",

          youtube:
            "https://www.youtube.com",

          instagram:
            "https://www.instagram.com",

          facebook:
            "https://www.facebook.com",

          github:
            "https://github.com",

          linkedin:
            "https://www.linkedin.com",

          whatsapp:
            "https://web.whatsapp.com",

          gmail:
            "https://mail.google.com",

          amazon:
            "https://www.amazon.in",

          flipkart:
            "https://www.flipkart.com",

          spotify:
            "https://open.spotify.com",

          netflix:
            "https://www.netflix.com",

          wikipedia:
            "https://www.wikipedia.org",

          reddit:
            "https://www.reddit.com",

          discord:
            "https://discord.com",

          canva:
            "https://www.canva.com",

          pinterest:
            "https://www.pinterest.com",

          twitter:
            "https://x.com",

          x:
            "https://x.com",

          telegram:
            "https://web.telegram.org"
        };


        const directMatch =
          cleanedCommand.match(
            /^(?:open|launch|visit|go to|take me to)\s+(.+)$/i
          );


        if (directMatch) {

          const site =
            directMatch[1]
              .trim()
              .toLowerCase()
              .replace(
                /\s+(website|site)$/i,
                ""
              );


          if (websites[site]) {

            const answer =
              `Opening ${site}.`;

            setAiText(answer);

            setShowAIText(true);

            addHistory(
              cleanedCommand,
              answer,
              type
            );

            openUrl(
              websites[site]
            );

            if (shouldSpeak) {
              speak(answer);
            }

            return;
          }
        }


        /*
        =============================================
        GEMINI
        =============================================
        */

        const result =
          await getGeminiResponse(
            cleanedCommand
          );


        let parsedResult =
          result;


        if (
          typeof result ===
          "string"
        ) {

          const cleanResult =
            result
              .replace(
                /```json/gi,
                ""
              )
              .replace(
                /```/g,
                ""
              )
              .trim();


          try {

            parsedResult =
              JSON.parse(
                cleanResult
              );

          } catch {

            parsedResult = {
              type: "general",
              response:
                cleanResult
            };
          }
        }


        const response =
          parsedResult?.response ||
          parsedResult?.answer ||
          "Sorry, I could not understand that.";


        /*
        =============================================
        GEMINI COMMAND TYPES
        =============================================
        */

        if (
          parsedResult.type ===
          "google_open"
        ) {

          openUrl(
            "https://www.google.com"
          );

        } else if (
          parsedResult.type ===
          "google_search"
        ) {

          openUrl(
            `https://www.google.com/search?q=${encodeURIComponent(
              parsedResult.query ||
              cleanedCommand
            )}`
          );

        } else if (
          parsedResult.type ===
          "youtube_open"
        ) {

          openUrl(
            "https://www.youtube.com"
          );

        } else if (
          parsedResult.type ===
          "youtube_search" ||
          parsedResult.type ===
          "youtube_play"
        ) {

          openUrl(
            `https://www.youtube.com/results?search_query=${encodeURIComponent(
              parsedResult.query ||
              cleanedCommand
            )}`
          );

        } else if (
          parsedResult.type ===
          "calculator_open"
        ) {

          openUrl(
            "https://www.google.com/search?q=calculator"
          );
        }


        setAiText(response);

        setShowAIText(true);

        addHistory(
          cleanedCommand,
          response,
          type
        );


        if (shouldSpeak) {
          speak(response);
        }

      } catch (error) {

        console.error(
          "COMMAND ERROR:",
          error
        );

        const errorMessage =
          "Sorry, I could not complete that request right now.";

        setAiText(
          errorMessage
        );

        setShowAIText(true);

        if (shouldSpeak) {
          speak(errorMessage);
        }

      } finally {

        processingRef.current =
          false;

        setIsSending(false);

        setIsAIActive(false);
      }
    };


  /*
  ===================================================
  SEND TEXT
  ===================================================
  */

  const handleSend =
    async e => {

      e?.preventDefault();

      if (
        !typedText.trim() ||
        isSending
      ) {
        return;
      }

      const command =
        typedText.trim();

      setTypedText("");

      await processCommand(
        command,
        "text",
        true
      );
    };


  /*
  ===================================================
  IMAGE SELECT
  ===================================================
  */

  const handleImageSelect =
    e => {

      const file =
        e.target.files?.[0];

      if (!file) return;


      if (
        !file.type.startsWith(
          "image/"
        )
      ) {

        alert(
          "Please select an image file."
        );

        return;
      }


      if (
        file.size >
        10 * 1024 * 1024
      ) {

        alert(
          "Image must be smaller than 10 MB."
        );

        return;
      }


      setSelectedImage(
        file
      );

      setImagePreview(
        URL.createObjectURL(
          file
        )
      );

      setImageQuestion("");
    };


  /*
  ===================================================
  REMOVE IMAGE
  ===================================================
  */

  const removeImage = () => {

    setSelectedImage(null);

    setImagePreview("");

    if (
      imageInputRef.current
    ) {

      imageInputRef.current.value =
        "";
    }
  };


  /*
  ===================================================
  ANALYZE IMAGE
  ===================================================
  */

  const analyzeImage =
    async () => {

      if (
        !selectedImage ||
        isImageAnalyzing
      ) {
        return;
      }


      const question =
        imageQuestion.trim() ||
        "Analyze this image and explain what you see.";


      setIsImageAnalyzing(
        true
      );

      setUserText(
        question
      );

      setAiText("");

      setShowAIText(false);

      setIsAIActive(true);


      try {

        const formData =
          new FormData();

        formData.append(
          "image",
          selectedImage
        );

        formData.append(
          "command",
          question
        );


        const response =
          await axios.post(
            `${serverUrl}/api/user/analyze-image`,
            formData,
            {
              withCredentials: true
            }
          );


        const answer =
          response.data?.response ||
          "I could not analyze the image.";


        setAiText(answer);

        setShowAIText(true);


        await addHistory(
          question,
          answer,
          "image"
        );


        speak(answer);

        removeImage();

        setImageQuestion("");

      } catch (error) {

        console.error(
          "IMAGE ANALYSIS ERROR:",
          error.response?.data ||
          error.message
        );


        const errorMessage =
          error.response?.data?.message ||
          "Unable to analyze the image.";

        setAiText(
          errorMessage
        );

        setShowAIText(true);

        speak(
          errorMessage
        );

      } finally {

        setIsImageAnalyzing(
          false
        );

        setIsAIActive(
          false
        );
      }
    };


  /*
  ===================================================
  SPEECH RECOGNITION
  ===================================================
  */

  useEffect(() => {

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;


    if (!SpeechRecognition) {

      console.warn(
        "Speech recognition is not supported."
      );

      return;
    }


    const recognition =
      new SpeechRecognition();

    recognition.continuous = true;
    recognition.lang = "en-US";
    recognition.interimResults =
      false;

    recognition.maxAlternatives =
      1;


    recognitionRef.current =
      recognition;


    recognition.onstart = () => {

      listeningRef.current =
        true;

      setIsListening(
        true
      );
    };


    recognition.onresult =
      async event => {

        if (
          processingRef.current
        ) {
          return;
        }


        const lastResult =
          event.results[
            event.results.length - 1
          ];


        if (!lastResult) {
          return;
        }


        const transcript =
          lastResult[0]
            ?.transcript
            ?.trim();


        if (!transcript) {
          return;
        }


        const lowerTranscript =
          transcript.toLowerCase();


        /*
        STOP COMMANDS
        */

        const stopCommands = [
          "thank you",
          "thanks",
          "stop",
          "bye",
          "goodbye",
          "stop listening",
          "cancel"
        ];


        if (
          stopCommands.includes(
            lowerTranscript
          )
        ) {

          stopListening();

          speak(
            "You're welcome. Goodbye."
          );

          return;
        }


        setUserText(
          transcript
        );


        await processCommand(
          transcript,
          "voice",
          true
        );
      };


    recognition.onend = () => {

      if (
        listeningRef.current &&
        !speakingRef.current &&
        !processingRef.current
      ) {

        clearTimeout(
          restartTimeoutRef.current
        );


        restartTimeoutRef.current =
          setTimeout(() => {

            try {

              recognition.start();

            } catch {}

          }, 400);

      } else if (
        !listeningRef.current
      ) {

        setIsListening(
          false
        );
      }
    };


    recognition.onerror =
      event => {

        console.error(
          "Speech recognition error:",
          event.error
        );


        if (
          event.error ===
            "not-allowed" ||
          event.error ===
            "audio-capture"
        ) {

          listeningRef.current =
            false;

          setIsListening(
            false
          );
        }
      };


    return () => {

      listeningRef.current =
        false;

      processingRef.current =
        false;

      clearTimeout(
        restartTimeoutRef.current
      );


      try {

        recognition.stop();

      } catch {}


      window.speechSynthesis.cancel();

      recognitionRef.current =
        null;
    };

  }, [
    getGeminiResponse
  ]);


  /*
  ===================================================
  START LISTENING
  ===================================================
  */

  const startListening =
    () => {

      if (
        !recognitionRef.current
      ) {

        alert(
          "Speech recognition is not supported in this browser."
        );

        return;
      }


      try {

        window.speechSynthesis.cancel();

        listeningRef.current =
          true;

        setIsListening(
          true
        );

        recognitionRef.current.start();

      } catch (error) {

        console.log(
          "Microphone already running."
        );
      }
    };


  /*
  ===================================================
  STOP LISTENING
  ===================================================
  */

  const stopListening =
    () => {

      listeningRef.current =
        false;

      setIsListening(
        false
      );

      clearTimeout(
        restartTimeoutRef.current
      );


      if (
        recognitionRef.current
      ) {

        try {

          recognitionRef.current.stop();

        } catch {}
      }
    };


  /*
  ===================================================
  LOGOUT
  ===================================================
  */

  const handleLogout =
    async () => {

      try {

        await axios.post(
          `${serverUrl}/api/auth/logout`,
          {},
          {
            withCredentials: true
          }
        );

      } catch (error) {

        console.error(
          "LOGOUT ERROR:",
          error
        );
      }


      setUserData(null);

      navigate(
        "/signin"
      );
    };


  /*
  ===================================================
  FILTER HISTORY
  ===================================================
  */

  const filteredHistory =
    historyItems.filter(
      item => {

        const command =
          item?.command ||
          item?.text ||
          item?.query ||
          "";

        const answer =
          item?.answer ||
          "";

        const search =
          historySearch
            .toLowerCase()
            .trim();

        if (!search) {
          return true;
        }

        return (
          command
            .toLowerCase()
            .includes(search) ||
          answer
            .toLowerCase()
            .includes(search)
        );
      }
    );


  /*
  ===================================================
  HISTORY CLICK
  ===================================================
  */

  const openHistory =
    item => {

      const command =
        item?.command || "";

      const answer =
        item?.answer || "";


      setUserText(
        command
      );

      setAiText(
        answer
      );

      setShowAIText(
        true
      );
    };


  /*
  ===================================================
  FORMAT DATE
  ===================================================
  */

  const formatDate =
    date => {

      if (!date) {
        return "";
      }

      return new Date(
        date
      ).toLocaleString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        }
      );
    };


  /*
  ===================================================
  UI
  ===================================================
  */

  return (

    <div
      className="
        min-h-screen
        w-full
        bg-[#070B14]
        text-white
        overflow-hidden
      "
    >

      {/* ========================================= */}
      {/* HEADER */}
      {/* ========================================= */}

      <header
        className="
          flex
          h-16
          items-center
          justify-between
          border-b
          border-white/10
          bg-[#0A1020]/95
          px-4
          backdrop-blur
          sm:px-6
        "
      >

        <div
          className="
            flex
            items-center
            gap-3
          "
        >

          <img
            src={
              userData?.assistantImage ||
              aiImg
            }
            alt="Assistant"
            className="
              h-10
              w-10
              rounded-full
              object-cover
              border
              border-cyan-400/30
            "
          />

          <div>

            <p
              className="
                text-sm
                font-semibold
                text-white
              "
            >
              {userData?.assistantName ||
                "Assistant"}
            </p>

            <p
              className="
                text-xs
                text-gray-500
              "
            >
              Virtual Assistant
            </p>

          </div>

        </div>


        <div
          className="
            flex
            items-center
            gap-2
          "
        >

          <button
            onClick={() =>
              navigate(
                "/customize2"
              )
            }
            className="
              hidden
              rounded-full
              border
              border-cyan-400/20
              px-4
              py-2
              text-sm
              text-cyan-300
              transition
              hover:bg-cyan-400/10
              sm:block
            "
          >
            Customize
          </button>


          <button
            onClick={() =>
              setShowMenu(
                previous =>
                  !previous
              )
            }
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              border
              border-white/10
              text-gray-300
              hover:bg-white/5
            "
          >

            {showMenu
              ? <IoMdClose
                  size={22}
                />
              : <IoMdMenu
                  size={22}
                />
            }

          </button>

        </div>

      </header>


      {/* ========================================= */}
      {/* MENU */}
      {/* ========================================= */}

      {showMenu && (

        <div
          className="
            absolute
            right-4
            top-18
            z-50
            w-48
            rounded-xl
            border
            border-white/10
            bg-[#0A1020]
            p-2
            shadow-2xl
          "
        >

          <button
            onClick={() => {
              navigate(
                "/customize2"
              );
              setShowMenu(false);
            }}
            className="
              w-full
              rounded-lg
              px-4
              py-3
              text-left
              text-sm
              text-gray-300
              hover:bg-white/5
            "
          >
            Customize Assistant
          </button>


          <button
            onClick={() => {
              navigate(
                "/change-password"
              );
              setShowMenu(false);
            }}
            className="
              w-full
              rounded-lg
              px-4
              py-3
              text-left
              text-sm
              text-gray-300
              hover:bg-white/5
            "
          >
            Change Password
          </button>


          <button
            onClick={
              handleLogout
            }
            className="
              w-full
              rounded-lg
              px-4
              py-3
              text-left
              text-sm
              text-red-400
              hover:bg-red-400/10
            "
          >
            Logout
          </button>

        </div>
      )}


      {/* ========================================= */}
      {/* MAIN */}
      {/* ========================================= */}

      <main
        className="
          flex
          h-[calc(100vh-4rem)]
          w-full
        "
      >

        {/* ======================================= */}
        {/* HISTORY */}
        {/* ======================================= */}

        <aside
          className="
            hidden
            w-80
            shrink-0
            border-r
            border-white/10
            bg-[#090E1A]
            lg:flex
            lg:flex-col
          "
        >

          <div
            className="
              border-b
              border-white/10
              p-4
            "
          >

            <div
              className="
                mb-3
                flex
                items-center
                justify-between
              "
            >

              <h2
                className="
                  font-semibold
                "
              >
                History
              </h2>


              {historyItems.length >
                0 && (

                <button
                  onClick={
                    clearHistory
                  }
                  className="
                    text-xs
                    text-red-400
                    hover:text-red-300
                  "
                >
                  Clear all
                </button>

              )}

            </div>


            <div
              className="
                relative
              "
            >

              <FiSearch
                className="
                  absolute
                  left-3
                  top-1/2
                  -translate-y-1/2
                  text-gray-500
                "
                size={16}
              />

              <input
                value={
                  historySearch
                }
                onChange={e =>
                  setHistorySearch(
                    e.target.value
                  )
                }
                placeholder="
                  Search history...
                "
                className="
                  h-10
                  w-full
                  rounded-lg
                  border
                  border-white/10
                  bg-white/5
                  pl-9
                  pr-3
                  text-sm
                  text-white
                  outline-none
                  placeholder:text-gray-600
                  focus:border-cyan-400/30
                "
              />

            </div>

          </div>


          <div
            className="
              flex-1
              overflow-y-auto
              p-3
            "
          >

            {filteredHistory.length >
            0 ? (

              filteredHistory.map(
                item => (

                  <div
                    key={
                      item._id ||
                      `${item.command}-${item.createdAt}`
                    }
                    className="
                      group
                      mb-2
                      rounded-xl
                      border
                      border-white/5
                      bg-white/2.5
                      p-3
                      transition
                      hover:border-cyan-400/20
                      hover:bg-white/4
                    "
                  >

                    <button
                      onClick={() =>
                        openHistory(
                          item
                        )
                      }
                      className="
                        w-full
                        text-left
                      "
                    >

                      <div
                        className="
                          mb-2
                          flex
                          items-center
                          justify-between
                        "
                      >

                        <span
                          className="
                            rounded-full
                            bg-cyan-400/10
                            px-2
                            py-1
                            text-[10px]
                            uppercase
                            tracking-wide
                            text-cyan-300
                          "
                        >
                          {item.type ||
                            "text"}
                        </span>

                        <span
                          className="
                            flex
                            items-center
                            gap-1
                            text-[10px]
                            text-gray-600
                          "
                        >
                          <FiClock
                            size={10}
                          />

                          {formatDate(
                            item.createdAt
                          )}
                        </span>

                      </div>


                      <p
                        className="
                          line-clamp-2
                          text-sm
                          text-gray-300
                        "
                      >
                        {item.command}
                      </p>


                      {item.answer && (

                        <p
                          className="
                            mt-2
                            line-clamp-2
                            text-xs
                            leading-relaxed
                            text-gray-600
                          "
                        >
                          {item.answer}
                        </p>

                      )}

                    </button>


                    {item._id &&
                      !String(
                        item._id
                      ).startsWith(
                        "temp-"
                      ) && (

                      <button
                        onClick={() =>
                          deleteHistory(
                            item._id
                          )
                        }
                        className="
                          mt-2
                          flex
                          items-center
                          gap-1
                          text-xs
                          text-gray-600
                          opacity-0
                          transition
                          group-hover:opacity-100
                          hover:text-red-400
                        "
                      >

                        <FiTrash2
                          size={12}
                        />

                        Delete

                      </button>

                    )}

                  </div>

                )
              )

            ) : (

              <div
                className="
                  flex
                  h-full
                  flex-col
                  items-center
                  justify-center
                  text-center
                "
              >

                <div
                  className="
                    mb-3
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-white/10
                    bg-white/5
                    text-gray-600
                  "
                >
                  ✦
                </div>

                <p
                  className="
                    text-sm
                    text-gray-500
                  "
                >
                  No history found
                </p>

              </div>

            )}

          </div>

        </aside>


        {/* ======================================= */}
        {/* ASSISTANT AREA */}
        {/* ======================================= */}

        <section
          className="
            flex
            flex-1
            flex-col
            items-center
            justify-between
            overflow-hidden
            px-4
            py-6
            sm:px-6
          "
        >

          <div
            className="
              flex
              w-full
              max-w-3xl
              flex-1
              flex-col
              items-center
              justify-center
              overflow-y-auto
            "
          >

            {/* ASSISTANT IMAGE */}

            <div
              className={`
                mb-6
                rounded-full
                p-1
                transition
                ${
                  isAIActive
                    ? "ring-4 ring-cyan-400/30"
                    : ""
                }
              `}
            >

              <img
                src={
                  userData?.assistantImage ||
                  aiImg
                }
                alt="Assistant"
                className="
                  h-32
                  w-32
                  rounded-full
                  object-cover
                  shadow-2xl
                  shadow-cyan-950/30
                  sm:h-40
                  sm:w-40
                "
              />

            </div>


            <h1
              className="
                text-center
                text-2xl
                font-semibold
                text-white
                sm:text-3xl
              "
            >
              {userData?.assistantName ||
                "Assistant"}
            </h1>


            <p
              className="
                mt-2
                text-center
                text-sm
                text-gray-500
              "
            >
              {isListening
                ? "Listening..."
                : isImageAnalyzing
                ? "Analyzing image..."
                : "How can I help you?"}
            </p>


            {/* USER TEXT */}

            {userText && (

              <div
                className="
                  mt-8
                  max-w-xl
                  rounded-2xl
                  border
                  border-cyan-400/10
                  bg-cyan-400/5
                  px-5
                  py-3
                  text-center
                  text-sm
                  text-gray-300
                "
              >
                {userText}
              </div>

            )}


            {/* AI TEXT */}

            {showAIText &&
              aiText && (

              <div
                className="
                  mt-4
                  max-w-2xl
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/3
                  px-5
                  py-4
                  text-center
                  text-sm
                  leading-relaxed
                  text-gray-300
                  whitespace-pre-wrap
                "
              >
                {aiText}
              </div>

            )}

          </div>


          {/* ===================================== */}
          {/* IMAGE PREVIEW */}
          {/* ===================================== */}

          {imagePreview && (

            <div
              className="
                mb-3
                w-full
                max-w-3xl
                rounded-2xl
                border
                border-cyan-400/20
                bg-[#0A1020]
                p-3
              "
            >

              <div
                className="
                  flex
                  items-start
                  gap-3
                "
              >

                <img
                  src={imagePreview}
                  alt="Selected"
                  className="
                    h-20
                    w-20
                    rounded-xl
                    object-cover
                  "
                />


                <div
                  className="
                    flex-1
                  "
                >

                  <p
                    className="
                      text-sm
                      font-medium
                      text-white
                    "
                  >
                    Image selected
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      text-gray-500
                    "
                  >
                    Ask a question about this image.
                  </p>


                  <input
                    value={
                      imageQuestion
                    }
                    onChange={e =>
                      setImageQuestion(
                        e.target.value
                      )
                    }
                    placeholder="
                      e.g. Solve this problem
                    "
                    className="
                      mt-2
                      h-9
                      w-full
                      rounded-lg
                      border
                      border-white/10
                      bg-white/5
                      px-3
                      text-xs
                      text-white
                      outline-none
                      placeholder:text-gray-600
                    "
                  />

                </div>


                <button
                  onClick={
                    removeImage
                  }
                  className="
                    text-gray-500
                    hover:text-red-400
                  "
                >
                  <FiX />
                </button>

              </div>

            </div>

          )}


          {/* ===================================== */}
          {/* INPUT AREA */}
          {/* ===================================== */}

          <div
            className="
              w-full
              max-w-3xl
            "
          >

            <form
              onSubmit={
                imagePreview
                  ? e => {
                      e.preventDefault();
                      analyzeImage();
                    }
                  : handleSend
              }
              className="
                flex
                items-center
                gap-2
                rounded-2xl
                border
                border-white/10
                bg-[#0A1020]
                p-2
                shadow-2xl
              "
            >

              {/* IMAGE */}

              <button
                type="button"
                onClick={() =>
                  imageInputRef.current?.click()
                }
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  text-gray-400
                  transition
                  hover:bg-white/5
                  hover:text-cyan-300
                "
                title="Analyze image"
              >

                <FiImage
                  size={20}
                />

              </button>


              <input
                ref={
                  imageInputRef
                }
                type="file"
                accept="image/*"
                onChange={
                  handleImageSelect
                }
                className="hidden"
              />


              {/* TEXT */}

              <input
                value={
                  typedText
                }
                onChange={e =>
                  setTypedText(
                    e.target.value
                  )
                }
                placeholder={
                  imagePreview
                    ? "Ask about the image..."
                    : "Ask me anything..."
                }
                className="
                  min-w-0
                  flex-1
                  bg-transparent
                  px-2
                  text-sm
                  text-white
                  outline-none
                  placeholder:text-gray-600
                "
              />


              {/* MIC */}

              <button
                type="button"
                onClick={
                  isListening
                    ? stopListening
                    : startListening
                }
                className={`
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  transition
                  ${
                    isListening
                      ? "bg-red-400/10 text-red-400"
                      : "text-gray-400 hover:bg-white/5 hover:text-cyan-300"
                  }
                `}
                title={
                  isListening
                    ? "Stop microphone"
                    : "Start microphone"
                }
              >

                {isListening
                  ? <FiMicOff
                      size={19}
                    />
                  : <FiMic
                      size={19}
                    />
                }

              </button>


              {/* SEND */}

              <button
                type="submit"
                disabled={
                  imagePreview
                    ? isImageAnalyzing
                    : isSending ||
                      !typedText.trim()
                }
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-cyan-400
                  text-black
                  transition
                  hover:bg-cyan-300
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
                title={
                  imagePreview
                    ? "Analyze image"
                    : "Send"
                }
              >

                <FiSend
                  size={18}
                />

              </button>

            </form>


            <p
              className="
                mt-3
                text-center
                text-[11px]
                text-gray-700
              "
            >
              Text • Voice • Image Analysis
            </p>

          </div>

        </section>

      </main>

    </div>
  );
}


export default Home;