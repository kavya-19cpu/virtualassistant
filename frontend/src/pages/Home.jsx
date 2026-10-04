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
  FiEdit3,
  FiFileText
} from "react-icons/fi";


function Home() {

  const {
    userData,
    serverUrl,
    setUserData,
    getGeminiResponse,
    analyzePdfFile
  } = useContext(
    userDataContext
  );


  const navigate =
    useNavigate();


  /*
  =====================================================
  STATE
  =====================================================
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
    showHistory,
    setShowHistory
  ] = useState(false);


  const [
    showProfileMenu,
    setShowProfileMenu
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


  /*
  -----------------------------------------------------
  IMAGE
  -----------------------------------------------------
  */

  const [
    selectedImage,
    setSelectedImage
  ] = useState(null);


  const [
    imagePreview,
    setImagePreview
  ] = useState("");


  const [
    isImageAnalyzing,
    setIsImageAnalyzing
  ] = useState(false);


  /*
  -----------------------------------------------------
  PDF
  -----------------------------------------------------
  */

  const [
    selectedPdf,
    setSelectedPdf
  ] = useState(null);


  const [
    pdfPreview,
    setPdfPreview
  ] = useState("");


  const [
    isPdfAnalyzing,
    setIsPdfAnalyzing
  ] = useState(false);


  const [
    pdfName,
    setPdfName
  ] = useState("");


  /*
  -----------------------------------------------------
  HISTORY IMAGE
  -----------------------------------------------------
  */

  const [
    historyImage,
    setHistoryImage
  ] = useState("");


  /*
  -----------------------------------------------------
  CURRENT PDF SESSION
  -----------------------------------------------------
  */

  const [
    activePdf,
    setActivePdf
  ] = useState(null);


  /*
  =====================================================
  REFS
  =====================================================
  */

  const imageInputRef =
    useRef(null);


  const pdfInputRef =
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


  const answerRef =
    useRef(null);


  const assistantNameRef =
    useRef("");


  /*
  =====================================================
  ASSISTANT NAME
  =====================================================
  */

  useEffect(() => {

    assistantNameRef.current =
      userData?.assistantName ||
      "Assistant";

  }, [
    userData?.assistantName
  ]);


  /*
  =====================================================
  LOAD HISTORY
  =====================================================
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
  =====================================================
  CLEAN AI RESPONSE
  =====================================================
  */

  const cleanAIResponse =
    text => {

      if (!text) {
        return "";
      }

      let cleaned =
        String(text);


      cleaned =
        cleaned.replace(
          /```(?:json|javascript|js|text|markdown|md)?/gi,
          ""
        );


      cleaned =
        cleaned.replace(
          /```/g,
          ""
        );


      cleaned =
        cleaned.replace(
          /\*\*/g,
          ""
        );


      cleaned =
        cleaned.replace(
          /__/g,
          ""
        );


      cleaned =
        cleaned.replace(
          /^\s*#{1,6}\s*/gm,
          ""
        );


      cleaned =
        cleaned.replace(
          /^\s*>\s?/gm,
          ""
        );


      cleaned =
        cleaned.replace(
          /^\s*[-*+]\s+/gm,
          ""
        );


      cleaned =
        cleaned.replace(
          /`/g,
          ""
        );


      cleaned =
        cleaned.replace(
          /\$\$/g,
          ""
        );


      cleaned =
        cleaned.replace(
          /\$/g,
          ""
        );


      cleaned =
        cleaned.replace(
          /\\\[/g,
          ""
        );


      cleaned =
        cleaned.replace(
          /\\\]/g,
          ""
        );


      cleaned =
        cleaned.replace(
          /\\\(/g,
          ""
        );


      cleaned =
        cleaned.replace(
          /\\\)/g,
          ""
        );


      let previous =
        "";

      while (
        previous !==
        cleaned
      ) {

        previous =
          cleaned;

        cleaned =
          cleaned.replace(
            /\\(?:frac|dfrac|tfrac)\{([^{}]+)\}\{([^{}]+)\}/g,
            "$1/$2"
          );

      }


      cleaned =
        cleaned

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
          );


      cleaned =
        cleaned.replace(
          /\\left\b/g,
          ""
        );


      cleaned =
        cleaned.replace(
          /\\right\b/g,
          ""
        );


      cleaned =
        cleaned

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
          );


      cleaned =
        cleaned

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
          );


      cleaned =
        cleaned

          .replace(
            /sin\^\{-1\}/g,
            "sin⁻¹"
          )

          .replace(
            /cos\^\{-1\}/g,
            "cos⁻¹"
          )

          .replace(
            /tan\^\{-1\}/g,
            "tan⁻¹"
          );


      cleaned =
        cleaned.replace(
          /[{}]/g,
          ""
        );


      cleaned =
        cleaned.replace(
          /[ \t]+/g,
          " "
        );


      cleaned =
        cleaned.replace(
          /\n[ \t]+/g,
          "\n"
        );


      cleaned =
        cleaned.replace(
          /\n{3,}/g,
          "\n\n"
        );


      return cleaned.trim();

    };


  /*
  =====================================================
  SAVE HISTORY
  =====================================================
  */

  const addHistory =
    async (
      command,
      answer,
      type = "text",
      image = ""
    ) => {

      const temporaryItem = {

        _id:
          `temp-${Date.now()}`,

        command,

        answer,

        type,

        image,

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
              type,
              image
            },

            {
              withCredentials:
                true
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
  =====================================================
  DELETE HISTORY
  =====================================================
  */

  const deleteHistory =
    async historyId => {

      if (!historyId) {
        return;
      }

      try {

        const response =
          await axios.delete(

            `${serverUrl}/api/user/history/${historyId}`,

            {
              withCredentials:
                true
            }

          );


        const updatedHistory =
          response.data.history ||
          [];


        setHistoryItems(
          updatedHistory
        );


        setUserData(
          previous => ({

            ...previous,

            history:
              updatedHistory

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
  =====================================================
  CLEAR HISTORY
  =====================================================
  */

  const clearHistory =
    async () => {

      if (
        historyItems.length ===
        0
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
            withCredentials:
              true
          }

        );


        setHistoryItems([]);

        setHistoryImage("");

        setUserText("");

        setAiText("");

        setShowAIText(false);

        setActivePdf(null);


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
  =====================================================
  SPEECH
  =====================================================
  */

  const speak =
    text => {

      if (!text) {
        return;
      }


      const speechText =
        String(text).trim();


      if (!speechText) {
        return;
      }


      window.speechSynthesis.cancel();


      clearTimeout(
        speechTimeoutRef.current
      );


      const sentences =
        speechText.match(
          /[^.!?]+[.!?]+|[^.!?]+$/g
        ) || [
          speechText
        ];


      const chunks = [];

      let currentChunk =
        "";


      sentences.forEach(
        sentence => {

          const cleanSentence =
            sentence.trim();


          if (!cleanSentence) {
            return;
          }


          const combined =
            `${currentChunk} ${cleanSentence}`.trim();


          if (
            combined.length >
            180
          ) {

            if (
              currentChunk.trim()
            ) {

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

        }
      );


      if (
        currentChunk.trim()
      ) {

        chunks.push(
          currentChunk.trim()
        );

      }


      if (
        chunks.length ===
        0
      ) {

        chunks.push(
          speechText
        );

      }


      let currentIndex =
        0;


      speakingRef.current =
        true;


      setIsAIActive(true);


      const speakNextChunk =
        () => {

          if (
            currentIndex >=
            chunks.length
          ) {

            speakingRef.current =
              false;

            setIsAIActive(
              false
            );


            if (
              listeningRef.current &&
              !processingRef.current &&
              recognitionRef.current
            ) {

              try {
                recognitionRef.current.start();
              } catch { }

            }

            return;

          }


          const utterance =
            new SpeechSynthesisUtterance(
              chunks[
              currentIndex
              ]
            );


          utterance.rate =
            1;

          utterance.pitch =
            1;

          utterance.volume =
            1;

          utterance.lang =
            "en-US";


          utterance.onstart =
            () => {

              speakingRef.current =
                true;

              setIsAIActive(
                true
              );

            };


          utterance.onend =
            () => {

              currentIndex++;


              speechTimeoutRef.current =
                setTimeout(
                  () => {
                    speakNextChunk();
                  },
                  80
                );

            };


          utterance.onerror =
            () => {

              currentIndex++;


              speechTimeoutRef.current =
                setTimeout(
                  () => {
                    speakNextChunk();
                  },
                  80
                );

            };


          window.speechSynthesis.speak(
            utterance
          );

        };


      speakNextChunk();

    };


  /*
  =====================================================
  OPEN URL
  =====================================================
  */

  const openUrl =
    url => {

      if (!url) {
        return;
      }


      window.open(
        url,
        "_blank",
        "noopener,noreferrer"
      );

    };


  /*
  =====================================================
  SEARCH
  =====================================================
  */

  const googleSearch =
    query => {

      if (!query?.trim()) {
        return;
      }


      openUrl(
        `https://www.google.com/search?q=${encodeURIComponent(
          query.trim()
        )}`
      );

    };


  const youtubeSearch =
    query => {

      if (!query?.trim()) {
        return;
      }


      openUrl(
        `https://www.youtube.com/results?search_query=${encodeURIComponent(
          query.trim()
        )}`
      );

    };


  /*
  =====================================================
  WEBSITES
  =====================================================
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


  /*
  =====================================================
  WEBSITE SEARCH
  =====================================================
  */

  const getWebsiteSearchUrl =
    (
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


  /*
  =====================================================
  EXTRACT SEARCH COMMAND
  =====================================================
  */

  const extractSearchCommand =
    command => {

      if (!command) {
        return null;
      }


      const text =
        command
          .trim()
          .replace(
            /\s+/g,
            " "
          );


      let match;


      match =
        text.match(
          /^(?:search|find|look up)\s+(.+?)\s+(?:on|in)\s+(google|youtube|instagram|facebook|github|linkedin|amazon|flipkart|spotify|wikipedia|reddit|pinterest|twitter|x)$/i
        );


      if (match) {

        return {

          site:
            match[2]
              .trim()
              .toLowerCase(),

          query:
            match[1].trim()

        };

      }


      match =
        text.match(
          /^(?:search|find|look up)\s+(google|youtube|instagram|facebook|github|linkedin|amazon|flipkart|spotify|wikipedia|reddit|pinterest|twitter|x)\s+(?:for)\s+(.+)$/i
        );


      if (match) {

        return {

          site:
            match[1]
              .trim()
              .toLowerCase(),

          query:
            match[2].trim()

        };

      }


      match =
        text.match(
          /^(?:open|launch|visit|go to|take me to)\s+(google|youtube|instagram|facebook|github|linkedin|amazon|flipkart|spotify|wikipedia|reddit|pinterest|twitter|x)(?:\s+website|\s+site)?\s+(?:and\s+)?(?:search|find|look up)\s+(.+)$/i
        );


      if (match) {

        return {

          site:
            match[1]
              .trim()
              .toLowerCase(),

          query:
            match[2].trim()

        };

      }


      return null;

    };


  /*
  =====================================================
  YOUTUBE QUERY
  =====================================================
  */

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


  /*
  =====================================================
  PROCESS COMMAND
  =====================================================
  */

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


      setHistoryImage("");

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
        =================================================
        SEARCH
        =================================================
        */

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


          setAiText(
            answer
          );

          setShowAIText(
            true
          );


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
            openUrl(
              searchUrl
            );
          }


          if (shouldSpeak) {
            speak(answer);
          }


          return;

        }


        /*
        =================================================
        SIMPLE GOOGLE
        =================================================
        */

        const googleSearchMatch =
          cleanedCommand.match(
            /^(?:search|google)\s+(.+)$/i
          );


        if (
          googleSearchMatch
        ) {

          const query =
            googleSearchMatch[1]
              .trim();


          const answer =
            `Searching Google for ${query}.`;


          setAiText(
            answer
          );

          setShowAIText(
            true
          );


          await addHistory(
            cleanedCommand,
            answer,
            type
          );


          googleSearch(
            query
          );


          if (shouldSpeak) {
            speak(answer);
          }


          return;

        }


        /*
        =================================================
        YOUTUBE
        =================================================
        */

        const youtubeQuery =
          getYouTubeQuery(
            cleanedCommand
          );


        if (youtubeQuery) {

          const answer =
            `Searching YouTube for ${youtubeQuery}.`;


          setAiText(
            answer
          );

          setShowAIText(
            true
          );


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


        /*
        =================================================
        DIRECT WEBSITE
        =================================================
        */

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


            setAiText(
              answer
            );

            setShowAIText(
              true
            );


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


        /*
        =================================================
        NORMAL GEMINI
        =================================================
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

              type:
                "general",

              response:
                cleanResult

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


        if (
          parsedResult?.type ===
          "google_open"
        ) {

          openUrl(
            "https://www.google.com"
          );

        }


        else if (
          parsedResult?.type ===
          "google_search"
        ) {

          if (
            parsedResult?.query
          ) {

            googleSearch(
              parsedResult.query
            );

          }

        }


        else if (
          parsedResult?.type ===
          "youtube_open"
        ) {

          openUrl(
            "https://www.youtube.com"
          );

        }


        else if (
          parsedResult?.type ===
          "youtube_search" ||
          parsedResult?.type ===
          "youtube_play"
        ) {

          if (
            parsedResult?.query
          ) {

            youtubeSearch(
              parsedResult.query
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


        setAiText(
          response
        );

        setShowAIText(
          true
        );


        await addHistory(
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

        setShowAIText(
          true
        );


        if (shouldSpeak) {
          speak(
            errorMessage
          );
        }

      } finally {

        processingRef.current =
          false;

        setIsSending(
          false
        );


        if (
          !speakingRef.current
        ) {

          setIsAIActive(
            false
          );

        }

      }

    };


  /*
  =====================================================
  SEND MESSAGE
  =====================================================
  */

  const handleSend =
    async e => {

      e?.preventDefault();


      /*
      -------------------------------------------------
      IMAGE
      -------------------------------------------------
      */

      if (selectedImage) {

        await analyzeImage();

        return;

      }


      /*
      -------------------------------------------------
      PDF
      -------------------------------------------------
      */

      if (selectedPdf) {

        await analyzePdf();

        return;

      }


      /*
      -------------------------------------------------
      NORMAL TEXT
      -------------------------------------------------
      */

      if (
        !typedText.trim() ||
        isSending
      ) {

        return;

      }


      const command =
        typedText.trim();


      setTypedText("");


      setHistoryImage("");


      /*
      If a PDF session is active,
      send the question with the PDF.
      */

      if (activePdf) {

        await analyzePdfQuestion(
          command
        );

        return;

      }


      await processCommand(
        command,
        "text",
        false
      );

    };


  /*
  =====================================================
  IMAGE SELECT
  =====================================================
  */

  const handleImageSelect =
    e => {

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


      removePdf();


      setHistoryImage("");

      setSelectedImage(
        file
      );

      setImagePreview(
        URL.createObjectURL(
          file
        )
      );

    };


  /*
  =====================================================
  PDF SELECT
  =====================================================
  */

  const handlePdfSelect =
    e => {

      const file =
        e.target.files?.[0];


      if (!file) {
        return;
      }


      const isPdf =
        file.type ===
        "application/pdf" ||
        file.name
          .toLowerCase()
          .endsWith(".pdf");


      if (!isPdf) {

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
          "PDF must be smaller than 20 MB."
        );

        return;

      }


      removeImage();


      setHistoryImage("");

      setActivePdf(null);

      setSelectedPdf(
        file
      );

      setPdfName(
        file.name
      );

      setPdfPreview(
        URL.createObjectURL(
          file
        )
      );


      setUserText("");

      setAiText("");

      setShowAIText(false);

    };


  /*
  =====================================================
  REMOVE IMAGE
  =====================================================
  */

  const removeImage =
    () => {

      if (imagePreview) {

        URL.revokeObjectURL(
          imagePreview
        );

      }


      setSelectedImage(
        null
      );

      setImagePreview(
        ""
      );


      if (
        imageInputRef.current
      ) {

        imageInputRef.current.value =
          "";

      }

    };


  /*
  =====================================================
  REMOVE PDF
  =====================================================
  */

  const removePdf =
    () => {

      if (pdfPreview) {

        URL.revokeObjectURL(
          pdfPreview
        );

      }


      setSelectedPdf(
        null
      );

      setPdfPreview(
        ""
      );

      setPdfName(
        ""
      );


      if (
        pdfInputRef.current
      ) {

        pdfInputRef.current.value =
          "";

      }

    };


  /*
  =====================================================
  PDF ANALYSIS
  =====================================================
  */

  const analyzePdf =
    async () => {

      if (
        !selectedPdf ||
        isPdfAnalyzing
      ) {

        return;

      }


      const question =
        typedText.trim() ||
        "Analyze this PDF and explain its important contents.";


      setIsPdfAnalyzing(
        true
      );

      setIsAIActive(
        true
      );

      setUserText(
        question
      );

      setAiText("");

      setShowAIText(
        false
      );


      try {

        const result =
          await analyzePdfFile(
            selectedPdf,
            question
          );


        const answer =
          cleanAIResponse(
            result?.response ||
            result?.answer ||
            "I could not analyze this PDF."
          );


        setAiText(
          answer
        );

        setShowAIText(
          true
        );


        /*
        Keep the PDF in memory
        for follow-up questions.
        */

        setActivePdf(
          selectedPdf
        );


        await addHistory(
          question,
          answer,
          "pdf"
        );


        setTypedText("");

        removePdf();


      } catch (error) {

        console.error(
          "PDF ANALYSIS ERROR:",
          error.response?.data ||
          error.message
        );


        const errorMessage =
          error.response?.data?.message ||
          "Unable to analyze the PDF.";


        setAiText(
          errorMessage
        );

        setShowAIText(
          true
        );

      } finally {

        setIsPdfAnalyzing(
          false
        );

        if (
          !speakingRef.current
        ) {

          setIsAIActive(
            false
          );

        }

      }

    };


  /*
  =====================================================
  ASK QUESTION ABOUT ACTIVE PDF
  =====================================================
  */

  const analyzePdfQuestion =
    async question => {

      if (
        !activePdf ||
        !question.trim() ||
        isPdfAnalyzing
      ) {

        return;

      }


      setIsPdfAnalyzing(
        true
      );

      setIsAIActive(
        true
      );

      setUserText(
        question
      );

      setAiText("");

      setShowAIText(
        false
      );


      try {

        const result =
          await analyzePdfFile(
            activePdf,
            question
          );


        const answer =
          cleanAIResponse(
            result?.response ||
            result?.answer ||
            "I could not answer that question from the PDF."
          );


        setAiText(
          answer
        );

        setShowAIText(
          true
        );


        await addHistory(
          question,
          answer,
          "pdf"
        );


      } catch (error) {

        console.error(
          "PDF QUESTION ERROR:",
          error.response?.data ||
          error.message
        );


        setAiText(
          "Unable to answer the question from the PDF."
        );

        setShowAIText(
          true
        );

      } finally {

        setIsPdfAnalyzing(
          false
        );

        setIsAIActive(
          false
        );

      }

    };


  /*
  =====================================================
  IMAGE ANALYSIS
  =====================================================
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
        typedText.trim() ||
        "Analyze this image and explain what you see.";


      setHistoryImage("");

      setIsImageAnalyzing(
        true
      );

      setUserText(
        question
      );

      setAiText("");

      setShowAIText(
        false
      );

      setIsAIActive(
        true
      );


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
              withCredentials:
                true,

              timeout:
                120000
            }

          );


        const rawAnswer =
          response.data?.response ||
          response.data?.answer ||
          "I could not analyze the image.";


        const answer =
          cleanAIResponse(
            rawAnswer
          );


        setAiText(
          answer
        );

        setShowAIText(
          true
        );


        let imageForHistory =
          "";


        try {

          imageForHistory =
            await imageFileToDataUrl(
              selectedImage
            );

        } catch (
        imageError
        ) {

          console.error(
            "IMAGE HISTORY ERROR:",
            imageError
          );

        }


        await addHistory(
          question,
          answer,
          "image",
          imageForHistory
        );


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
          cleanAIResponse(
            errorMessage
          )
        );

        setShowAIText(
          true
        );

      } finally {

        setIsImageAnalyzing(
          false
        );


        if (
          !speakingRef.current
        ) {

          setIsAIActive(
            false
          );

        }

      }

    };


  /*
  =====================================================
  IMAGE TO DATA URL
  =====================================================
  */

  const imageFileToDataUrl =
    file => {

      return new Promise(
        (
          resolve,
          reject
        ) => {

          if (!file) {

            reject(
              new Error(
                "No image file provided"
              )
            );

            return;

          }


          const reader =
            new FileReader();


          reader.onload =
            () => {

              const img =
                new Image();


              img.onload =
                () => {

                  const maxSize =
                    1000;


                  let width =
                    img.width;


                  let height =
                    img.height;


                  if (
                    width >
                    maxSize ||
                    height >
                    maxSize
                  ) {

                    if (
                      width >
                      height
                    ) {

                      height =
                        Math.round(
                          (
                            height *
                            maxSize
                          ) /
                          width
                        );

                      width =
                        maxSize;

                    } else {

                      width =
                        Math.round(
                          (
                            width *
                            maxSize
                          ) /
                          height
                        );

                      height =
                        maxSize;

                    }

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


                  if (!ctx) {

                    reject(
                      new Error(
                        "Could not create canvas"
                      )
                    );

                    return;

                  }


                  ctx.drawImage(
                    img,
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


              img.onerror =
                () => {

                  reject(
                    new Error(
                      "Could not load image"
                    )
                  );

                };


              img.src =
                reader.result;

            };


          reader.onerror =
            () => {

              reject(
                new Error(
                  "Could not read image"
                )
              );

            };


          reader.readAsDataURL(
            file
          );

        }
      );

    };


  /*
  =====================================================
  PASTE IMAGE
  =====================================================
  */

  const handlePaste =
    event => {

      const clipboardItems =
        event.clipboardData?.items;


      if (!clipboardItems) {
        return;
      }


      for (
        let i = 0;
        i < clipboardItems.length;
        i++
      ) {

        const item =
          clipboardItems[i];


        if (
          item.type &&
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


          if (
            imagePreview
          ) {

            URL.revokeObjectURL(
              imagePreview
            );

          }


          setHistoryImage("");

          setSelectedImage(
            file
          );

          setImagePreview(
            URL.createObjectURL(
              file
            )
          );


          return;

        }

      }

    };


  /*
  =====================================================
  SPEECH RECOGNITION
  =====================================================
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


    recognition.continuous =
      true;


    recognition.lang =
      "en-US";


    recognition.interimResults =
      false;


    recognition.maxAlternatives =
      1;


    recognitionRef.current =
      recognition;


    recognition.onstart =
      () => {

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
        -------------------------------------------------
        PDF VOICE QUESTION
        -------------------------------------------------
        */

        if (activePdf) {

          await analyzePdfQuestion(
            transcript
          );

          /*
          Speak the complete PDF answer.
          */

          const currentAnswer =
            aiText;


          if (
            currentAnswer
          ) {

            speak(
              currentAnswer
            );

          }


          return;

        }


        /*
        -------------------------------------------------
        NORMAL VOICE QUESTION
        -------------------------------------------------
        */

        await processCommand(
          transcript,
          "voice",
          true
        );

      };


    recognition.onend =
      () => {

        if (
          listeningRef.current &&
          !speakingRef.current &&
          !processingRef.current
        ) {

          clearTimeout(
            restartTimeoutRef.current
          );


          restartTimeoutRef.current =
            setTimeout(
              () => {

                try {

                  recognition.start();

                } catch { }

              },
              400
            );

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


      clearTimeout(
        speechTimeoutRef.current
      );


      try {
        recognition.stop();
      } catch { }


      window.speechSynthesis.cancel();


      recognitionRef.current =
        null;

    };

  }, [
    getGeminiResponse,
    activePdf
  ]);


  /*
  =====================================================
  START LISTENING
  =====================================================
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


        speakingRef.current =
          false;


        listeningRef.current =
          true;


        setIsListening(
          true
        );


        recognitionRef.current.start();

      } catch {

        console.log(
          "Microphone already running."
        );

      }

    };


  /*
  =====================================================
  STOP LISTENING
  =====================================================
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

        } catch { }

      }

    };


  /*
  =====================================================
  LOGOUT
  =====================================================
  */

  const handleLogout =
    async () => {

      try {

        await axios.post(

          `${serverUrl}/api/auth/logout`,

          {},

          {
            withCredentials:
              true
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
  =====================================================
  FILTER HISTORY
  =====================================================
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
  =====================================================
  OPEN HISTORY
  =====================================================
  */

  const openHistory =
    item => {

      const command =
        item?.command ||
        "";


      const answer =
        item?.answer ||
        "";


      setUserText(
        command
      );


      setAiText(
        cleanAIResponse(
          answer
        )
      );


      setShowAIText(
        true
      );


      if (
        item?.type ===
        "image" &&
        item?.image
      ) {

        setHistoryImage(
          item.image
        );

      } else {

        setHistoryImage(
          ""
        );

      }


      setActivePdf(
        null
      );


      setShowHistory(
        false
      );

    };


  /*
  =====================================================
  FORMAT DATE
  =====================================================
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

          day:
            "2-digit",

          month:
            "short",

          year:
            "numeric",

          hour:
            "2-digit",

          minute:
            "2-digit"

        }
      );

    };


  /*
  =====================================================
  UI
  =====================================================
  */

  return (

    <div
      onPaste={
        handlePaste
      }

      className="
                relative
                flex
                min-h-screen
                w-full
                flex-col
                overflow-hidden
                bg-[#070B14]
                text-white
            "
    >

      {/* =========================================
                HEADER
            ========================================= */}

      <header
        className="
                    relative
                    z-40
                    flex
                    h-16
                    shrink-0
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

        <div
          className="
                        flex
                        min-w-0
                        items-center
                        gap-2
                        sm:gap-3
                    "
        >

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
                        "
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


          <div
            className="
                            min-w-0
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
              {
                userData?.assistantName ||
                "Assistant"
              }
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


        <div
          className="
                        relative
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
            onClick={() => {

              setShowProfileMenu(
                previous =>
                  !previous
              );

              setShowHistory(
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
                            overflow-hidden
                            rounded-full
                            border
                            border-white/10
                            bg-white/5
                            text-gray-300
                            transition
                            hover:border-cyan-400/30
                            hover:bg-cyan-400/10
                        "
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

              <FiSettings
                size={19}
              />

            )}

          </button>


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
                            "
            >

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
                                    "
                >
                  {
                    userData?.name ||
                    "User"
                  }
                </p>


                <p
                  className="
                                        truncate
                                        text-xs
                                        text-gray-500
                                    "
                >
                  {
                    userData?.email ||
                    "Account"
                  }
                </p>

              </div>


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
                                    hover:bg-white/5
                                "
              >

                <FiEdit3
                  size={17}
                  className="text-cyan-400"
                />

                Customize Assistant

              </button>


              <button
                onClick={
                  async () => {

                    await clearHistory();

                    setShowProfileMenu(
                      false
                    );

                  }
                }

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
                                    hover:bg-red-400/10
                                    hover:text-red-400
                                    disabled:opacity-40
                                "
              >

                <FiTrash2
                  size={17}
                />

                Clear All History

              </button>


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
                                    hover:bg-white/5
                                "
              >

                <FiLock
                  size={17}
                  className="text-cyan-400"
                />

                Change Password

              </button>


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
                                    hover:bg-red-400/10
                                "
              >

                <FiLogOut
                  size={17}
                />

                Logout

              </button>

            </div>

          )}

        </div>

      </header>


      {/* =========================================
                HISTORY
            ========================================= */}

      {showHistory && (

        <>

          <div
            onClick={() =>
              setShowHistory(
                false
              )
            }

            className="
                            fixed
                            inset-0
                            z-40
                            bg-black/50
                            backdrop-blur-sm
                        "
          />


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
                  Previous conversations
                </p>

              </div>


              <button
                onClick={() =>
                  setShowHistory(
                    false
                  )
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
                                "
              >

                <IoMdClose
                  size={21}
                />

              </button>

            </div>


            <div
              className="
                                shrink-0
                                border-b
                                border-white/10
                                p-4
                            "
            >

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


            <div
              className="
                                history-scroll
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
                                                            text-cyan-300
                                                        "
                          >
                            {
                              item.type ||
                              "text"
                            }
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

                            <span
                              className="
                                                                truncate
                                                            "
                            >
                              {
                                formatDate(
                                  item.createdAt
                                )
                              }
                            </span>

                          </span>

                        </div>


                        {item?.type ===
                          "image" &&
                          item?.image && (

                            <img
                              src={
                                item.image
                              }

                              alt="Previous question"

                              className="
                                                                mb-3
                                                                h-28
                                                                w-full
                                                                rounded-xl
                                                                border
                                                                border-white/10
                                                                bg-black/20
                                                                object-cover
                                                            "
                            />

                          )}


                        <p
                          className="
                                                        line-clamp-2
wrap-break-word                                                                     text-sm
                                                        text-gray-300
                                                    "
                        >
                          {
                            item.command
                          }
                        </p>


                        {item.answer && (

                          <p
                            className="
                                                            mt-2
                                                            line-clamp-2
wrap-break-word                                                                         text-xs
                                                            leading-relaxed
                                                            text-gray-600
                                                        "
                          >
                            {
                              item.answer
                            }
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


      {/* =========================================
                MAIN
            ========================================= */}

      <main
        className="
                    flex
                    min-h-0
                    flex-1
                    justify-center
                    overflow-hidden
                "
      >

        <section
          className="
                        flex
                        min-w-0
                        w-full
                        max-w-5xl
                        flex-1
                        flex-col
                        overflow-hidden
                        px-3
                        py-4
                        sm:px-6
                        sm:py-6
                    "
        >

          {/* =====================================
                        CONVERSATION
                    ===================================== */}

          <div
            className="
                            answer-scroll
                            min-h-0
                            flex-1
                            overflow-y-auto
                            overscroll-contain
                            px-1
                            pb-6
                        "
          >

            <div
              className="
                                flex
                                w-full
                                flex-col
                                items-center
                            "
            >

              {/* ASSISTANT */}

              <div
                className={`
                                    mt-2
                                    mb-4
                                    rounded-full
                                    p-1
                                    transition
                                    sm:mt-4
                                    sm:mb-5
                                    ${isAIActive
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
                                        sm:h-28
                                        sm:w-28
                                        md:h-32
                                        md:w-32
                                    "
                />

              </div>


              {/* NAME */}

              <h1
                className="
                                    w-full
                                    max-w-3xl
wrap-break-word                                    text-center
                                    text-xl
                                    font-semibold
                                    sm:text-2xl
                                    md:text-3xl
                                "
              >
                {
                  userData?.assistantName ||
                  "Assistant"
                }
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
                  : isPdfAnalyzing
                    ? "Analyzing PDF..."
                    : isImageAnalyzing
                      ? "Analyzing image..."
                      : speakingRef.current
                        ? "Speaking..."
                        : activePdf
                          ? `PDF active: ${activePdf.name}`
                          : "How can I help you?"}

              </p>


              {/* PDF SESSION */}

              {activePdf && (

                <div
                  className="
                                        mt-5
                                        flex
                                        w-full
                                        max-w-2xl
                                        items-center
                                        gap-3
                                        rounded-2xl
                                        border
                                        border-cyan-400/20
                                        bg-cyan-400/5
                                        p-3
                                    "
                >

                  <div
                    className="
                                            flex
                                            h-11
                                            w-11
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-xl
                                            bg-cyan-400/10
                                            text-cyan-300
                                        "
                  >

                    <FiFileText
                      size={21}
                    />

                  </div>


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
                      {
                        activePdf.name
                      }
                    </p>


                    <p
                      className="
                                                text-xs
                                                text-cyan-300/70
                                            "
                    >
                      PDF analysis active
                    </p>

                  </div>


                  <button
                    type="button"

                    onClick={() =>
                      setActivePdf(
                        null
                      )
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

                    <FiX
                      size={17}
                    />

                  </button>

                </div>

              )}


              {/* OLD IMAGE */}

              {historyImage && (

                <div
                  className="
                                        mt-5
                                        w-full
                                        max-w-2xl
                                        overflow-hidden
                                        rounded-2xl
                                        border
                                        border-cyan-400/10
                                        bg-black/20
                                        p-2
                                    "
                >

                  <img
                    src={
                      historyImage
                    }

                    alt="Previous image"

                    className="
                                            max-h-105
                                            w-full
                                            rounded-xl
                                            object-contain
                                        "
                  />

                </div>

              )}


              {/* USER QUESTION */}

              {userText && (

                <div
                  className="
                                        mt-5
                                        w-full
                                        max-w-3xl
                                       wrap-break-word             
                                        rounded-2xl
                                        border
                                        border-cyan-400/10
                                        bg-cyan-400/5
                                        px-4
                                        py-3
                                        text-left
                                        text-sm
                                        leading-relaxed
                                        text-gray-300
                                        sm:px-5
                                    "
                >
                  {userText}
                </div>

              )}


              {/* ANSWER */}

              {showAIText &&
                aiText && (

                  <div
                    ref={
                      answerRef
                    }

                    className="
                                            answer-box
                                            mt-4
                                            mb-6
                                            w-full
                                            max-w-3xl
                                            max-h-[55vh]
                                            overflow-y-auto
                                            overscroll-contain
                                           wrap-break-word             
                                            rounded-2xl
                                            border
                                            border-white/10
                                            bg-white/3
                                            px-4
                                            py-5
                                            text-left
                                            text-sm
                                            leading-7
                                            whitespace-pre-wrap
                                            text-gray-200
                                            sm:px-6
                                            sm:py-6
                                            sm:text-base
                                        "
                  >
                    {aiText}
                  </div>

                )}

            </div>

          </div>


          {/* =====================================
                        IMAGE PREVIEW
                    ===================================== */}

          {imagePreview && (

            <div
              className="
                                mb-3
                                w-full
                                max-w-3xl
                                self-center
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
                  src={
                    imagePreview
                  }

                  alt="Selected"

                  className="
                                        h-14
                                        w-14
                                        shrink-0
                                        rounded-xl
                                        object-cover
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
                    Ask your question and press Send.
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
                                        hover:text-red-400
                                    "
                >

                  <FiX
                    size={18}
                  />

                </button>

              </div>

            </div>

          )}


          {/* =====================================
                        PDF PREVIEW
                    ===================================== */}

          {pdfPreview && (

            <div
              className="
                                mb-3
                                w-full
                                max-w-3xl
                                self-center
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

                <div
                  className="
                                        flex
                                        h-14
                                        w-14
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-xl
                                        bg-red-400/10
                                        text-red-300
                                    "
                >

                  <FiFileText
                    size={24}
                  />

                </div>


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
                                        "
                  >
                    {pdfName}
                  </p>


                  <p
                    className="
                                            mt-1
                                            text-xs
                                            text-gray-500
                                        "
                  >
                    Ask a question about this PDF.
                  </p>

                </div>


                <button
                  type="button"

                  onClick={
                    removePdf
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
                                        hover:text-red-400
                                    "
                >

                  <FiX
                    size={18}
                  />

                </button>

              </div>

            </div>

          )}


          {/* =====================================
                        INPUT
                    ===================================== */}

          <div
            className="
                            w-full
                            max-w-3xl
                            self-center
                        "
          >

            <form
              onSubmit={
                handleSend
              }

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
                                    hover:bg-white/5
                                    hover:text-cyan-300
                                "

                title="Analyze image"
              >

                <FiImage
                  size={19}
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


              {/* PDF */}

              <button
                type="button"

                onClick={() =>
                  pdfInputRef.current?.click()
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
                                    hover:bg-white/5
                                    hover:text-cyan-300
                                "

                title="Upload PDF"
              >

                <FiFileText
                  size={19}
                />

              </button>


              <input
                ref={
                  pdfInputRef
                }

                type="file"

                accept="application/pdf,.pdf"

                onChange={
                  handlePdfSelect
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

                onPaste={
                  handlePaste
                }

                placeholder={
                  selectedImage
                    ? "Ask about the image..."
                    : selectedPdf
                      ? "Ask about the PDF..."
                      : activePdf
                        ? "Ask another question about the PDF..."
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
                                    h-10
                                    w-10
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-xl
                                    transition
                                    sm:h-11
                                    sm:w-11
                                    ${isListening
                    ? "bg-red-400/10 text-red-400"
                    : "text-gray-400 hover:bg-white/5 hover:text-cyan-300"
                  }
                                `}
              >

                {isListening ? (

                  <FiMicOff
                    size={19}
                  />

                ) : (

                  <FiMic
                    size={19}
                  />

                )}

              </button>


              {/* SEND */}

              <button
                type="submit"

                disabled={

                  isImageAnalyzing ||
                  isPdfAnalyzing ||
                  isSending ||

                  (
                    !selectedImage &&
                    !selectedPdf &&
                    !activePdf &&
                    !typedText.trim()
                  )

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
              >

                <FiSend
                  size={18}
                />

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
              Text • Voice • Image • PDF Analysis
            </p>

          </div>

        </section>

      </main>


      {/* =========================================
                CUSTOM SCROLLBAR
            ========================================= */}

      <style>
        {`
                    .answer-scroll,
                    .answer-box,
                    .history-scroll {
                        scrollbar-width: thin;
                        scrollbar-color: rgba(103, 232, 249, 0.25) transparent;
                    }

                    .answer-scroll::-webkit-scrollbar,
                    .answer-box::-webkit-scrollbar,
                    .history-scroll::-webkit-scrollbar {
                        width: 5px;
                    }

                    .answer-scroll::-webkit-scrollbar-track,
                    .answer-box::-webkit-scrollbar-track,
                    .history-scroll::-webkit-scrollbar-track {
                        background: transparent;
                    }

                    .answer-scroll::-webkit-scrollbar-thumb,
                    .answer-box::-webkit-scrollbar-thumb,
                    .history-scroll::-webkit-scrollbar-thumb {
                        background: rgba(103, 232, 249, 0.22);
                        border-radius: 999px;
                    }

                    .answer-scroll::-webkit-scrollbar-thumb:hover,
                    .answer-box::-webkit-scrollbar-thumb:hover,
                    .history-scroll::-webkit-scrollbar-thumb:hover {
                        background: rgba(103, 232, 249, 0.45);
                    }

                    @media (max-width: 640px) {
                        .answer-box {
                            max-height: 48vh;
                        }
                    }
                `}
      </style>

    </div>

  );

}


export default Home;