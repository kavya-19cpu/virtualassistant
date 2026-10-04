import React, {
  useContext,
  useEffect,
  useRef,
  useState
} from "react";

import { userDataContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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
  FiClock,
  FiSettings,
  FiLogOut,
  FiLock,
  FiEdit3
} from "react-icons/fi";

function Home() {
  const {
    userData,
    serverUrl,
    setUserData,
    getGeminiResponse
  } = useContext(userDataContext);

  const navigate = useNavigate();

  // =====================================================
  // STATE
  // =====================================================

  const [isListening, setIsListening] =
    useState(false);

  const [isAIActive, setIsAIActive] =
    useState(false);

  const [userText, setUserText] =
    useState("");

  const [aiText, setAiText] =
    useState("");

  const [showAIText, setShowAIText] =
    useState(false);

  // History drawer
  const [showHistory, setShowHistory] =
    useState(false);

  // Profile/settings menu
  const [showProfileMenu, setShowProfileMenu] =
    useState(false);

  const [historyItems, setHistoryItems] =
    useState([]);

  const [typedText, setTypedText] =
    useState("");

  const [isSending, setIsSending] =
    useState(false);

  const [historySearch, setHistorySearch] =
    useState("");

  const [selectedImage, setSelectedImage] =
    useState(null);

  const [imagePreview, setImagePreview] =
    useState("");

  const [isImageAnalyzing, setIsImageAnalyzing] =
    useState(false);

  // =====================================================
  // REFS
  // =====================================================

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

  const speechTimeoutRef =
    useRef(null);

  const assistantNameRef =
    useRef("");

  // =====================================================
  // ASSISTANT NAME
  // =====================================================

  useEffect(() => {
    assistantNameRef.current =
      userData?.assistantName ||
      "Assistant";
  }, [userData?.assistantName]);

  // =====================================================
  // LOAD HISTORY
  // =====================================================

  useEffect(() => {
    setHistoryItems(
      Array.isArray(userData?.history)
        ? userData.history
        : []
    );
  }, [userData?.history]);

  // =====================================================
  // SAVE HISTORY
  // =====================================================

  const addHistory = async (
    command,
    answer,
    type = "text"
  ) => {
    const temporaryItem = {
      _id: `temp-${Date.now()}`,
      command,
      answer,
      type,
      createdAt:
        new Date().toISOString()
    };

    setHistoryItems(previous => [
      temporaryItem,
      ...previous
    ]);

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

      if (response.data?.history) {
        setHistoryItems(
          response.data.history
        );

        setUserData(previous => ({
          ...previous,
          history:
            response.data.history
        }));
      }
    } catch (error) {
      console.error(
        "HISTORY SAVE ERROR:",
        error.response?.data ||
          error.message
      );
    }
  };

  // =====================================================
  // DELETE ONE HISTORY ITEM
  // =====================================================

  const deleteHistory = async historyId => {
    if (!historyId) {
      return;
    }

    try {
      const response =
        await axios.delete(
          `${serverUrl}/api/user/history/${historyId}`,
          {
            withCredentials: true
          }
        );

      const updatedHistory =
        response.data.history || [];

      setHistoryItems(
        updatedHistory
      );

      setUserData(previous => ({
        ...previous,
        history: updatedHistory
      }));
    } catch (error) {
      console.error(
        "DELETE HISTORY ERROR:",
        error.response?.data ||
          error.message
      );
    }
  };

  // =====================================================
  // CLEAR ALL HISTORY
  // =====================================================

  const clearHistory = async () => {
    if (historyItems.length === 0) {
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

      setUserData(previous => ({
        ...previous,
        history: []
      }));
    } catch (error) {
      console.error(
        "CLEAR HISTORY ERROR:",
        error.response?.data ||
          error.message
      );
    }
  };

  // =====================================================
  // SPEECH
  //
  // IMPORTANT:
  // Long Gemini answers are divided into smaller chunks.
  // This prevents Chrome SpeechSynthesis from stopping
  // halfway through a long answer.
  // =====================================================

  const speak = text => {
    if (!text) {
      return;
    }

    const speechText =
      String(text).trim();

    if (!speechText) {
      return;
    }

    // Stop previous speech
    window.speechSynthesis.cancel();

    clearTimeout(
      speechTimeoutRef.current
    );

    // ---------------------------------------------------
    // Split response into sentences
    // ---------------------------------------------------

    const sentences =
      speechText.match(
        /[^.!?]+[.!?]+|[^.!?]+$/g
      ) || [speechText];

    const chunks = [];

    let currentChunk = "";

    sentences.forEach(sentence => {
      const cleanSentence =
        sentence.trim();

      if (!cleanSentence) {
        return;
      }

      const combined =
        `${currentChunk} ${cleanSentence}`
          .trim();

      // Keep each utterance reasonably small.
      if (combined.length > 180) {
        if (currentChunk.trim()) {
          chunks.push(
            currentChunk.trim()
          );
        }

        currentChunk =
          cleanSentence;
      } else {
        currentChunk =
          combined;
      }
    });

    if (currentChunk.trim()) {
      chunks.push(
        currentChunk.trim()
      );
    }

    if (chunks.length === 0) {
      chunks.push(speechText);
    }

    let currentIndex = 0;

    speakingRef.current = true;

    setIsAIActive(true);

    // ---------------------------------------------------
    // Speak each chunk one after another
    // ---------------------------------------------------

    const speakNextChunk = () => {
      if (
        currentIndex >=
        chunks.length
      ) {
        speakingRef.current =
          false;

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

        return;
      }

      const currentText =
        chunks[currentIndex];

      const utterance =
        new SpeechSynthesisUtterance(
          currentText
        );

      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;
      utterance.lang = "en-US";

      utterance.onstart = () => {
        speakingRef.current =
          true;

        setIsAIActive(true);
      };

      utterance.onend = () => {
        currentIndex++;

        speechTimeoutRef.current =
          setTimeout(() => {
            speakNextChunk();
          }, 80);
      };

      utterance.onerror = error => {
        console.error(
          "SPEECH SYNTHESIS ERROR:",
          error
        );

        currentIndex++;

        speechTimeoutRef.current =
          setTimeout(() => {
            speakNextChunk();
          }, 80);
      };

      window.speechSynthesis.speak(
        utterance
      );
    };

    speakNextChunk();
  };

  // =====================================================
  // OPEN URL
  // =====================================================

  const openUrl = url => {
    if (!url) {
      return;
    }

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // =====================================================
  // GOOGLE SEARCH
  // =====================================================

  const googleSearch = query => {
    if (!query?.trim()) {
      return;
    }

    openUrl(
      `https://www.google.com/search?q=${encodeURIComponent(
        query.trim()
      )}`
    );
  };

  // =====================================================
  // YOUTUBE SEARCH
  // =====================================================

  const youtubeSearch = query => {
    if (!query?.trim()) {
      return;
    }

    openUrl(
      `https://www.youtube.com/results?search_query=${encodeURIComponent(
        query.trim()
      )}`
    );
  };

  // =====================================================
  // DIRECT WEBSITES
  // =====================================================

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

  // =====================================================
  // WEBSITE SEARCH URL
  // =====================================================

  const getWebsiteSearchUrl = (
    site,
    query
  ) => {
    const encodedQuery =
      encodeURIComponent(
        query.trim()
      );

    switch (site) {
      case "google":
        return `https://www.google.com/search?q=${encodedQuery}`;

      case "youtube":
        return `https://www.youtube.com/results?search_query=${encodedQuery}`;

      case "amazon":
        return `https://www.amazon.in/s?k=${encodedQuery}`;

      case "flipkart":
        return `https://www.flipkart.com/search?q=${encodedQuery}`;

      case "wikipedia":
        return `https://www.wikipedia.org/w/index.php?search=${encodedQuery}`;

      case "reddit":
        return `https://www.reddit.com/search/?q=${encodedQuery}`;

      case "github":
        return `https://github.com/search?q=${encodedQuery}`;

      case "linkedin":
        return `https://www.linkedin.com/search/results/all/?keywords=${encodedQuery}`;

      case "spotify":
        return `https://open.spotify.com/search/${encodedQuery}`;

      case "pinterest":
        return `https://www.pinterest.com/search/pins/?q=${encodedQuery}`;

      case "facebook":
        return `https://www.facebook.com/search/top?q=${encodedQuery}`;

      case "x":
      case "twitter":
        return `https://x.com/search?q=${encodedQuery}`;

      default:
        return null;
    }
  };

  // =====================================================
  // EXTRACT SEARCH COMMAND
  //
  // Examples:
  //
  // search photosynthesis on Google
  // -> site: google
  // -> query: photosynthesis
  //
  // search Sun Savaria on YouTube
  // -> site: youtube
  // -> query: Sun Savaria
  //
  // open YouTube and search Sun Savaria
  // -> site: youtube
  // -> query: Sun Savaria
  // =====================================================

  const extractSearchCommand =
    command => {
      if (!command) {
        return null;
      }

      const text =
        command
          .trim()
          .replace(/\s+/g, " ");

      let match;

      // -------------------------------------------------
      // SEARCH QUERY ON SITE
      // -------------------------------------------------

      match = text.match(
        /^(?:search|find|look up)\s+(.+?)\s+(?:on|in)\s+(google|youtube|instagram|facebook|github|linkedin|amazon|flipkart|spotify|wikipedia|reddit|pinterest|twitter|x)\s*$/i
      );

      if (match) {
        return {
          site: match[2]
            .trim()
            .toLowerCase(),

          query:
            match[1].trim()
        };
      }

      // -------------------------------------------------
      // SEARCH SITE FOR QUERY
      // -------------------------------------------------

      match = text.match(
        /^(?:search|find|look up)\s+(google|youtube|instagram|facebook|github|linkedin|amazon|flipkart|spotify|wikipedia|reddit|pinterest|twitter|x)\s+(?:for)\s+(.+)$/i
      );

      if (match) {
        return {
          site: match[1]
            .trim()
            .toLowerCase(),

          query:
            match[2].trim()
        };
      }

      // -------------------------------------------------
      // OPEN SITE AND SEARCH QUERY
      // -------------------------------------------------

      match = text.match(
        /^(?:open|launch|visit|go to|take me to)\s+(google|youtube|instagram|facebook|github|linkedin|amazon|flipkart|spotify|wikipedia|reddit|pinterest|twitter|x)(?:\s+website|\s+site)?\s+(?:and\s+)?(?:search|find|look up)\s+(.+)$/i
      );

      if (match) {
        return {
          site: match[1]
            .trim()
            .toLowerCase(),

          query:
            match[2].trim()
        };
      }

      return null;
    };

  // =====================================================
  // YOUTUBE QUERY
  // =====================================================

  const getYouTubeQuery =
    command => {
      const result =
        extractSearchCommand(
          command
        );

      if (
        result?.site ===
        "youtube"
      ) {
        return result.query;
      }

      return "";
    };

  // =====================================================
  // PROCESS COMMAND
  // =====================================================

  const processCommand =
    async (
      command,
      type = "text",
      shouldSpeak = false
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
        // ===============================================
        // 1. EXPLICIT SEARCH COMMAND
        // ===============================================

        const searchCommand =
          extractSearchCommand(
            cleanedCommand
          );

        if (searchCommand) {
          const {
            site,
            query
          } = searchCommand;

          const siteName =
            site === "x"
              ? "X"
              : site
                  .charAt(0)
                  .toUpperCase() +
                site.slice(1);

          const answer =
            `Searching ${siteName} for ${query}.`;

          setAiText(answer);

          setShowAIText(true);

          await addHistory(
            cleanedCommand,
            answer,
            type
          );

          const searchUrl =
            getWebsiteSearchUrl(
              site,
              query
            );

          if (searchUrl) {
            openUrl(searchUrl);
          } else if (
            site === "youtube"
          ) {
            youtubeSearch(query);
          } else if (
            site === "google"
          ) {
            googleSearch(query);
          }

          // Voice -> speak
          // Typed -> don't speak
          if (shouldSpeak) {
            speak(answer);
          }

          return;
        }

        // ===============================================
        // 2. SIMPLE GOOGLE SEARCH
        //
        // search photosynthesis
        // google photosynthesis
        // ===============================================

        const googleSearchMatch =
          cleanedCommand.match(
            /^(?:search|google)\s+(.+)$/i
          );

        if (googleSearchMatch) {
          const query =
            googleSearchMatch[1].trim();

          const answer =
            `Searching Google for ${query}.`;

          setAiText(answer);

          setShowAIText(true);

          await addHistory(
            cleanedCommand,
            answer,
            type
          );

          googleSearch(query);

          if (shouldSpeak) {
            speak(answer);
          }

          return;
        }

        // ===============================================
        // 3. SIMPLE YOUTUBE SEARCH
        //
        // youtube mitochondria
        // play mitochondria on youtube
        // ===============================================

        const youtubeQuery =
          getYouTubeQuery(
            cleanedCommand
          );

        if (youtubeQuery) {
          const answer =
            `Searching YouTube for ${youtubeQuery}.`;

          setAiText(answer);

          setShowAIText(true);

          await addHistory(
            cleanedCommand,
            answer,
            type
          );

          youtubeSearch(
            youtubeQuery
          );

          if (shouldSpeak) {
            speak(answer);
          }

          return;
        }

        // ===============================================
        // 4. DIRECT WEBSITE OPEN
        // ===============================================

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

            await addHistory(
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

        // ===============================================
        // 5. GEMINI
        // ===============================================

        const result =
          await getGeminiResponse(
            cleanedCommand
          );

        let parsedResult =
          result;

        // -----------------------------------------------
        // Parse Gemini JSON
        // -----------------------------------------------

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

        // ===============================================
        // IMPORTANT:
        // Get the COMPLETE Gemini response.
        // ===============================================

        const response =
          parsedResult?.response ||
          parsedResult?.answer ||
          parsedResult?.text ||
          "Sorry, I could not understand that.";

        // ===============================================
        // GEMINI GOOGLE OPEN
        // ===============================================

        if (
          parsedResult?.type ===
          "google_open"
        ) {
          openUrl(
            "https://www.google.com"
          );
        }

        // ===============================================
        // GEMINI GOOGLE SEARCH
        // ===============================================

        else if (
          parsedResult?.type ===
          "google_search"
        ) {
          /*
            First try to extract the actual query
            from the user's command.

            This prevents the entire command from
            being sent to Google.
          */

          const extractedSearch =
            extractSearchCommand(
              cleanedCommand
            );

          const query =
            extractedSearch?.site ===
            "google"
              ? extractedSearch.query
              : parsedResult?.query;

          if (query?.trim()) {
            googleSearch(query);
          }
        }

        // ===============================================
        // GEMINI YOUTUBE OPEN
        // ===============================================

        else if (
          parsedResult?.type ===
          "youtube_open"
        ) {
          openUrl(
            "https://www.youtube.com"
          );
        }

        // ===============================================
        // GEMINI YOUTUBE SEARCH / PLAY
        // ===============================================

        else if (
          parsedResult?.type ===
            "youtube_search" ||
          parsedResult?.type ===
            "youtube_play"
        ) {
          /*
            IMPORTANT:
            Never use the complete command as a
            fallback search query.

            Example:

            User:
            open YouTube and search Sun Savaria

            Search query:
            Sun Savaria

            NOT:
            open YouTube and search Sun Savaria
          */

          const extractedQuery =
            getYouTubeQuery(
              cleanedCommand
            );

          const query =
            extractedQuery ||
            parsedResult?.query;

          if (query?.trim()) {
            youtubeSearch(
              query
            );
          }
        }

        // ===============================================
        // CALCULATOR
        // ===============================================

        else if (
          parsedResult?.type ===
          "calculator_open"
        ) {
          openUrl(
            "https://www.google.com/search?q=calculator"
          );
        }

        // ===============================================
        // SHOW COMPLETE ANSWER
        // ===============================================

        setAiText(response);

        setShowAIText(true);

        await addHistory(
          cleanedCommand,
          response,
          type
        );

        // ===============================================
        // ONLY VOICE INPUT SPEAKS
        // ===============================================

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
          speak(
            errorMessage
          );
        }
      } finally {
        processingRef.current =
          false;

        setIsSending(false);

        /*
          Do not cancel speech here.
          Speech is handled independently by speak().
        */

        if (
          !speakingRef.current
        ) {
          setIsAIActive(false);
        }
      }
    };

  // =====================================================
  // SEND TYPED MESSAGE
  //
  // IMPORTANT:
  // shouldSpeak = false
  //
  // Therefore typed questions are NEVER spoken.
  // =====================================================

  const handleSend = async e => {
    e?.preventDefault();

    // Image mode
    if (selectedImage) {
      await analyzeImage();
      return;
    }

    if (
      !typedText.trim() ||
      isSending
    ) {
      return;
    }

    const command =
      typedText.trim();

    setTypedText("");

    // ===============================================
    // TYPED INPUT = SILENT
    // ===============================================

    await processCommand(
      command,
      "text",
      false
    );
  };

  // =====================================================
  // IMAGE SELECT
  // =====================================================

  const handleImageSelect = e => {
    const file =
      e.target.files?.[0];

    if (!file) {
      return;
    }

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

    if (imagePreview) {
      URL.revokeObjectURL(
        imagePreview
      );
    }

    setSelectedImage(file);

    setImagePreview(
      URL.createObjectURL(file)
    );
  };

  // =====================================================
  // REMOVE IMAGE
  // =====================================================

  const removeImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(
        imagePreview
      );
    }

    setSelectedImage(null);

    setImagePreview("");

    if (imageInputRef.current) {
      imageInputRef.current.value =
        "";
    }
  };

  // =====================================================
  // IMAGE ANALYSIS
  // =====================================================

  const analyzeImage = async () => {
    if (
      !selectedImage ||
      isImageAnalyzing
    ) {
      return;
    }

    const question =
      typedText.trim() ||
      "Analyze this image and explain what you see.";

    setIsImageAnalyzing(true);

    setUserText(question);

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
        response.data?.answer ||
        "I could not analyze the image.";

      setAiText(answer);

      setShowAIText(true);

      await addHistory(
        question,
        answer,
        "image"
      );

      /*
        Image questions typed into the text box
        should remain silent.
      */

      removeImage();

      setTypedText("");
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
    } finally {
      setIsImageAnalyzing(false);

      if (
        !speakingRef.current
      ) {
        setIsAIActive(false);
      }
    }
  };

  // =====================================================
  // SPEECH RECOGNITION
  // =====================================================

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

    recognition.lang =
      "en-US";

    recognition.interimResults =
      false;

    recognition.maxAlternatives =
      1;

    recognitionRef.current =
      recognition;

    // ===============================================
    // START
    // ===============================================

    recognition.onstart = () => {
      listeningRef.current =
        true;

      setIsListening(true);
    };

    // ===============================================
    // RESULT
    // ===============================================

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

        // =============================================
        // STOP COMMANDS
        // =============================================

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

          return;
        }

        setUserText(
          transcript
        );

        /*
          IMPORTANT:
          Voice input = true

          Therefore the complete answer will
          be spoken by speak().
        */

        await processCommand(
          transcript,
          "voice",
          true
        );
      };

    // ===============================================
    // END
    // ===============================================

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
        setIsListening(false);
      }
    };

    // ===============================================
    // ERROR
    // ===============================================

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

          setIsListening(false);
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

      clearTimeout(
        speechTimeoutRef.current
      );

      try {
        recognition.stop();
      } catch {}

      window.speechSynthesis.cancel();

      recognitionRef.current =
        null;
    };
  }, [getGeminiResponse]);

  // =====================================================
  // START LISTENING
  // =====================================================

  const startListening = () => {
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

      speakingRef.current =
        false;

      listeningRef.current =
        true;

      setIsListening(true);

      recognitionRef.current.start();
    } catch {
      console.log(
        "Microphone already running."
      );
    }
  };

  // =====================================================
  // STOP LISTENING
  // =====================================================

  const stopListening = () => {
    listeningRef.current =
      false;

    setIsListening(false);

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

  // =====================================================
  // LOGOUT
  // =====================================================

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

      navigate("/signin");
    };

  // =====================================================
  // FILTER HISTORY
  // =====================================================

  const filteredHistory =
    historyItems.filter(item => {
      const command =
        item?.command ||
        item?.text ||
        item?.query ||
        "";

      const answer =
        item?.answer || "";

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
    });

  // =====================================================
  // OPEN HISTORY
  // =====================================================

  const openHistory = item => {
    const command =
      item?.command || "";

    const answer =
      item?.answer || "";

    setUserText(command);

    setAiText(answer);

    setShowAIText(true);

    setShowHistory(false);
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = date => {
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

  // =====================================================
  // UI
  // =====================================================

  return (
    <div
      className="
        relative
        min-h-screen
        w-full
        overflow-hidden
        bg-[#070B14]
        text-white
      "
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <header
        className="
          relative
          z-40
          flex
          h-16
          items-center
          justify-between
          border-b
          border-white/10
          bg-[#0A1020]/95
          px-3
          backdrop-blur
          sm:px-5
          md:px-6
        "
      >
        {/* LEFT SIDE */}

        <div
          className="
            flex
            min-w-0
            items-center
            gap-2
            sm:gap-3
          "
        >
          {/* HAMBURGER */}

          <button
            onClick={() => {
              setShowHistory(
                previous =>
                  !previous
              );

              setShowProfileMenu(
                false
              );
            }}
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-full
              border
              border-white/10
              text-gray-300
              transition
              hover:bg-white/5
              hover:text-cyan-300
              active:scale-95
            "
            title={
              showHistory
                ? "Close history"
                : "Open history"
            }
          >
            {showHistory ? (
              <IoMdClose size={22} />
            ) : (
              <IoMdMenu size={22} />
            )}
          </button>

          {/* ASSISTANT IMAGE */}

          <img
            src={
              userData?.assistantImage ||
              aiImg
            }
            alt="Assistant"
            className="
              h-9
              w-9
              shrink-0
              rounded-full
              border
              border-cyan-400/30
              object-cover
              sm:h-10
              sm:w-10
            "
          />

          {/* ASSISTANT NAME */}

          <div className="min-w-0">
            <p
              className="
                truncate
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
                hidden
                text-xs
                text-gray-500
                sm:block
              "
            >
              Virtual Assistant
            </p>
          </div>
        </div>

        {/* RIGHT SIDE */}

        <div
          className="
            relative
            flex
            items-center
            gap-2
          "
        >
          {/* DESKTOP CUSTOMIZE */}

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

          {/* PROFILE BUTTON */}

          <button
            onClick={() => {
              setShowProfileMenu(
                previous =>
                  !previous
              );

              setShowHistory(false);
            }}
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              overflow-hidden
              rounded-full
              border
              border-white/10
              bg-white/5
              text-gray-300
              transition
              hover:border-cyan-400/30
              hover:bg-cyan-400/10
              hover:text-cyan-300
              active:scale-95
            "
            title="Account and settings"
          >
            {userData?.assistantImage ? (
              <img
                src={
                  userData.assistantImage
                }
                alt="Profile"
                className="
                  h-full
                  w-full
                  object-cover
                "
              />
            ) : (
              <FiSettings size={19} />
            )}
          </button>

          {/* PROFILE MENU */}

          {showProfileMenu && (
            <div
              className="
                absolute
                right-0
                top-12
                z-70
                w-[calc(100vw-1.5rem)]
                max-w-xs
                overflow-hidden
                rounded-2xl
                border
                border-white/10
                bg-[#0B1222]
                p-2
                shadow-2xl
                shadow-black/50
              "
            >
              {/* USER INFO */}

              <div
                className="
                  mb-1
                  border-b
                  border-white/10
                  px-3
                  py-3
                "
              >
                <p
                  className="
                    truncate
                    text-sm
                    font-semibold
                    text-white
                  "
                >
                  {userData?.name ||
                    "User"}
                </p>

                <p
                  className="
                    truncate
                    text-xs
                    text-gray-500
                  "
                >
                  {userData?.email ||
                    "Account"}
                </p>
              </div>

              {/* CUSTOMIZE */}

              <button
                onClick={() => {
                  navigate(
                    "/customize2"
                  );

                  setShowProfileMenu(
                    false
                  );
                }}
                className="
                  flex
                  w-full
                  items-center
                  gap-3
                  rounded-xl
                  px-3
                  py-3
                  text-left
                  text-sm
                  text-gray-300
                  transition
                  hover:bg-white/5
                  hover:text-white
                "
              >
                <FiEdit3
                  size={17}
                  className="text-cyan-400"
                />

                <span>
                  Customize Assistant
                </span>
              </button>

              {/* CLEAR HISTORY */}

              <button
                onClick={async () => {
                  await clearHistory();

                  setShowProfileMenu(
                    false
                  );
                }}
                disabled={
                  historyItems.length ===
                  0
                }
                className="
                  flex
                  w-full
                  items-center
                  gap-3
                  rounded-xl
                  px-3
                  py-3
                  text-left
                  text-sm
                  text-gray-300
                  transition
                  hover:bg-red-400/10
                  hover:text-red-400
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                <FiTrash2
                  size={17}
                />

                <span>
                  Clear All History
                </span>
              </button>

              {/* CHANGE PASSWORD */}

              <button
                onClick={() => {
                  navigate(
                    "/change-password"
                  );

                  setShowProfileMenu(
                    false
                  );
                }}
                className="
                  flex
                  w-full
                  items-center
                  gap-3
                  rounded-xl
                  px-3
                  py-3
                  text-left
                  text-sm
                  text-gray-300
                  transition
                  hover:bg-white/5
                  hover:text-white
                "
              >
                <FiLock
                  size={17}
                  className="text-cyan-400"
                />

                <span>
                  Change Password
                </span>
              </button>

              {/* LOGOUT */}

              <div
                className="
                  my-1
                  border-t
                  border-white/10
                "
              />

              <button
                onClick={
                  handleLogout
                }
                className="
                  flex
                  w-full
                  items-center
                  gap-3
                  rounded-xl
                  px-3
                  py-3
                  text-left
                  text-sm
                  text-red-400
                  transition
                  hover:bg-red-400/10
                "
              >
                <FiLogOut size={17} />

                <span>
                  Logout
                </span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* =================================================
          HISTORY DRAWER
      ================================================= */}

      {showHistory && (
        <>
          {/* OVERLAY */}

          <div
            onClick={() =>
              setShowHistory(false)
            }
            className="
              fixed
              inset-0
              z-40
              bg-black/50
              backdrop-blur-sm
            "
          />

          {/* DRAWER */}

          <aside
            className="
              fixed
              left-0
              top-0
              z-50
              flex
              h-full
              w-[88%]
              max-w-sm
              flex-col
              border-r
              border-white/10
              bg-[#090E1A]
              shadow-2xl
            "
          >
            {/* HEADER */}

            <div
              className="
                flex
                h-16
                shrink-0
                items-center
                justify-between
                border-b
                border-white/10
                px-4
              "
            >
              <div>
                <h2
                  className="
                    font-semibold
                    text-white
                  "
                >
                  History
                </h2>

                <p
                  className="
                    text-xs
                    text-gray-500
                  "
                >
                  Your previous conversations
                </p>
              </div>

              <button
                onClick={() =>
                  setShowHistory(false)
                }
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-lg
                  text-gray-400
                  hover:bg-white/5
                  hover:text-white
                "
              >
                <IoMdClose
                  size={21}
                />
              </button>
            </div>

            {/* SEARCH */}

            <div
              className="
                shrink-0
                border-b
                border-white/10
                p-4
              "
            >
              <div className="relative">
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
                  placeholder="Search history..."
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

            {/* HISTORY LIST */}

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
                            gap-2
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
                              min-w-0
                              items-center
                              gap-1
                              text-[10px]
                              text-gray-600
                            "
                          >
                            <FiClock
                              size={10}
                            />

                            <span className="truncate">
                              {formatDate(
                                item.createdAt
                              )}
                            </span>
                          </span>
                        </div>

                        <p
                          className="
                            line-clamp-2
                            wrap-break-word
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
                              wrap-break-word
                              text-xs
                              leading-relaxed
                              text-gray-600
                            "
                          >
                            {item.answer}
                          </p>
                        )}
                      </button>

                      {/* DELETE ONE */}

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
                              transition
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
                    px-5
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
        </>
      )}

      {/* =================================================
          MAIN
      ================================================= */}

      <main
        className="
          flex
          h-[calc(100vh-4rem)]
          w-full
        "
      >
        <section
          className="
            flex
            min-w-0
            flex-1
            flex-col
            items-center
            justify-between
            overflow-hidden
            px-3
            py-4
            sm:px-6
            sm:py-6
          "
        >
          {/* =================================================
              ASSISTANT CONTENT
          ================================================= */}

          <div
            className="
              flex
              w-full
              max-w-3xl
              min-h-0
              flex-1
              flex-col
              items-center
              justify-center
              overflow-y-auto
              px-1
            "
          >
            {/* ASSISTANT IMAGE */}

            <div
              className={`
                mb-5
                rounded-full
                p-1
                transition
                sm:mb-6
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
                  h-24
                  w-24
                  rounded-full
                  object-cover
                  shadow-2xl
                  shadow-cyan-950/30
                  sm:h-32
                  sm:w-32
                  md:h-40
                  md:w-40
                "
              />
            </div>

            {/* NAME */}

            <h1
              className="
                max-w-full
                wrap-break-word
                text-center
                text-xl
                font-semibold
                text-white
                sm:text-2xl
                md:text-3xl
              "
            >
              {userData?.assistantName ||
                "Assistant"}
            </h1>

            {/* STATUS */}

            <p
              className="
                mt-2
                text-center
                text-xs
                text-gray-500
                sm:text-sm
              "
            >
              {isListening
                ? "Listening..."
                : isImageAnalyzing
                ? "Analyzing image..."
                : speakingRef.current
                ? "Speaking..."
                : "How can I help you?"}
            </p>

            {/* USER QUESTION */}

            {userText && (
              <div
                className="
                  mt-6
                  w-full
                  max-w-xl
                  wrap-break-word
                  rounded-2xl
                  border
                  border-cyan-400/10
                  bg-cyan-400/5
                  px-4
                  py-3
                  text-center
                  text-sm
                  text-gray-300
                  sm:mt-8
                  sm:px-5
                "
              >
                {userText}
              </div>
            )}

            {/* AI ANSWER */}

            {showAIText &&
              aiText && (
                <div
                  className="
                    mt-4
                    w-full
                    max-w-2xl
                    wrap-break-word
                    rounded-2xl
                    border
                    border-white/10
                    bg-white/3
                    px-4
                    py-4
                    text-center
                    text-sm
                    leading-relaxed
                    whitespace-pre-wrap
                    text-gray-300
                    sm:px-5
                  "
                >
                  {aiText}
                </div>
              )}
          </div>

          {/* =================================================
              IMAGE PREVIEW
          ================================================= */}

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
                  min-w-0
                  items-center
                  gap-3
                "
              >
                <img
                  src={imagePreview}
                  alt="Selected"
                  className="
                    h-14
                    w-14
                    shrink-0
                    rounded-xl
                    object-cover
                    sm:h-16
                    sm:w-16
                  "
                />

                <div
                  className="
                    min-w-0
                    flex-1
                  "
                >
                  <p
                    className="
                      truncate
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
                      hidden
                      text-xs
                      text-gray-500
                      sm:block
                    "
                  >
                    Type your question below and press Send.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    removeImage
                  }
                  className="
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    text-gray-500
                    hover:bg-white/5
                    hover:text-red-400
                  "
                >
                  <FiX size={18} />
                </button>
              </div>
            </div>
          )}

          {/* =================================================
              INPUT
          ================================================= */}

          <div
            className="
              w-full
              max-w-3xl
            "
          >
            <form
              onSubmit={handleSend}
              className="
                flex
                min-w-0
                items-center
                gap-1
                rounded-2xl
                border
                border-white/10
                bg-[#0A1020]
                p-1.5
                shadow-2xl
                sm:gap-2
                sm:p-2
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
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  text-gray-400
                  transition
                  hover:bg-white/5
                  hover:text-cyan-300
                  sm:h-11
                  sm:w-11
                "
                title="Analyze image"
              >
                <FiImage size={19} />
              </button>

              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={
                  handleImageSelect
                }
                className="hidden"
              />

              {/* TEXT INPUT */}

              <input
                value={typedText}
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
                  px-1
                  text-sm
                  text-white
                  outline-none
                  placeholder:text-gray-600
                  sm:px-2
                "
              />

              {/* MICROPHONE */}

              <button
                type="button"
                onClick={
                  isListening
                    ? stopListening
                    : startListening
                }
                className={`
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  transition
                  sm:h-11
                  sm:w-11
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
                {isListening ? (
                  <FiMicOff size={19} />
                ) : (
                  <FiMic size={19} />
                )}
              </button>

              {/* SEND */}

              <button
                type="submit"
                disabled={
                  imagePreview
                    ? isImageAnalyzing ||
                      !selectedImage
                    : isSending ||
                      !typedText.trim()
                }
                className="
                  flex
                  h-10
                  w-10
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
                  sm:h-11
                  sm:w-11
                "
                title={
                  imagePreview
                    ? "Analyze image"
                    : "Send"
                }
              >
                <FiSend size={18} />
              </button>
            </form>

            <p
              className="
                mt-2
                text-center
                text-[10px]
                text-gray-700
                sm:mt-3
                sm:text-[11px]
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