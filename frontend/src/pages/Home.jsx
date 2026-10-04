import React, {
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { userDataContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import aiImg from "../assets/ai.gif";

import {
  IoMdMenu,
  IoMdClose,
} from "react-icons/io";

import {
  FiMic,
  FiMicOff,
  FiImage,
  FiFileText,
  FiSend,
  FiTrash2,
  FiSearch,
  FiX,
  FiClock,
  FiSettings,
  FiLogOut,
  FiLock,
  FiEdit3,
} from "react-icons/fi";


function Home() {
  const {
    userData,
    serverUrl,
    setUserData,
    getGeminiResponse,
  } = useContext(userDataContext);

  const navigate = useNavigate();


  // =========================================================
  // STATE
  // =========================================================

  const [isListening, setIsListening] = useState(false);
  const [isAIActive, setIsAIActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const [userText, setUserText] = useState("");
  const [aiText, setAiText] = useState("");
  const [showAIText, setShowAIText] = useState(false);

  const [showHistory, setShowHistory] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const [historyItems, setHistoryItems] = useState([]);
  const [historySearch, setHistorySearch] = useState("");

  const [typedText, setTypedText] = useState("");
  const [isSending, setIsSending] = useState(false);

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isImageAnalyzing, setIsImageAnalyzing] = useState(false);

  const [selectedPdf, setSelectedPdf] = useState(null);
  const [isPdfAnalyzing, setIsPdfAnalyzing] = useState(false);

  const [historyImage, setHistoryImage] = useState("");


  // =========================================================
  // REFS
  // =========================================================

  const imageInputRef = useRef(null);
  const pdfInputRef = useRef(null);

  const recognitionRef = useRef(null);

  const listeningRef = useRef(false);
  const speakingRef = useRef(false);
  const processingRef = useRef(false);

  const restartTimeoutRef = useRef(null);
  const speechTimeoutRef = useRef(null);

  // Prevent old speech callbacks from affecting new speech
  const speechSessionRef = useRef(0);


  // =========================================================
  // LOAD HISTORY
  // =========================================================

  useEffect(() => {
    if (userData?.history) {
      setHistoryItems(userData.history);
    }
  }, [userData]);


  // =========================================================
  // SPEECH SYNTHESIS
  // =========================================================

  const stopSpeaking = () => {
    // Invalidate current speech session
    speechSessionRef.current += 1;

    speakingRef.current = false;

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    clearTimeout(speechTimeoutRef.current);

    setIsSpeaking(false);
    setIsAIActive(false);
  };


  const speak = (text) => {
    if (!text || !("speechSynthesis" in window)) {
      return;
    }

    const speechText = String(text).trim();

    if (!speechText) {
      return;
    }

    // Stop previous speech first
    window.speechSynthesis.cancel();
    clearTimeout(speechTimeoutRef.current);

    // Create a new speech session
    const sessionId = ++speechSessionRef.current;

    const sentences =
      speechText.match(
        /[^.!?]+[.!?]+|[^.!?]+$/g
      ) || [speechText];

    const chunks = [];

    let currentChunk = "";

    sentences.forEach((sentence) => {
      const cleanSentence = sentence.trim();

      if (!cleanSentence) {
        return;
      }

      const combined =
        `${currentChunk} ${cleanSentence}`.trim();

      // Keep speech chunks reasonably sized
      if (combined.length > 180) {
        if (currentChunk.trim()) {
          chunks.push(currentChunk.trim());
        }

        currentChunk = cleanSentence;
      } else {
        currentChunk = combined;
      }
    });

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    if (chunks.length === 0) {
      chunks.push(speechText);
    }

    let currentIndex = 0;

    speakingRef.current = true;

    setIsSpeaking(true);
    setIsAIActive(true);


    const speakNextChunk = () => {
      // Ignore old speech session
      if (
        !speakingRef.current ||
        sessionId !== speechSessionRef.current
      ) {
        return;
      }

      // Finished everything
      if (currentIndex >= chunks.length) {
        speakingRef.current = false;

        setIsSpeaking(false);
        setIsAIActive(false);

        // If microphone was intentionally kept active,
        // restart recognition after speech.
        if (
          listeningRef.current &&
          !processingRef.current &&
          recognitionRef.current
        ) {
          try {
            recognitionRef.current.start();
          } catch {
            // Already running
          }
        }

        return;
      }


      const utterance =
        new SpeechSynthesisUtterance(
          chunks[currentIndex]
        );

      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;
      utterance.lang = "en-US";


      utterance.onstart = () => {
        if (
          !speakingRef.current ||
          sessionId !== speechSessionRef.current
        ) {
          window.speechSynthesis.cancel();
          return;
        }

        setIsSpeaking(true);
        setIsAIActive(true);
      };


      utterance.onend = () => {
        if (
          !speakingRef.current ||
          sessionId !== speechSessionRef.current
        ) {
          return;
        }

        currentIndex++;

        speechTimeoutRef.current =
          setTimeout(
            speakNextChunk,
            80
          );
      };


      utterance.onerror = (error) => {
        console.error(
          "Speech synthesis error:",
          error
        );

        if (
          !speakingRef.current ||
          sessionId !== speechSessionRef.current
        ) {
          return;
        }

        currentIndex++;

        speechTimeoutRef.current =
          setTimeout(
            speakNextChunk,
            80
          );
      };


      window.speechSynthesis.speak(
        utterance
      );
    };


    speakNextChunk();
  };


  // =========================================================
  // SPEECH RECOGNITION
  // =========================================================

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn(
        "Speech recognition is not supported in this browser."
      );

      return;
    }


    const recognition =
      new SpeechRecognition();

    recognition.continuous = true;
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;


    recognitionRef.current =
      recognition;


    recognition.onstart = () => {
      listeningRef.current = true;

      setIsListening(true);
    };


    recognition.onresult = async (event) => {
      if (processingRef.current) {
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
        lastResult[0]?.transcript?.trim();


      if (!transcript) {
        return;
      }


      const lowerTranscript =
        transcript.toLowerCase();


      const stopCommands = [
        "thank you",
        "thanks",
        "stop listening",
        "cancel",
        "goodbye",
        "bye",
      ];


      if (
        stopCommands.includes(
          lowerTranscript
        )
      ) {
        stopListening();

        return;
      }


      setUserText(transcript);

      // TRUE means this came from voice,
      // so the answer will be spoken.
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
            } catch {
              // Already running
            }
          }, 400);
      } else if (
        !listeningRef.current
      ) {
        setIsListening(false);
      }
    };


    recognition.onerror = (event) => {
      console.error(
        "Speech recognition error:",
        event.error
      );


      if (
        event.error === "not-allowed" ||
        event.error === "audio-capture"
      ) {
        listeningRef.current = false;

        setIsListening(false);
      }
    };


    return () => {
      listeningRef.current = false;
      processingRef.current = false;
      speakingRef.current = false;


      clearTimeout(
        restartTimeoutRef.current
      );

      clearTimeout(
        speechTimeoutRef.current
      );


      try {
        recognition.stop();
      } catch {
        // Already stopped
      }


      if (
        "speechSynthesis" in window
      ) {
        window.speechSynthesis.cancel();
      }


      recognitionRef.current = null;
    };
  }, [getGeminiResponse]);


  // =========================================================
  // START LISTENING
  // =========================================================

  const startListening = () => {
    if (!recognitionRef.current) {
      alert(
        "Speech recognition is not supported in this browser. Please use Chrome or Edge."
      );

      return;
    }


    // If AI is speaking, stop it first.
    stopSpeaking();


    clearTimeout(
      restartTimeoutRef.current
    );


    try {
      listeningRef.current = true;

      setIsListening(true);

      recognitionRef.current.start();
    } catch {
      console.log(
        "Microphone already running."
      );
    }
  };


  // =========================================================
  // STOP LISTENING
  // =========================================================

  const stopListening = () => {
    listeningRef.current = false;

    setIsListening(false);

    clearTimeout(
      restartTimeoutRef.current
    );


    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Already stopped
      }
    }
  };


  // =========================================================
  // CLEAN AI RESPONSE
  // =========================================================

  const cleanAIResponse = (text) => {
    if (!text) {
      return "";
    }


    let cleaned = String(text);


    cleaned = cleaned
      .replace(
        /```(?:json|javascript|js|text|markdown|md)?/gi,
        ""
      )
      .replace(
        /```/g,
        ""
      )
      .replace(
        /\*\*\*/g,
        ""
      )
      .replace(
        /__/g,
        ""
      )
      .replace(
        /^\s*#{1,6}\s*/gm,
        ""
      )
      .replace(
        /^\s*>\s?/gm,
        ""
      )
      .replace(
        /^\s*[-*+]\s+/gm,
        ""
      )
      .replace(
        /`/g,
        ""  
      );


    cleaned = cleaned
      .replace(
        /\$\$/g,
        ""
      )
      .replace(
        /\$/g,
        ""
      )
      .replace(
        /\\\[/g,
        ""
      )
      .replace(
        /\\\]/g,
        ""
      )
      .replace(
        /\\\(/g,
        ""
      )
      .replace(
        /\\\)/g,
        ""
      );


    cleaned = cleaned.replace(
      /\\(?:frac|dfrac|tfrac)\{([^{}]+)\}\{([^{}]+)\}/g,
      "$1/$2"
    );


    cleaned = cleaned
      .replace(
        /\\pi\b/g,
        "π"
      )
      .replace(
        /\\sqrt\{([^{}]+)\}/g,
        "√($1)"
      )
      .replace(
        /\\sin\b/g,
        "sin"
      )
      .replace(
        /\\cos\b/g,
        "cos"
      )
      .replace(
        /\\tan\b/g,
        "tan"
      )
      .replace(
        /\\cot\b/g,
        "cot"
      )
      .replace(
        /\\sec\b/g,
        "sec"
      )
      .replace(
        /\\csc\b/g,
        "csc"
      )
      .replace(
        /\\log\b/g,
        "log"
      )
      .replace(
        /\\ln\b/g,
        "ln"
      )
      .replace(
        /\\lim\b/g,
        "lim"
      )
      .replace(
        /\\infty\b/g,
        "∞"
      )
      .replace(
        /\\times\b/g,
        "×"
      )
      .replace(
        /\\cdot\b/g,
        "·"
      )
      .replace(
        /\\leq\b/g,
        "≤"
      )
      .replace(
        /\\geq\b/g,
        "≥"
      )
      .replace(
        /\\neq\b/g,
        "≠"
      )
      .replace(
        /\\pm\b/g,
        "±"
      )
      .replace(
        /\\left/g,
        ""
      )
      .replace(
        /\\right/g,
        ""
      )
      .replace(
        /\\text\{([^{}]*)\}/g,
        "$1"
      )
      .replace(
        /\\mathrm\{([^{}]*)\}/g,
        "$1"
      )
      .replace(
        /\\mathbf\{([^{}]*)\}/g,
        "$1"
      )
      .replace(
        /\\displaystyle/g,
        ""
      )
      .replace(
        /\^\{2\}/g,
        "²"
      )
      .replace(
        /\^\{3\}/g,
        "³"
      )
      .replace(
        /\^2/g,
        "²"
      )
      .replace(
        /\^3/g,
        "³"
      )
      .replace(
        /sin\^{-1}/g,
        "sin⁻¹"
      )
      .replace(
        /cos\^{-1}/g,
        "cos⁻¹"
      )
      .replace(
        /tan\^{-1}/g,
        "tan⁻¹"
      )
      .replace(
        /[{}]/g,
        ""
      );


    cleaned = cleaned
      .replace(
        /[ \t]+/g,
        " "
      )
      .replace(
        /\n[ \t]+/g,
        "\n"
      )
      .replace(
        /\n{3,}/g,
        "\n\n"
      );


    return cleaned.trim();
  };


  // =========================================================
  // URL HELPERS
  // =========================================================

  const openUrl = (url) => {
    if (!url) {
      return;
    }

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  };


  const googleSearch = (query) => {
    if (!query?.trim()) {
      return;
    }


    openUrl(
      `https://www.google.com/search?q=${encodeURIComponent(
        query.trim()
      )}`
    );
  };


  const youtubeSearch = (query) => {
    if (!query?.trim()) {
      return;
    }


    openUrl(
      `https://www.youtube.com/results?search_query=${encodeURIComponent(
        query.trim()
      )}`
    );
  };


  const websites = {
    google: "https://www.google.com",
    youtube: "https://www.youtube.com",
    instagram: "https://www.instagram.com",
    facebook: "https://www.facebook.com",
    github: "https://github.com",
    linkedin: "https://www.linkedin.com",
    whatsapp: "https://web.whatsapp.com",
    gmail: "https://mail.google.com",
    amazon: "https://www.amazon.in",
    flipkart: "https://www.flipkart.com",
    spotify: "https://open.spotify.com",
    netflix: "https://www.netflix.com",
    wikipedia: "https://www.wikipedia.org",
    reddit: "https://www.reddit.com",
    discord: "https://discord.com",
    canva: "https://www.canva.com",
    pinterest: "https://www.pinterest.com",
    twitter: "https://x.com",
    x: "https://x.com",
    telegram: "https://web.telegram.org",
  };


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


  // =========================================================
  // SEARCH COMMAND EXTRACTION
  // =========================================================

  const extractSearchCommand = (
    command
  ) => {
    const lower =
      command.toLowerCase().trim();


    const patterns = [
      /^search google for (.+)$/i,
      /^google (.+)$/i,
      /^search for (.+)$/i,
      /^search (.+)$/i,
      /^find (.+) on google$/i,
    ];


    for (const pattern of patterns) {
      const match =
        command.match(pattern);

      if (match?.[1]) {
        return {
          site: "google",
          query: match[1].trim(),
        };
      }
    }


    if (
      lower.startsWith(
        "search google "
      )
    ) {
      return {
        site: "google",
        query: command
          .slice(14)
          .trim(),
      };
    }


    return null;
  };


  const getYouTubeQuery = (
    command
  ) => {
    const patterns = [
      /^search youtube for (.+)$/i,
      /^youtube search (.+)$/i,
      /^search (.+) on youtube$/i,
      /^play (.+) on youtube$/i,
      /^play (.+)$/i,
    ];


    for (const pattern of patterns) {
      const match =
        command.match(pattern);

      if (match?.[1]) {
        return match[1].trim();
      }
    }


    return "";
  };


  // =========================================================
  // SAVE HISTORY
  // =========================================================

  const addHistory = async (
    command,
    answer,
    type = "text",
    image = ""
  ) => {
    if (!serverUrl) {
      return;
    }


    try {
      const response =
        await axios.post(
          `${serverUrl}/api/user/savehistory`,
          {
            command,
            response: answer,
            type,
            image,
          },
          {
            withCredentials: true,
          }
        );


      const savedHistory =
        response.data?.history;


      if (savedHistory) {
        setHistoryItems(
          (prev) => [
            savedHistory,
            ...prev,
          ]
        );


        setUserData?.((prev) => {
          if (!prev) {
            return prev;
          }


          return {
            ...prev,
            history: [
              savedHistory,
              ...(prev.history || []),
            ],
          };
        });
      }
    } catch (error) {
      console.error(
        "SAVE HISTORY ERROR:",
        error
      );
    }
  };


  // =========================================================
  // PROCESS COMMAND
  // =========================================================

  const processCommand = async (
    command,
    type = "text",
    shouldSpeak = false
  ) => {
    const cleanedCommand =
      command?.trim();


    if (!cleanedCommand) {
      return;
    }


    // Stop any currently running speech
    if (shouldSpeak) {
      stopSpeaking();
    }


    setHistoryImage("");

    setUserText(
      cleanedCommand
    );

    setAiText("");

    setShowAIText(false);

    setIsAIActive(true);

    setIsSending(true);

    processingRef.current = true;


    try {
      const lower =
        cleanedCommand
          .toLowerCase()
          .trim();


      // =====================================================
      // GOOGLE SEARCH
      // =====================================================

      const extractedSearch =
        extractSearchCommand(
          cleanedCommand
        );


      if (extractedSearch) {
        const answer =
          `Searching Google for ${extractedSearch.query}.`;


        setAiText(answer);

        setShowAIText(true);


        googleSearch(
          extractedSearch.query
        );


        await addHistory(
          cleanedCommand,
          answer,
          type
        );


        if (shouldSpeak) {
          speak(answer);
        }


        return;
      }


      // =====================================================
      // GOOGLE OPEN
      // =====================================================

      if (
        lower === "open google" ||
        lower === "open google.com"
      ) {
        const answer =
          "Opening Google.";


        setAiText(answer);

        setShowAIText(true);

        openUrl(
          websites.google
        );


        await addHistory(
          cleanedCommand,
          answer,
          type
        );


        if (shouldSpeak) {
          speak(answer);
        }


        return;
      }


      // =====================================================
      // YOUTUBE SEARCH
      // =====================================================

      const youtubeQuery =
        getYouTubeQuery(
          cleanedCommand
        );


      if (
        youtubeQuery &&
        (
          lower.includes(
            "youtube"
          ) ||
          lower.startsWith(
            "play "
          )
        )
      ) {
        const answer =
          `Searching YouTube for ${youtubeQuery}.`;


        setAiText(answer);

        setShowAIText(true);


        youtubeSearch(
          youtubeQuery
        );


        await addHistory(
          cleanedCommand,
          answer,
          type
        );


        if (shouldSpeak) {
          speak(answer);
        }


        return;
      }


      // =====================================================
      // OPEN YOUTUBE
      // =====================================================

      if (
        lower === "open youtube" ||
        lower === "open youtube.com"
      ) {
        const answer =
          "Opening YouTube.";


        setAiText(answer);

        setShowAIText(true);

        openUrl(
          websites.youtube
        );


        await addHistory(
          cleanedCommand,
          answer,
          type
        );


        if (shouldSpeak) {
          speak(answer);
        }


        return;
      }


      // =====================================================
      // DIRECT WEBSITE
      // =====================================================

      const websiteNames =
        Object.keys(websites);


      for (
        const site of websiteNames
      ) {
        if (
          lower ===
            `open ${site}` ||
          lower ===
            `open ${site}.com`
        ) {
          const answer =
            `Opening ${site}.`;


          setAiText(answer);

          setShowAIText(true);

          openUrl(
            websites[site]
          );


          await addHistory(
            cleanedCommand,
            answer,
            type
          );


          if (shouldSpeak) {
            speak(answer);
          }


          return;
        }
      }


      // =====================================================
      // WEBSITE SEARCH
      // =====================================================

      const websiteSearchMatch =
        lower.match(
          /^search (.+) on (google|youtube|amazon|flipkart|wikipedia|reddit|github|linkedin|spotify|pinterest|facebook|x|twitter)$/
        );


      if (
        websiteSearchMatch
      ) {
        const query =
          cleanedCommand.match(
            /^search (.+) on (google|youtube|amazon|flipkart|wikipedia|reddit|github|linkedin|spotify|pinterest|facebook|x|twitter)$/i
          );


        const searchQuery =
          query?.[1]?.trim();


        const site =
          query?.[2]?.toLowerCase();


        const url =
          getWebsiteSearchUrl(
            site,
            searchQuery
          );


        const answer =
          `Searching ${site} for ${searchQuery}.`;


        setAiText(answer);

        setShowAIText(true);


        if (url) {
          openUrl(url);
        }


        await addHistory(
          cleanedCommand,
          answer,
          type
        );


        if (shouldSpeak) {
          speak(answer);
        }


        return;
      }


      // =====================================================
      // GEMINI
      // =====================================================

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
              cleanResult,
          };
        }
      }


      const rawResponse =
        parsedResult?.response ||
        parsedResult?.answer ||
        parsedResult?.text ||
        "Sorry, I could not understand that.";


      const response =
        cleanAIResponse(
          rawResponse
        );


      // =====================================================
      // GEMINI ACTIONS
      // =====================================================

      if (
        parsedResult?.type ===
        "google_open"
      ) {
        openUrl(
          websites.google
        );
      }


      else if (
        parsedResult?.type ===
        "google_search"
      ) {
        const extracted =
          extractSearchCommand(
            cleanedCommand
          );


        const query =
          extracted?.site ===
          "google"
            ? extracted.query
            : parsedResult?.query;


        if (
          query?.trim()
        ) {
          googleSearch(
            query
          );
        }
      }


      else if (
        parsedResult?.type ===
        "youtube_open"
      ) {
        openUrl(
          websites.youtube
        );
      }


      else if (
        parsedResult?.type ===
          "youtube_search" ||
        parsedResult?.type ===
          "youtube_play"
      ) {
        const extractedQuery =
          getYouTubeQuery(
            cleanedCommand
          );


        const query =
          extractedQuery ||
          parsedResult?.query;


        if (
          query?.trim()
        ) {
          youtubeSearch(
            query
          );
        }
      }


      else if (
        parsedResult?.type ===
        "calculator_open"
      ) {
        openUrl(
          "https://www.google.com/search?q=calculator"
        );
      }


      // =====================================================
      // DISPLAY COMPLETE ANSWER
      // =====================================================

      setAiText(response);

      setShowAIText(true);


      await addHistory(
        cleanedCommand,
        response,
        type
      );


      // =====================================================
      // SPEAK ONLY VOICE QUESTIONS
      // =====================================================

      if (shouldSpeak) {
        speak(response);
      }
    }


    catch (error) {
      console.error(
        "PROCESS COMMAND ERROR:",
        error
      );


      const errorMessage =
        "Sorry, something went wrong while processing your request.";


      setAiText(
        errorMessage
      );

      setShowAIText(true);


      if (shouldSpeak) {
        speak(errorMessage);
      }
    }


    finally {
      processingRef.current =
        false;


      setIsSending(false);


      if (
        !speakingRef.current
      ) {
        setIsAIActive(false);
      }
    }
  };


  // =========================================================
  // IMAGE → DATA URL
  // =========================================================

  const imageFileToDataUrl = (
    file
  ) => {
    return new Promise(
      (resolve, reject) => {
        const reader =
          new FileReader();


        reader.onload = () => {
          const image =
            new Image();


          image.onload = () => {
            const maxSize =
              1000;


            let width =
              image.width;

            let height =
              image.height;


            if (
              width >
                maxSize ||
              height >
                maxSize
            ) {
              const ratio =
                Math.min(
                  maxSize /
                    width,
                  maxSize /
                    height
                );


              width =
                Math.round(
                  width * ratio
                );

              height =
                Math.round(
                  height * ratio
                );
            }


            const canvas =
              document.createElement(
                "canvas"
              );


            canvas.width =
              width;

            canvas.height =
              height;


            const ctx =
              canvas.getContext(
                "2d"
              );


            ctx.drawImage(
              image,
              0,
              0,
              width,
              height
            );


            resolve(
              canvas.toDataURL(
                "image/jpeg",
                0.72
              )
            );
          };


          image.onerror =
            reject;


          image.src =
            reader.result;
        };


        reader.onerror =
          reject;


        reader.readAsDataURL(
          file
        );
      }
    );
  };


  // =========================================================
  // IMAGE SELECT
  // =========================================================

  const handleImageSelect = (
    event
  ) => {
    const file =
      event.target.files?.[0];


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
        "Image size must be less than 10MB."
      );

      return;
    }


    removePdf();


    if (imagePreview) {
      URL.revokeObjectURL(
        imagePreview
      );
    }


    const previewUrl =
      URL.createObjectURL(
        file
      );


    setSelectedImage(file);

    setImagePreview(
      previewUrl
    );
  };


  // =========================================================
  // PASTE IMAGE
  // =========================================================

  const handlePaste = (
    event
  ) => {
    const items =
      event.clipboardData?.items;


    if (!items) {
      return;
    }


    for (
      const item of items
    ) {
      if (
        item.type.startsWith(
          "image/"
        )
      ) {
        event.preventDefault();


        const file =
          item.getAsFile();


        if (!file) {
          return;
        }


        removePdf();


        if (imagePreview) {
          URL.revokeObjectURL(
            imagePreview
          );
        }


        const previewUrl =
          URL.createObjectURL(
            file
          );


        setSelectedImage(
          file
        );

        setImagePreview(
          previewUrl
        );


        break;
      }
    }
  };


  // =========================================================
  // REMOVE IMAGE
  // =========================================================

  const removeImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(
        imagePreview
      );
    }


    setSelectedImage(null);

    setImagePreview("");


    if (
      imageInputRef.current
    ) {
      imageInputRef.current.value =
        "";
    }
  };


  // =========================================================
  // ANALYZE IMAGE
  // =========================================================

  const analyzeImage = async () => {
    if (!selectedImage) {
      return;
    }


    const question =
      typedText.trim() ||
      "Describe and analyze this image in detail.";


    setIsImageAnalyzing(true);

    setIsSending(true);

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
            withCredentials: true,
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          }
        );


      const rawAnswer =
        response.data?.response ||
        response.data?.answer ||
        response.data?.text ||
        "I could not analyze this image.";


      const answer =
        cleanAIResponse(
          rawAnswer
        );


      setUserText(question);

      setAiText(answer);

      setShowAIText(true);


      const imageData =
        await imageFileToDataUrl(
          selectedImage
        );


      setHistoryImage(
        imageData
      );


      await addHistory(
        question,
        answer,
        "image",
        imageData
      );


      setTypedText("");

      removeImage();
    }


    catch (error) {
      console.error(
        "IMAGE ANALYSIS ERROR:",
        error
      );


      setAiText(
        "Sorry, I could not analyze the image."
      );

      setShowAIText(true);
    }


    finally {
      setIsImageAnalyzing(false);

      setIsSending(false);

      setIsAIActive(false);
    }
  };


  // =========================================================
  // PDF SELECT
  // =========================================================

  const handlePdfSelect = (
    event
  ) => {
    const file =
      event.target.files?.[0];


    if (!file) {
      return;
    }


    if (
      file.type !==
      "application/pdf"
    ) {
      alert(
        "Please select a PDF file."
      );

      return;
    }


    if (
      file.size >
      20 * 1024 * 1024
    ) {
      alert(
        "PDF size must be less than 20MB."
      );

      return;
    }


    removeImage();


    setSelectedPdf(file);
  };


  // =========================================================
  // REMOVE PDF
  // =========================================================

  const removePdf = () => {
    setSelectedPdf(null);


    if (
      pdfInputRef.current
    ) {
      pdfInputRef.current.value =
        "";
    }
  };


  // =========================================================
  // ANALYZE PDF
  // =========================================================

  const analyzePdf = async () => {
    if (!selectedPdf) {
      return;
    }


    const question =
      typedText.trim() ||
      "Summarize and explain this PDF in detail.";


    setIsPdfAnalyzing(true);

    setIsSending(true);

    setIsAIActive(true);


    try {
      const formData =
        new FormData();


      formData.append(
        "pdf",
        selectedPdf
      );


      formData.append(
        "command",
        question
      );


      const response =
        await axios.post(
          `${serverUrl}/api/user/analyze-pdf`,
          formData,
          {
            withCredentials: true,
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          }
        );


      const rawAnswer =
        response.data?.response ||
        response.data?.answer ||
        response.data?.text ||
        "I could not analyze this PDF.";


      const answer =
        cleanAIResponse(
          rawAnswer
        );


      setUserText(question);

      setAiText(answer);

      setShowAIText(true);


      await addHistory(
        question,
        answer,
        "pdf"
      );


      setTypedText("");

      removePdf();
    }


    catch (error) {
      console.error(
        "PDF ANALYSIS ERROR:",
        error
      );


      setAiText(
        "Sorry, I could not analyze the PDF."
      );

      setShowAIText(true);
    }


    finally {
      setIsPdfAnalyzing(false);

      setIsSending(false);

      setIsAIActive(false);
    }
  };


  // =========================================================
  // SEND BUTTON
  // =========================================================

  const handleSend = async () => {
    if (isSending) {
      return;
    }


    // Image has priority
    if (selectedImage) {
      await analyzeImage();

      return;
    }


    // PDF next
    if (selectedPdf) {
      await analyzePdf();

      return;
    }


    // Normal typed question
    const command =
      typedText.trim();


    if (!command) {
      return;
    }


    setTypedText("");


    // FALSE means typed input.
    // Therefore it will NOT be spoken.
    await processCommand(
      command,
      "text",
      false
    );
  };


  // =========================================================
  // ENTER KEY
  // =========================================================

  const handleInputKeyDown = (
    event
  ) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      handleSend();
    }
  };


  // =========================================================
  // DELETE HISTORY
  // =========================================================

  const deleteHistory = async (
    historyId
  ) => {
    if (!historyId) {
      return;
    }


    try {
      await axios.delete(
        `${serverUrl}/api/user/history/${historyId}`,
        {
          withCredentials: true,
        }
      );


      setHistoryItems(
        (prev) =>
          prev.filter(
            (item) =>
              item._id !==
              historyId
          )
      );


      setUserData?.((prev) => {
        if (!prev) {
          return prev;
        }


        return {
          ...prev,
          history:
            (prev.history || []).filter(
              (item) =>
                item._id !==
                historyId
            ),
        };
      });
    }


    catch (error) {
      console.error(
        "DELETE HISTORY ERROR:",
        error
      );
    }
  };


  // =========================================================
  // CLEAR HISTORY
  // =========================================================

  const clearHistory = async () => {
    const confirmed =
      window.confirm(
        "Are you sure you want to clear all history?"
      );


    if (!confirmed) {
      return;
    }


    try {
      await axios.delete(
        `${serverUrl}/api/user/history`,
        {
          withCredentials: true,
        }
      );


      setHistoryItems([]);

      setUserData?.((prev) => {
        if (!prev) {
          return prev;
        }


        return {
          ...prev,
          history: [],
        };
      });
    }


    catch (error) {
      console.error(
        "CLEAR HISTORY ERROR:",
        error
      );
    }
  };


  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = async () => {
    stopSpeaking();

    stopListening();


    try {
      await axios.get(
        `${serverUrl}/api/auth/logout`,
        {
          withCredentials: true,
        }
      );
    } catch (error) {
      console.error(
        "LOGOUT ERROR:",
        error
      );
    }


    setUserData?.(null);

    navigate("/login");
  };


  // =========================================================
  // FILTER HISTORY
  // =========================================================

  const filteredHistory =
    historyItems.filter(
      (item) => {
        if (
          !historySearch.trim()
        ) {
          return true;
        }


        const search =
          historySearch
            .toLowerCase()
            .trim();


        const command =
          String(
            item.command || ""
          ).toLowerCase();


        const response =
          String(
            item.response || ""
          ).toLowerCase();


        return (
          command.includes(search) ||
          response.includes(search)
        );
      }
    );


  // =========================================================
  // USER DATA
  // =========================================================

  const assistantName =
    userData?.assistantName ||
    "Assistant";


  const userName =
    userData?.name ||
    "User";


  const assistantImage =
    userData?.assistantImage ||
    aiImg;


  // =========================================================
  // JSX
  // =========================================================

  return (
    <div
      className="min-h-screen bg-[#050816] text-white"
      onPaste={handlePaste}
    >
      {/* ===================================================
          HEADER
      =================================================== */}

      <header className="fixed left-0 right-0 top-0 z-70 border-b border-white/10 bg-[#050816]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                setShowHistory(
                  !showHistory
                )
              }
              className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-300 transition hover:bg-white/10 hover:text-white"
              title="History"
            >
              {showHistory ? (
                <IoMdClose
                  size={22}
                />
              ) : (
                <IoMdMenu
                  size={22}
                />
              )}
            </button>


            <div className="flex items-center gap-2">
              <img
                src={assistantImage}
                alt={assistantName}
                className="h-9 w-9 rounded-full object-cover ring-1 ring-cyan-400/30"
              />

              <div className="hidden sm:block">
                <p className="text-sm font-semibold">
                  {assistantName}
                </p>

                <p className="text-xs text-gray-500">
                  Virtual Assistant
                </p>
              </div>
            </div>
          </div>


          <div className="flex items-center gap-2">

            <button
              type="button"
              onClick={() =>
                navigate("/customize")
              }
              className="hidden items-center gap-2 rounded-xl px-3 py-2 text-sm text-gray-300 transition hover:bg-white/10 hover:text-white sm:flex"
            >
              <FiEdit3 size={16} />
              Customize
            </button>


            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setShowProfileMenu(
                    !showProfileMenu
                  )
                }
                className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/5"
              >
                {userData?.photo ? (
                  <img
                    src={userData.photo}
                    alt={userName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-semibold text-cyan-300">
                    {userName
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                )}
              </button>


              {showProfileMenu && (
                <div className="absolute right-0 top-12 w-56 overflow-hidden rounded-2xl border border-white/10 bg-[#0b1020] shadow-2xl">

                  <div className="border-b border-white/10 px-4 py-3">
                    <p className="truncate text-sm font-semibold">
                      {userName}
                    </p>

                    <p className="truncate text-xs text-gray-500">
                      {userData?.email || ""}
                    </p>
                  </div>


                  <button
                    type="button"
                    onClick={() =>
                      navigate("/profile")
                    }
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-white/5"
                  >
                    <FiSettings
                      size={16}
                    />
                    Profile & Settings
                  </button>


                  <button
                    type="button"
                    onClick={() =>
                      navigate("/customize")
                    }
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-white/5"
                  >
                    <FiEdit3
                      size={16}
                    />
                    Customize Assistant
                  </button>


                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-400/10"
                  >
                    <FiLogOut
                      size={16}
                    />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>


      {/* ===================================================
          HISTORY DRAWER
      =================================================== */}

      <aside
        className={`fixed bottom-0 left-0 top-16 z-60 w-[320px] max-w-[90vw] border-r border-white/10 bg-[#080c19] transition-transform duration-300 ${
          showHistory
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">

          <div className="border-b border-white/10 p-4">

            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiClock
                  size={18}
                  className="text-cyan-300"
                />

                <h2 className="font-semibold">
                  History
                </h2>
              </div>


              <button
                type="button"
                onClick={clearHistory}
                className="rounded-lg p-2 text-gray-500 hover:bg-red-400/10 hover:text-red-400"
                title="Clear history"
              >
                <FiTrash2
                  size={16}
                />
              </button>
            </div>


            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3">
              <FiSearch
                size={16}
                className="text-gray-500"
              />

              <input
                value={historySearch}
                onChange={(e) =>
                  setHistorySearch(
                    e.target.value
                  )
                }
                placeholder="Search history..."
                className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-gray-600"
              />
            </div>
          </div>


          <div className="flex-1 overflow-y-auto p-3">

            {filteredHistory.length ===
            0 ? (
              <div className="flex h-40 items-center justify-center text-center text-sm text-gray-600">
                No history yet.
              </div>
            ) : (
              <div className="space-y-2">
                {filteredHistory.map(
                  (item, index) => (
                    <div
                      key={
                        item._id ||
                        index
                      }
                      className="group rounded-xl border border-white/5 bg-white/2.5 p-3 transition hover:bg-white/5"
                    >

                      <div className="flex items-start justify-between gap-2">

                        <p className="line-clamp-2 text-sm font-medium text-gray-200">
                          {item.command}
                        </p>


                        <button
                          type="button"
                          onClick={() =>
                            deleteHistory(
                              item._id
                            )
                          }
                          className="shrink-0 text-gray-600 opacity-0 transition group-hover:opacity-100 hover:text-red-400"
                        >
                          <FiTrash2
                            size={14}
                          />
                        </button>
                      </div>


                      <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-gray-500">
                        {item.response}
                      </p>


                      {item.type && (
                        <span className="mt-2 inline-block rounded-md bg-white/5 px-2 py-1 text-[10px] uppercase tracking-wider text-gray-600">
                          {item.type}
                        </span>
                      )}
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </aside>


      {/* ===================================================
          MAIN
      =================================================== */}

      <main className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 pb-36 pt-24 sm:px-6">

        {/* Assistant */}
        <section className="flex flex-col items-center">

          <div
            className={`relative rounded-full transition-all duration-500 ${
              isAIActive
                ? "scale-105 shadow-[0_0_80px_rgba(34,211,238,0.18)]"
                : ""
            }`}
          >
            <img
              src={assistantImage}
              alt={assistantName}
              className="h-32 w-32 rounded-full object-cover ring-2 ring-cyan-400/20 sm:h-40 sm:w-40"
            />

            {isListening && (
              <div className="absolute inset-0 animate-ping rounded-full border border-cyan-400/30" />
            )}
          </div>


          <h1 className="mt-5 text-xl font-semibold sm:text-2xl">
            {assistantName}
          </h1>


          <p className="mt-2 text-center text-xs text-gray-500 sm:text-sm">
            {isPdfAnalyzing
              ? "Reading and analyzing PDF..."
              : isImageAnalyzing
              ? "Analyzing image..."
              : isSending
              ? "Thinking..."
              : isSpeaking
              ? "Speaking..."
              : isListening
              ? "Listening..."
              : "How can I help you?"}
          </p>


          {/* Stop speaking button */}
          {isSpeaking && (
            <button
              type="button"
              onClick={stopSpeaking}
              className="mt-4 flex items-center gap-2 rounded-full border border-red-400/20 bg-red-400/10 px-4 py-2 text-sm text-red-300 transition hover:bg-red-400/20"
            >
              <FiX size={15} />
              Stop speaking
            </button>
          )}
        </section>


        {/* =================================================
            CONVERSATION
        ================================================= */}

        <section className="mx-auto mt-10 w-full max-w-3xl space-y-5">

          {userText && (
            <div className="flex justify-end">
              <div className="max-w-[85%] rounded-2xl rounded-br-md bg-cyan-400/10 px-4 py-3 text-sm leading-relaxed text-gray-200 ring-1 ring-cyan-400/10">
                <p className="wrap-break-word whitespace-pre-wrap">
                  {userText}
                </p>
              </div>
            </div>
          )}


          {showAIText &&
            aiText && (
              <div className="flex justify-start">
                <div className="max-w-[90%] rounded-2xl rounded-bl-md border border-white/10 bg-white/5 px-4 py-4 text-sm leading-7 text-gray-200">
                  <p className="wrap-break-word whitespace-pre-wrap">
                    {aiText}
                  </p>
                </div>
              </div>
            )}


          {/* Image preview */}
          {imagePreview && (
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-3">

              <button
                type="button"
                onClick={removeImage}
                className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-red-500/70"
              >
                <FiX size={16} />
              </button>


              <img
                src={imagePreview}
                alt="Selected"
                className="max-h-80 w-full rounded-xl object-contain"
              />
            </div>
          )}


          {/* PDF preview */}
          {selectedPdf && (
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-400/10 text-red-300">
                <FiFileText
                  size={22}
                />
              </div>


              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-200">
                  {selectedPdf.name}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  PDF ready for analysis
                </p>
              </div>


              <button
                type="button"
                onClick={removePdf}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-gray-500 hover:bg-red-400/10 hover:text-red-400"
              >
                <FiX size={18} />
              </button>
            </div>
          )}
        </section>
      </main>


      {/* ===================================================
          INPUT AREA
      =================================================== */}

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#050816]/95 backdrop-blur-xl">

        <div className="mx-auto max-w-3xl px-4 py-4 sm:px-6">

          <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-white/5 p-2">

            {/* IMAGE BUTTON */}
            <button
              type="button"
              onClick={() =>
                imageInputRef.current?.click()
              }
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-gray-400 transition hover:bg-white/5 hover:text-cyan-300 sm:h-11 sm:w-11"
              title="Upload image"
            >
              <FiImage
                size={19}
              />
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


            {/* PDF BUTTON */}
            <button
              type="button"
              onClick={() =>
                pdfInputRef.current?.click()
              }
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-gray-400 transition hover:bg-white/5 hover:text-cyan-300 sm:h-11 sm:w-11"
              title="Upload PDF"
            >
              <FiFileText
                size={19}
              />
            </button>


            <input
              ref={pdfInputRef}
              type="file"
              accept="application/pdf"
              onChange={
                handlePdfSelect
              }
              className="hidden"
            />


            {/* TEXT INPUT */}
            <textarea
              value={typedText}
              onChange={(e) =>
                setTypedText(
                  e.target.value
                )
              }
              onKeyDown={
                handleInputKeyDown
              }
              placeholder={
                selectedImage
                  ? "Ask something about this image..."
                  : selectedPdf
                  ? "Ask something about this PDF..."
                  : "Type your message..."
              }
              rows={1}
              className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-2 py-2.5 text-sm leading-5 text-white outline-none placeholder:text-gray-600 sm:min-h-11"
            />


            {/* MICROPHONE */}
            <button
              type="button"
              onClick={() => {
                // If assistant is speaking,
                // stop speech.
                if (isSpeaking) {
                  stopSpeaking();

                  return;
                }


                // If microphone is listening,
                // stop microphone.
                if (isListening) {
                  stopListening();

                  return;
                }


                // Otherwise start microphone.
                startListening();
              }}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition sm:h-11 sm:w-11 ${
                isSpeaking ||
                isListening
                  ? "bg-red-400/10 text-red-400 hover:bg-red-400/20"
                  : "text-gray-400 hover:bg-white/5 hover:text-cyan-300"
              }`}
              title={
                isSpeaking
                  ? "Stop speaking"
                  : isListening
                  ? "Stop microphone"
                  : "Start microphone"
              }
            >
              {isSpeaking ? (
                <FiX size={19} />
              ) : isListening ? (
                <FiMicOff
                  size={19}
                />
              ) : (
                <FiMic size={19} />
              )}
            </button>


            {/* SEND */}
            <button
              type="button"
              onClick={handleSend}
              disabled={
                isSending ||
                (
                  !typedText.trim() &&
                  !selectedImage &&
                  !selectedPdf
                )
              }
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400 text-black transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-30 sm:h-11 sm:w-11"
              title="Send"
            >
              <FiSend
                size={18}
              />
            </button>
          </div>


          <p className="mt-2 text-center text-[10px] text-gray-600">
            Voice questions are spoken aloud. Typed questions are displayed silently.
          </p>
        </div>
      </div>


      {/* ===================================================
          MOBILE HISTORY OVERLAY
      =================================================== */}

      {showHistory && (
        <button
          type="button"
          aria-label="Close history"
          onClick={() =>
            setShowHistory(false)
          }
          className="fixed inset-0 z-50 bg-black/50 md:hidden"
        />
      )}
    </div>
  );
}


// ===========================================================
// ONLY ONE DEFAULT EXPORT
// ===========================================================

export default Home;