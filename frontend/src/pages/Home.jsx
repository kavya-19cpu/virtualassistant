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
  FiFileText,
  FiSquare
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

  const [isSpeaking, setIsSpeaking] =
    useState(false);

  const [userText, setUserText] =
    useState("");

  const [aiText, setAiText] =
    useState("");

  const [showAIText, setShowAIText] =
    useState(false);

  const [showHistory, setShowHistory] =
    useState(false);

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


  // =====================================================
  // IMAGE
  // =====================================================

  const [selectedImage, setSelectedImage] =
    useState(null);

  const [imagePreview, setImagePreview] =
    useState("");

  const [isImageAnalyzing, setIsImageAnalyzing] =
    useState(false);

  const [historyImage, setHistoryImage] =
    useState("");


  // =====================================================
  // PDF
  // =====================================================

  const [selectedPdf, setSelectedPdf] =
    useState(null);

  const [pdfPreviewName, setPdfPreviewName] =
    useState("");

  const [isPdfAnalyzing, setIsPdfAnalyzing] =
    useState(false);

  const [historyFileName, setHistoryFileName] =
    useState("");


  // =====================================================
  // REFS
  // =====================================================

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
  // CLEAN GEMINI RESPONSE
  // =====================================================

  const cleanAIResponse = text => {

    if (!text) {
      return "";
    }

    let cleaned = String(text);

    cleaned = cleaned.replace(
      /```(?:json|javascript|js|text|markdown|md)?/gi,
      ""
    );

    cleaned = cleaned.replace(
      /```/g,
      ""
    );

    cleaned = cleaned.replace(
      /\*\*/g,
      ""
    );

    cleaned = cleaned.replace(
      /__/g,
      ""
    );

    cleaned = cleaned.replace(
      /^\s*#{1,6}\s*/gm,
      ""
    );

    cleaned = cleaned.replace(
      /^\s*>\s?/gm,
      ""
    );

    cleaned = cleaned.replace(
      /^\s*[-*+]\s+/gm,
      ""
    );

    cleaned = cleaned.replace(
      /`/g,
      ""
    );

    cleaned = cleaned.replace(
      /\$\$/g,
      ""
    );

    cleaned = cleaned.replace(
      /\\\[/g,
      ""
    );

    cleaned = cleaned.replace(
      /\\\]/g,
      ""
    );

    cleaned = cleaned.replace(
      /\\\(/g,
      ""
    );

    cleaned = cleaned.replace(
      /\\\)/g,
      ""
    );


    let previous = "";

    while (previous !== cleaned) {

      previous = cleaned;

      cleaned = cleaned.replace(
        /\\(?:frac|dfrac|tfrac)\{([^{}]+)\}\{([^{}]+)\}/g,
        "$1/$2"
      );

    }


    cleaned = cleaned
      .replace(/\\pi\b/g, "π")
      .replace(
        /\\sqrt\{([^{}]+)\}/g,
        "√($1)"
      )
      .replace(/\\sin\b/g, "sin")
      .replace(/\\cos\b/g, "cos")
      .replace(/\\tan\b/g, "tan")
      .replace(/\\cot\b/g, "cot")
      .replace(/\\sec\b/g, "sec")
      .replace(/\\csc\b/g, "csc")
      .replace(/\\log\b/g, "log")
      .replace(/\\ln\b/g, "ln")
      .replace(/\\lim\b/g, "lim")
      .replace(/\\infty\b/g, "∞")
      .replace(/\\times\b/g, "×")
      .replace(/\\cdot\b/g, "·")
      .replace(/\\leq\b/g, "≤")
      .replace(/\\geq\b/g, "≥")
      .replace(/\\neq\b/g, "≠")
      .replace(/\\pm\b/g, "±");


    cleaned = cleaned.replace(
      /\\left\b/g,
      ""
    );

    cleaned = cleaned.replace(
      /\\right\b/g,
      ""
    );


    cleaned = cleaned
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


    cleaned = cleaned
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


    cleaned = cleaned
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


    cleaned = cleaned.replace(
      /[{}]/g,
      ""
    );

    cleaned = cleaned.replace(
      /[ \t]+/g,
      " "
    );

    cleaned = cleaned.replace(
      /\n[ \t]+/g,
      "\n"
    );

    cleaned = cleaned.replace(
      /\n{3,}/g,
      "\n\n"
    );

    return cleaned.trim();
  };


  // =====================================================
  // IMAGE -> DATA URL
  // =====================================================

  const imageFileToDataUrl = file => {

    return new Promise(
      (resolve, reject) => {

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


        reader.onload = () => {

          const img =
            new Image();


          img.onload = () => {

            const maxSize = 1000;

            let width =
              img.width;

            let height =
              img.height;


            if (
              width > maxSize ||
              height > maxSize
            ) {

              if (
                width > height
              ) {

                height =
                  Math.round(
                    (height * maxSize) /
                    width
                  );

                width =
                  maxSize;

              } else {

                width =
                  Math.round(
                    (width * maxSize) /
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


          img.onerror = () => {

            reject(
              new Error(
                "Could not load image"
              )
            );

          };


          img.src =
            reader.result;

        };


        reader.onerror = () => {

          reject(
            new Error(
              "Could not read image"
            )
          );

        };


        reader.readAsDataURL(file);

      }
    );

  };


  // =====================================================
  // SAVE HISTORY
  // =====================================================

  const addHistory = async (
    command,
    answer,
    type = "text",
    image = "",
    fileName = ""
  ) => {

    const temporaryItem = {

      _id:
        `temp-${Date.now()}`,

      command,
      answer,
      type,
      image,
      fileName,

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
            image,
            fileName
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


  // =====================================================
  // DELETE HISTORY
  // =====================================================

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
              withCredentials: true
            }

          );


        const updatedHistory =
          response.data?.history ||
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


  // =====================================================
  // CLEAR HISTORY
  // =====================================================

  const clearHistory = async () => {

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

      setHistoryImage("");

      setHistoryFileName("");

      setUserText("");

      setAiText("");

      setShowAIText(false);


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


  // =====================================================
  // STOP SPEAKING
  // =====================================================

  const stopSpeaking = () => {

    clearTimeout(
      speechTimeoutRef.current
    );

    window.speechSynthesis.cancel();

    speakingRef.current =
      false;

    setIsSpeaking(false);


    if (
      !processingRef.current
    ) {

      setIsAIActive(false);

    }

  };


  // =====================================================
  // SPEAK COMPLETE RESPONSE
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


    clearTimeout(
      speechTimeoutRef.current
    );


    window.speechSynthesis.cancel();


    // Split response into sentences first.
    const sentences =
      speechText.match(
        /[^.!?]+[.!?]+|[^.!?]+$/g
      ) || [speechText];


    const chunks = [];

    let currentChunk = "";


    sentences.forEach(
      sentence => {

        const cleanSentence =
          sentence.trim();


        if (!cleanSentence) {
          return;
        }


        // If an individual sentence is too long,
        // split it into words.
        if (
          cleanSentence.length > 160
        ) {

          const words =
            cleanSentence.split(
              /\s+/
            );


          let wordChunk = "";


          words.forEach(word => {

            const combined =
              `${wordChunk} ${word}`.trim();


            if (
              combined.length > 160
            ) {

              if (
                wordChunk.trim()
              ) {

                chunks.push(
                  wordChunk.trim()
                );

              }


              wordChunk =
                word;

            } else {

              wordChunk =
                combined;

            }

          });


          if (
            wordChunk.trim()
          ) {

            chunks.push(
              wordChunk.trim()
            );

          }


          return;

        }


        const combined =
          `${currentChunk} ${cleanSentence}`.trim();


        if (
          combined.length > 160
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
      chunks.length === 0
    ) {

      chunks.push(
        speechText
      );

    }


    let currentIndex = 0;


    speakingRef.current =
      true;

    setIsSpeaking(true);

    setIsAIActive(true);


    const speakNextChunk = () => {

      // USER PRESSED STOP
      if (
        !speakingRef.current
      ) {

        return;

      }


      // ALL CHUNKS FINISHED
      if (
        currentIndex >=
        chunks.length
      ) {

        speakingRef.current =
          false;

        setIsSpeaking(false);


        if (
          !processingRef.current
        ) {

          setIsAIActive(false);

        }


        // Start microphone again
        if (
          listeningRef.current &&
          !processingRef.current &&
          recognitionRef.current
        ) {

          setTimeout(() => {

            if (
              listeningRef.current &&
              !processingRef.current &&
              !speakingRef.current
            ) {

              try {

                recognitionRef.current.start();

                setIsListening(true);

              } catch {

                // Already running

              }

            }

          }, 400);

        }


        return;

      }


      const utterance =
        new SpeechSynthesisUtterance(
          chunks[currentIndex]
        );


      utterance.rate =
        1;

      utterance.pitch =
        1;

      utterance.volume =
        1;

      utterance.lang =
        "en-US";


      utterance.onstart = () => {

        if (
          !speakingRef.current
        ) {

          window.speechSynthesis.cancel();

          return;

        }


        setIsSpeaking(true);

        setIsAIActive(true);

      };


      utterance.onend = () => {

        if (
          !speakingRef.current
        ) {

          return;

        }


        currentIndex++;


        speechTimeoutRef.current =
          setTimeout(() => {

            speakNextChunk();

          }, 80);

      };


      utterance.onerror = event => {

        console.error(
          "Speech synthesis error:",
          event.error
        );


        // Don't continue if the user stopped it.
        if (
          !speakingRef.current
        ) {

          return;

        }


        currentIndex++;


        speechTimeoutRef.current =
          setTimeout(() => {

            speakNextChunk();

          }, 80);

      };


      // Chrome speech synthesis sometimes pauses.
      try {

        window.speechSynthesis.resume();

      } catch {}


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
  // WEBSITES
  // =====================================================

  const websites = {

    google:
      "https://www.google.com",

    youtube:
      "https://www.youtube.com",

    yahoo:
      "https://www.yahoo.com",

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

      case "yahoo":
        return `https://search.yahoo.com/search?p=${encodedQuery}`;

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

      case "instagram":
        return `https://www.instagram.com/explore/search/keyword/?q=${encodedQuery}`;

      default:
        return null;

    }

  };


  // =====================================================
  // SEARCH COMMAND PARSER
  // =====================================================

  const extractSearchCommand =
    command => {

      if (!command) {
        return null;
      }


      const text =
        command
          .trim()
          .replace(
            /[?!.]+$/g,
            ""
          )
          .replace(
            /\s+/g,
            " "
          );


      if (!text) {
        return null;
      }


      const siteAliases = {

        google: "google",
        goog: "google",

        youtube: "youtube",
        yt: "youtube",

        yahoo: "yahoo",

        instagram: "instagram",
        insta: "instagram",

        facebook: "facebook",
        fb: "facebook",

        github: "github",

        linkedin: "linkedin",

        amazon: "amazon",
        amzn: "amazon",

        flipkart: "flipkart",

        spotify: "spotify",

        wikipedia: "wikipedia",
        wiki: "wikipedia",

        reddit: "reddit",

        pinterest: "pinterest",

        twitter: "twitter",
        x: "x",

        whatsapp: "whatsapp",

        gmail: "gmail",

        netflix: "netflix",

        discord: "discord",

        canva: "canva",

        telegram: "telegram"

      };


      const siteNames =
        Object.keys(
          siteAliases
        ).join("|");


      let match;


      // search cats on google
      match =
        text.match(

          new RegExp(
            `^(?:search|find|look\\s+up)\\s+(?:for\\s+)?(.+?)\\s+(?:on|in|using)\\s+(${siteNames})$`,
            "i"
          )

        );


      if (match) {

        const query =
          match[1].trim();

        const site =
          siteAliases[
            match[2].toLowerCase()
          ];


        if (
          query &&
          site
        ) {

          return {
            site,
            query
          };

        }

      }


      // search google for cats
      match =
        text.match(

          new RegExp(
            `^(?:search|find|look\\s+up)\\s+(${siteNames})\\s+(?:for|about)\\s+(.+)$`,
            "i"
          )

        );


      if (match) {

        const site =
          siteAliases[
            match[1].toLowerCase()
          ];

        const query =
          match[2].trim();


        if (
          site &&
          query
        ) {

          return {
            site,
            query
          };

        }

      }


      // search google cats
      match =
        text.match(

          new RegExp(
            `^(?:search|find|look\\s+up)\\s+(${siteNames})\\s+(.+)$`,
            "i"
          )

        );


      if (match) {

        const site =
          siteAliases[
            match[1].toLowerCase()
          ];

        const query =
          match[2].trim();


        if (
          site &&
          query
        ) {

          return {
            site,
            query
          };

        }

      }


      // search cats
      match =
        text.match(
          /^(?:search|find|look\s+up)\s+(?:for\s+)?(.+)$/i
        );


      if (match) {

        const query =
          match[1].trim();


        const possibleSite =
          siteAliases[
            query.toLowerCase()
          ];


        if (
          query &&
          !possibleSite
        ) {

          return {
            site: "google",
            query
          };

        }

      }


      return null;

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


      setHistoryImage("");

      setHistoryFileName("");

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

        // =================================================
        // SEARCH COMMAND
        // =================================================

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

            openUrl(
              searchUrl
            );

          }


          if (shouldSpeak) {

            speak(answer);

          }


          return;

        }


        // =================================================
        // GOOGLE
        // =================================================

        const googleMatch =
          cleanedCommand.match(
            /^(?:google)\s+(.+)$/i
          );


        if (googleMatch) {

          const query =
            googleMatch[1].trim();


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


        // =================================================
        // YOUTUBE
        // =================================================

        const youtubeMatch =
          cleanedCommand.match(
            /^(?:youtube|yt)\s+(.+)$/i
          );


        if (youtubeMatch) {

          const query =
            youtubeMatch[1].trim();


          const answer =
            `Searching YouTube for ${query}.`;


          setAiText(answer);

          setShowAIText(true);


          await addHistory(
            cleanedCommand,
            answer,
            type
          );


          youtubeSearch(query);


          if (shouldSpeak) {

            speak(answer);

          }


          return;

        }


        // =================================================
        // OPEN WEBSITE
        // =================================================

        const directMatch =
          cleanedCommand.match(
            /^(?:open|launch|visit|go\s+to|take\s+me\s+to)\s+(.+)$/i
          );


        if (directMatch) {

          let site =
            directMatch[1]
              .trim()
              .toLowerCase()
              .replace(
                /\s+(website|site)$/i,
                ""
              );


          if (websites[site]) {

            const displayName =
              site === "x"
                ? "X"
                : site
                  .charAt(0)
                  .toUpperCase() +
                site.slice(1);


            const answer =
              `Opening ${displayName}.`;


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


        // =================================================
        // GEMINI
        // =================================================

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


        // =================================================
        // GOOGLE ACTION
        // =================================================

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
            parsedResult?.query?.trim()
          ) {

            googleSearch(
              parsedResult.query
            );

          }

        }


        // =================================================
        // YOUTUBE ACTION
        // =================================================

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
            parsedResult?.query?.trim()
          ) {

            youtubeSearch(
              parsedResult.query
            );

          }

        }


        // =================================================
        // CALCULATOR
        // =================================================

        else if (
          parsedResult?.type ===
          "calculator_open"
        ) {

          openUrl(
            "https://www.google.com/search?q=calculator"
          );

        }


        // =================================================
        // DISPLAY ANSWER
        // =================================================

        setAiText(response);

        setShowAIText(true);


        await addHistory(
          cleanedCommand,
          response,
          type
        );


        // =================================================
        // SPEAK VOICE RESPONSE
        // =================================================

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


        if (
          !speakingRef.current
        ) {

          setIsAIActive(false);

        }


        // =================================================
        // IMPORTANT:
        // START LISTENING AGAIN AFTER GEMINI
        // =================================================

        if (
          listeningRef.current &&
          !speakingRef.current &&
          recognitionRef.current
        ) {

          clearTimeout(
            restartTimeoutRef.current
          );


          restartTimeoutRef.current =
            setTimeout(() => {

              if (
                listeningRef.current &&
                !speakingRef.current &&
                recognitionRef.current
              ) {

                try {

                  recognitionRef.current.start();

                  setIsListening(true);

                  console.log(
                    "Listening again..."
                  );

                } catch (error) {

                  console.log(
                    "Recognition already active:",
                    error.message
                  );

                }

              }

            }, 500);

        }

      }

    };


  // =====================================================
  // SEND TEXT
  // =====================================================

  const handleSend =
    async e => {

      e?.preventDefault();


      if (selectedImage) {

        await analyzeImage();

        return;

      }


      if (selectedPdf) {

        await analyzePdf();

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


      await processCommand(
        command,
        "text",
        false
      );

    };


  // =====================================================
  // IMAGE SELECT
  // =====================================================

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


      setSelectedPdf(null);

      setPdfPreviewName("");

      setSelectedImage(file);

      setImagePreview(
        URL.createObjectURL(file)
      );

      setHistoryImage("");

      setHistoryFileName("");

    };


  // =====================================================
  // PDF SELECT
  // =====================================================

  const handlePdfSelect =
    e => {

      const file =
        e.target.files?.[0];


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
          "PDF must be smaller than 20 MB."
        );

        return;

      }


      removeImage();

      setSelectedPdf(file);

      setPdfPreviewName(
        file.name
      );

      setHistoryImage("");

      setHistoryFileName("");

    };


  // =====================================================
  // PASTE IMAGE
  // =====================================================

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


          if (imagePreview) {

            URL.revokeObjectURL(
              imagePreview
            );

          }


          setSelectedPdf(null);

          setPdfPreviewName("");

          setSelectedImage(file);

          setImagePreview(
            URL.createObjectURL(file)
          );

          setHistoryImage("");

          setHistoryFileName("");

          return;

        }

      }

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


    if (
      imageInputRef.current
    ) {

      imageInputRef.current.value =
        "";

    }

  };


  // =====================================================
  // REMOVE PDF
  // =====================================================

  const removePdf = () => {

    setSelectedPdf(null);

    setPdfPreviewName("");


    if (
      pdfInputRef.current
    ) {

      pdfInputRef.current.value =
        "";

    }

  };


  // =====================================================
  // ANALYZE PDF
  // =====================================================

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


      setIsPdfAnalyzing(true);

      setUserText(question);

      setAiText("");

      setShowAIText(false);

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
              withCredentials: true
            }

          );


        const rawAnswer =
          response.data?.response ||
          response.data?.answer ||
          "I could not analyze the PDF.";


        const answer =
          cleanAIResponse(
            rawAnswer
          );


        setAiText(answer);

        setShowAIText(true);


        await addHistory(
          question,
          answer,
          "file",
          "",
          selectedPdf.name
        );


        removePdf();

        setTypedText("");

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
          cleanAIResponse(
            errorMessage
          )
        );

        setShowAIText(true);

      } finally {

        setIsPdfAnalyzing(false);


        if (
          !speakingRef.current
        ) {

          setIsAIActive(false);

        }

      }

    };


  // =====================================================
  // ANALYZE IMAGE
  // =====================================================

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


        const rawAnswer =
          response.data?.response ||
          response.data?.answer ||
          "I could not analyze the image.";


        const answer =
          cleanAIResponse(
            rawAnswer
          );


        setAiText(answer);

        setShowAIText(true);


        let imageForHistory =
          "";


        try {

          imageForHistory =
            await imageFileToDataUrl(
              selectedImage
            );

        } catch (error) {

          console.error(
            "IMAGE HISTORY ERROR:",
            error
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
        "Speech recognition is not supported in this browser."
      );

      return;

    }


    const recognition =
      new SpeechRecognition();


    // IMPORTANT:
    // false allows us to get a clean final sentence
    // and then restart recognition after processing.
    recognition.continuous =
      false;


    // true allows the text to appear while you speak.
    recognition.interimResults =
      true;


    recognition.lang =
      "en-US";


    recognition.maxAlternatives =
      1;


    recognitionRef.current =
      recognition;


    // ===================================================
    // ON START
    // ===================================================

    recognition.onstart =
      () => {

        console.log(
          "Microphone started"
        );


        listeningRef.current =
          true;


        setIsListening(true);

      };


    // ===================================================
    // ON RESULT
    // ===================================================

    recognition.onresult =
      async event => {

        let finalTranscript =
          "";

        let interimTranscript =
          "";


        for (
          let i =
            event.resultIndex;

          i <
          event.results.length;

          i++
        ) {

          const result =
            event.results[i];


          if (
            result.isFinal
          ) {

            finalTranscript +=
              result[0]?.transcript ||
              "";

          } else {

            interimTranscript +=
              result[0]?.transcript ||
              "";

          }

        }


        // =================================================
        // SHOW LIVE SPEECH AS TEXT
        // =================================================

        const liveText =
          `${finalTranscript} ${interimTranscript}`
            .trim();


        if (liveText) {

          setUserText(
            liveText
          );

        }


        // =================================================
        // WAIT FOR FINAL SPEECH
        // =================================================

        if (
          !finalTranscript.trim()
        ) {

          return;

        }


        const transcript =
          finalTranscript.trim();


        console.log(
          "Recognized speech:",
          transcript
        );


        const lowerTranscript =
          transcript
            .toLowerCase()
            .trim();


        // =================================================
        // STOP COMMANDS
        // =================================================

        const stopCommands = [

          "stop listening",
          "stop microphone",
          "turn off microphone",
          "cancel microphone",
          "stop",
          "cancel",
          "goodbye",
          "bye"

        ];


        if (
          stopCommands.includes(
            lowerTranscript
          )
        ) {

          stopListening();

          return;

        }


        // =================================================
        // SEND TO GEMINI
        // =================================================

        await processCommand(
          transcript,
          "voice",
          true
        );

      };


    // ===================================================
    // ON END
    // ===================================================

    recognition.onend =
      () => {

        console.log(
          "Microphone ended"
        );


        // User clicked microphone OFF.
        if (
          !listeningRef.current
        ) {

          setIsListening(false);

          return;

        }


        setIsListening(false);


        // If Gemini is processing the command,
        // processCommand finally{} will restart it.
        if (
          processingRef.current
        ) {

          return;

        }


        // If assistant is speaking,
        // don't start microphone yet.
        if (
          speakingRef.current
        ) {

          return;

        }


        // Otherwise restart listening.
        clearTimeout(
          restartTimeoutRef.current
        );


        restartTimeoutRef.current =
          setTimeout(() => {

            if (
              listeningRef.current &&
              !processingRef.current &&
              !speakingRef.current &&
              recognitionRef.current
            ) {

              try {

                recognitionRef.current.start();

                setIsListening(true);

                console.log(
                  "Listening again..."
                );

              } catch (error) {

                console.log(
                  "Recognition restart:",
                  error.message
                );

              }

            }

          }, 400);

      };


    // ===================================================
    // ON ERROR
    // ===================================================

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
            "service-not-allowed"
        ) {

          listeningRef.current =
            false;


          setIsListening(false);


          alert(
            "Microphone permission is blocked. Please allow microphone access in Chrome."
          );


          return;

        }


        if (
          event.error ===
          "audio-capture"
        ) {

          listeningRef.current =
            false;


          setIsListening(false);


          alert(
            "No microphone was detected. Please check your microphone."
          );


          return;

        }


        // no-speech and aborted can happen
        // normally when recognition ends.
        if (
          event.error ===
            "no-speech" ||
          event.error ===
            "aborted"
        ) {

          return;

        }

      };


    // ===================================================
    // CLEANUP
    // ===================================================

    return () => {

      listeningRef.current =
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


      recognitionRef.current =
        null;

    };

  }, [getGeminiResponse]);


  // =====================================================
  // START LISTENING
  // =====================================================

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


      // Stop assistant speech first.
      if (
        speakingRef.current ||
        window.speechSynthesis.speaking
      ) {

        stopSpeaking();

      }


      clearTimeout(
        restartTimeoutRef.current
      );


      listeningRef.current =
        true;


      setIsListening(true);


      try {

        recognitionRef.current.start();

        console.log(
          "Listening for your voice..."
        );

      } catch (error) {

        console.log(
          "Recognition start:",
          error.message
        );


        // Already running is okay.
        setIsListening(true);

      }

    };


  // =====================================================
  // STOP LISTENING
  // =====================================================

  const stopListening =
    () => {

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


      console.log(
        "Microphone stopped"
      );

    };


  // =====================================================
  // MIC BUTTON
  // =====================================================

  const handleMicClick =
    () => {

      // -----------------------------------------------
      // If assistant is speaking:
      // MIC BUTTON = STOP SPEAKING
      // -----------------------------------------------

      if (
        isSpeaking ||
        speakingRef.current ||
        window.speechSynthesis.speaking
      ) {

        stopSpeaking();

        return;

      }


      // -----------------------------------------------
      // Normal microphone behavior
      // -----------------------------------------------

      if (isListening) {

        stopListening();

      } else {

        startListening();

      }

    };


  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout =
    async () => {

      stopSpeaking();

      stopListening();


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
    historyItems.filter(
      item => {

        const command =
          item?.command ||
          "";

        const answer =
          item?.answer ||
          "";

        const fileName =
          item?.fileName ||
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
            .includes(search) ||

          fileName
            .toLowerCase()
            .includes(search)

        );

      }
    );


  // =====================================================
  // OPEN HISTORY
  // =====================================================

  const openHistory =
    item => {

      stopSpeaking();


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
        item?.type === "image" &&
        item?.image
      ) {

        setHistoryImage(
          item.image
        );

      } else {

        setHistoryImage("");

      }


      if (
        item?.type === "file"
      ) {

        setHistoryFileName(
          item?.fileName ||
          "Previous PDF"
        );

      } else {

        setHistoryFileName("");

      }


      setShowHistory(
        false
      );

    };


  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate =
    date => {

      if (!date) {
        return "";
      }


      try {

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

      } catch {

        return "";

      }

    };


  // =====================================================
  // UI
  // =====================================================

  return (

    <div
      onPaste={
        handlePaste
      }
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
          w-full
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
              active:scale-95
            "
            title={
              showHistory
                ? "Close history"
                : "Open history"
            }
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
              navigate("/customize2")
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
                onClick={async () => {

                  await clearHistory();

                  setShowProfileMenu(
                    false
                  );

                }}
                disabled={
                  historyItems.length === 0
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


      {/* =================================================
          HISTORY
      ================================================= */}

      {showHistory && (

        <>

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
                min-h-0
                flex-1
                overflow-y-auto
                p-3
              "
            >

              {filteredHistory.length > 0 ? (

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


                        {item?.type ===
                          "image" &&
                          item?.image && (

                            <img
                              src={
                                item.image
                              }
                              alt="Previous"
                              className="
                                mb-3
                                h-28
                                w-full
                                rounded-xl
                                object-cover
                              "
                            />

                          )}


                        {item?.type ===
                          "file" && (

                            <div
                              className="
                                mb-3
                                flex
                                items-center
                                gap-3
                                rounded-xl
                                bg-cyan-400/3
                                p-3
                              "
                            >

                              <FiFileText
                                size={22}
                                className="text-cyan-400"
                              />

                              <span
                                className="
                                  truncate
                                  text-xs
                                  text-gray-400
                                "
                              >

                                {item.fileName ||
                                  "PDF document"}

                              </span>

                            </div>

                          )}


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
                    items-center
                    justify-center
                    text-sm
                    text-gray-500
                  "
                >

                  No history found

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
          justify-center
          overflow-hidden
        "
      >

        <section
          className="
            flex
            h-full
            w-full
            max-w-6xl
            flex-col
            items-center
            overflow-hidden
            px-3
            py-4
            sm:px-6
            sm:py-6
          "
        >

          {/* =================================================
              CHAT
          ================================================= */}

          <div
            className="
              flex
              min-h-0
              w-full
              flex-1
              justify-center
              overflow-y-auto
              px-1
              pb-5
            "
          >

            <div
              className="
                flex
                w-full
                max-w-3xl
                flex-col
                items-center
                pt-2
                sm:pt-5
              "
            >

              {/* AI IMAGE */}

              <div
                className={`
                  mb-4
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
                    h-20
                    w-20
                    rounded-full
                    object-cover
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
                  px-3
                  text-center
                  text-xl
                  font-semibold
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

                {isSpeaking

                  ? "Speaking..."

                  : isListening

                    ? "Listening..."

                    : isImageAnalyzing

                      ? "Analyzing image..."

                      : isPdfAnalyzing

                        ? "Analyzing PDF..."

                        : "How can I help you?"}

              </p>


              {/* HISTORY IMAGE */}

              {historyImage && (

                <div
                  className="
                    mt-5
                    w-full
                    max-w-2xl
                    rounded-2xl
                    border
                    border-cyan-400/10
                    p-2
                  "
                >

                  <img
                    src={historyImage}
                    alt="Previous"
                    className="
                      mx-auto
                      max-h-[45vh]
                      w-full
                      rounded-xl
                      object-contain
                    "
                  />

                </div>

              )}


              {/* HISTORY PDF */}

              {historyFileName && (

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
                    border-cyan-400/10
                    bg-cyan-400/3
                    p-4
                  "
                >

                  <FiFileText
                    size={25}
                    className="text-cyan-400"
                  />


                  <div
                    className="
                      min-w-0
                      flex-1
                    "
                  >

                    <p
                      className="
                        text-xs
                        text-gray-500
                      "
                    >
                      Previous PDF
                    </p>


                    <p
                      className="
                        truncate
                        text-sm
                        text-gray-300
                      "
                    >

                      {historyFileName}

                    </p>

                  </div>

                </div>

              )}


              {/* USER TEXT */}

              {userText && (

                <div
                  className="
                    mt-5
                    w-full
                    max-w-2xl
                    wrap-break-word
                    rounded-2xl
                    border
                    border-cyan-400/10
                    bg-cyan-400/5
                    px-4
                    py-3
                    text-sm
                    leading-relaxed
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
                      mb-5
                      w-full
                      max-w-3xl
                      wrap-break-word
                      rounded-2xl
                      border
                      border-white/10
                      bg-white/3
                      px-4
                      py-4
                      text-sm
                      leading-7
                      whitespace-pre-wrap
                      text-gray-200
                      sm:px-6
                      sm:py-5
                      sm:text-base
                    "
                  >

                    {aiText}

                  </div>

                )}

            </div>

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
                      text-sm
                      text-white
                    "
                  >
                    Image selected
                  </p>


                  <p
                    className="
                      text-xs
                      text-gray-500
                    "
                  >
                    Ask your question below.
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


          {/* =================================================
              PDF PREVIEW
          ================================================= */}

          {pdfPreviewName && (

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
                  "
                >

                  <FiFileText
                    size={25}
                    className="text-red-400"
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
                      text-xs
                      text-gray-500
                    "
                  >
                    PDF selected
                  </p>


                  <p
                    className="
                      truncate
                      text-sm
                      text-white
                    "
                  >

                    {pdfPreviewName}

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


          {/* =================================================
              INPUT AREA
          ================================================= */}

          <div
            className="
              w-full
              max-w-3xl
              shrink-0
            "
          >

            {/* STOP SPEAKING */}

            {isSpeaking && (

              <div
                className="
                  mb-2
                  flex
                  justify-center
                "
              >

                <button
                  type="button"
                  onClick={
                    stopSpeaking
                  }
                  className="
                    flex
                    items-center
                    gap-2
                    rounded-full
                    border
                    border-red-400/30
                    bg-red-400/10
                    px-4
                    py-2
                    text-xs
                    text-red-400
                    hover:bg-red-400/20
                    active:scale-95
                  "
                  title="Stop assistant speaking"
                >

                  <FiSquare
                    size={13}
                    fill="currentColor"
                  />

                  Stop Speaking

                </button>

              </div>

            )}


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

              {/* IMAGE BUTTON */}

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


              {/* PDF BUTTON */}

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


              {/* TEXT INPUT */}

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
                  imagePreview
                    ? "Ask about the image..."
                    : pdfPreviewName
                      ? "Ask about the PDF..."
                      : isListening
                        ? "Listening..."
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


              {/* =================================================
                  MIC BUTTON
              ================================================= */}

              <button
                type="button"
                onClick={
                  handleMicClick
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
                    isSpeaking
                      ? "bg-red-400/15 text-red-400 hover:bg-red-400/25"

                      : isListening
                        ? "bg-red-400/10 text-red-400 hover:bg-red-400/20"

                        : "text-gray-400 hover:bg-white/5 hover:text-cyan-300"
                  }
                `}
                title={
                  isSpeaking
                    ? "Stop assistant speaking"
                    : isListening
                      ? "Stop microphone"
                      : "Start microphone"
                }
              >

                {isSpeaking ? (

                  <FiSquare
                    size={17}
                    fill="currentColor"
                  />

                ) : isListening ? (

                  <FiMicOff
                    size={19}
                  />

                ) : (

                  <FiMic
                    size={19}
                  />

                )}

              </button>


              {/* SEND BUTTON */}

              <button
                type="submit"
                disabled={
                  selectedImage
                    ? isImageAnalyzing

                    : selectedPdf
                      ? isPdfAnalyzing

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
                title="Send"
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
                sm:text-[11px]
              "
            >
              Text • Voice • Image • PDF Analysis
            </p>

          </div>

        </section>

      </main>

    </div>

  );

}


export default Home;