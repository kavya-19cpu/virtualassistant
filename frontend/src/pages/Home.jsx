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
  FiLogOut,
  FiFileText,
  FiStopCircle
} from "react-icons/fi";


/* =========================================================
   WEBSITE MAP
========================================================= */

const websites = {
  google: "https://www.google.com",
  yahoo: "https://www.yahoo.com",
  bing: "https://www.bing.com",
  youtube: "https://www.youtube.com",
  instagram: "https://www.instagram.com",
  facebook: "https://www.facebook.com",
  wikipedia: "https://www.wikipedia.org",
  reddit: "https://www.reddit.com",
  amazon: "https://www.amazon.in",
  flipkart: "https://www.flipkart.com",
  spotify: "https://open.spotify.com",
  github: "https://github.com",
  linkedin: "https://www.linkedin.com",
  pinterest: "https://www.pinterest.com",
  twitter: "https://x.com",
  x: "https://x.com",
  quora: "https://www.quora.com",
  twitch: "https://www.twitch.tv",
  imdb: "https://www.imdb.com",
  soundcloud: "https://soundcloud.com",
  deezer: "https://www.deezer.com",
  udemy: "https://www.udemy.com",
  coursera: "https://www.coursera.org",
  canva: "https://www.canva.com",
  stackoverflow: "https://stackoverflow.com"
};


/* =========================================================
   NORMALIZE WEBSITE NAME
========================================================= */

const normalizeSite = (site) => {
  if (!site) {
    return null;
  }

  const value = site
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "");

  const aliases = {
    google: "google",

    yahoo: "yahoo",

    bing: "bing",

    youtube: "youtube",
    yt: "youtube",

    instagram: "instagram",
    insta: "instagram",

    facebook: "facebook",
    fb: "facebook",

    wikipedia: "wikipedia",
    wiki: "wikipedia",

    reddit: "reddit",

    amazon: "amazon",
    amazonindia: "amazon",

    flipkart: "flipkart",

    spotify: "spotify",

    github: "github",

    linkedin: "linkedin",

    pinterest: "pinterest",

    twitter: "twitter",
    x: "x",

    quora: "quora",

    twitch: "twitch",

    imdb: "imdb",

    soundcloud: "soundcloud",

    deezer: "deezer",

    udemy: "udemy",

    coursera: "coursera",

    canva: "canva",

    stackoverflow: "stackoverflow"
  };

  return aliases[value] || null;
};


/* =========================================================
   WEBSITE SEARCH URL
========================================================= */

const getWebsiteSearchUrl = (
  site,
  query
) => {
  const normalizedSite =
    normalizeSite(site);

  const cleanQuery =
    query?.trim();

  if (
    !normalizedSite ||
    !cleanQuery
  ) {
    return null;
  }

  const encodedQuery =
    encodeURIComponent(cleanQuery);

  switch (normalizedSite) {

    case "google":
      return `https://www.google.com/search?q=${encodedQuery}`;

    case "yahoo":
      return `https://search.yahoo.com/search?p=${encodedQuery}`;

    case "bing":
      return `https://www.bing.com/search?q=${encodedQuery}`;

    case "youtube":
      return `https://www.youtube.com/results?search_query=${encodedQuery}`;

    case "instagram":
      return `https://www.instagram.com/explore/search/keyword/?q=${encodedQuery}`;

    case "facebook":
      return `https://www.facebook.com/search/top?q=${encodedQuery}`;

    case "wikipedia":
      return `https://www.wikipedia.org/w/index.php?search=${encodedQuery}`;

    case "reddit":
      return `https://www.reddit.com/search/?q=${encodedQuery}`;

    case "amazon":
      return `https://www.amazon.in/s?k=${encodedQuery}`;

    case "flipkart":
      return `https://www.flipkart.com/search?q=${encodedQuery}`;

    case "spotify":
      return `https://open.spotify.com/search/${encodedQuery}`;

    case "github":
      return `https://github.com/search?q=${encodedQuery}`;

    case "linkedin":
      return `https://www.linkedin.com/search/results/all/?keywords=${encodedQuery}`;

    case "pinterest":
      return `https://www.pinterest.com/search/pins/?q=${encodedQuery}`;

    case "twitter":
    case "x":
      return `https://x.com/search?q=${encodedQuery}`;

    case "quora":
      return `https://www.quora.com/search?q=${encodedQuery}`;

    case "twitch":
      return `https://www.twitch.tv/search?term=${encodedQuery}`;

    case "imdb":
      return `https://www.imdb.com/find/?q=${encodedQuery}`;

    case "soundcloud":
      return `https://soundcloud.com/search?q=${encodedQuery}`;

    case "deezer":
      return `https://www.deezer.com/search/${encodedQuery}`;

    case "udemy":
      return `https://www.udemy.com/courses/search/?q=${encodedQuery}`;

    case "coursera":
      return `https://www.coursera.org/search?query=${encodedQuery}`;

    case "canva":
      return `https://www.canva.com/search?q=${encodedQuery}`;

    case "stackoverflow":
      return `https://stackoverflow.com/search?q=${encodedQuery}`;

    default:
      return null;
  }
};


/* =========================================================
   SEARCH COMMAND PARSER
========================================================= */

const extractSearchCommand = (
  command
) => {

  if (!command) {
    return null;
  }

  let text =
    command
      .trim()
      .replace(/\s+/g, " ");

  let match;


  /*
    Example:

    open yahoo and search cats
    open spotify and search for arijit singh
    visit youtube and search for songs
  */

  match =
    text.match(
      /^(?:open|launch|visit|go to|take me to)\s+(.+?)(?:\s+website|\s+site)?\s+(?:and\s+)?(?:search|find|look for|look up)\s+(?:for\s+|about\s+|regarding\s+)?(.+)$/i
    );

  if (match) {

    const site =
      normalizeSite(match[1]);

    const query =
      match[2]?.trim();

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


  /*
    Example:

    search cats on yahoo
    search cats in yahoo
    search cats at yahoo
    search cats using yahoo
  */

  match =
    text.match(
      /^(?:search|find|look for|look up)\s+(.+?)\s+(?:on|in|at|using)\s+([a-zA-Z0-9]+)$/i
    );

  if (match) {

    const site =
      normalizeSite(match[2]);

    const query =
      match[1]?.trim();

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


  /*
    Example:

    search yahoo for cats
    search youtube for arijit singh
    find spotify for savriabdul
  */

  match =
    text.match(
      /^(?:search|find|look for|look up)\s+([a-zA-Z0-9]+)\s+(?:for|about|regarding)\s+(.+)$/i
    );

  if (match) {

    const site =
      normalizeSite(match[1]);

    const query =
      match[2]?.trim();

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


  /*
    Example:

    yahoo search cats
    youtube search arijit singh
    spotify search savriabdul
  */

  match =
    text.match(
      /^([a-zA-Z0-9]+)\s+search\s+(.+)$/i
    );

  if (match) {

    const site =
      normalizeSite(match[1]);

    const query =
      match[2]?.trim();

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


  /*
    Example:

    search yahoo cats
    search youtube arijit singh
    search spotify savriabdul
  */

  match =
    text.match(
      /^(?:search|find)\s+([a-zA-Z0-9]+)\s+(.+)$/i
    );

  if (match) {

    const site =
      normalizeSite(match[1]);

    const query =
      match[2]?.trim();

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


  /*
    Example:

    search cats yahoo
    search arijit singh youtube
    search savriabdul spotify
  */

  match =
    text.match(
      /^(?:search|find|look for|look up)\s+(.+?)\s+([a-zA-Z0-9]+)$/i
    );

  if (match) {

    const site =
      normalizeSite(match[2]);

    const query =
      match[1]?.trim();

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


  return null;
};


/* =========================================================
   CURRENT SYSTEM DATE / TIME
========================================================= */

const getCurrentDateTime = () => {

  const now =
    new Date();

  return {

    date:
      now.getDate(),

    month:
      now.toLocaleString(
        "en-IN",
        {
          month: "long"
        }
      ),

    monthNumber:
      now.getMonth() + 1,

    year:
      now.getFullYear(),

    day:
      now.toLocaleString(
        "en-IN",
        {
          weekday: "long"
        }
      ),

    time:
      now.toLocaleTimeString(
        "en-IN",
        {
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit",
          hour12: true
        }
      ),

    fullDate:
      now.toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "long",
          year: "numeric"
        }
      )
  };
};


/* =========================================================
   HOME COMPONENT
========================================================= */

function Home() {

  const {
    userData,
    serverUrl,
    setUserData,
    getGeminiResponse,
    analyzePdfFile
  } =
    useContext(
      userDataContext
    );


  const navigate =
    useNavigate();


  /* =======================================================
     STATES
  ======================================================= */

  const [
    command,
    setCommand
  ] =
    useState("");


  const [
    aiText,
    setAiText
  ] =
    useState("");


  const [
    showAIText,
    setShowAIText
  ] =
    useState(false);


  const [
    listening,
    setListening
  ] =
    useState(false);


  const [
    speaking,
    setSpeaking
  ] =
    useState(false);


  const [
    showSidebar,
    setShowSidebar
  ] =
    useState(false);


  const [
    showHistory,
    setShowHistory
  ] =
    useState(false);


  const [
    history,
    setHistory
  ] =
    useState(
      userData?.history || []
    );


  const [
    selectedHistory,
    setSelectedHistory
  ] =
    useState(null);


  const [
    imageFile,
    setImageFile
  ] =
    useState(null);


  const [
    imagePreview,
    setImagePreview
  ] =
    useState("");


  const [
    pdfFile,
    setPdfFile
  ] =
    useState(null);


  const [
    processingFile,
    setProcessingFile
  ] =
    useState(false);


  const [
    processing,
    setProcessing
  ] =
    useState(false);


  const [
    currentDateTime,
    setCurrentDateTime
  ] =
    useState(
      getCurrentDateTime()
    );


  /* =======================================================
     REFS
  ======================================================= */

  const recognitionRef =
    useRef(null);


  const fileInputRef =
    useRef(null);


  const pdfInputRef =
    useRef(null);


  const speechQueueRef =
    useRef([]);


  const speechIndexRef =
    useRef(0);


  /* =======================================================
     UPDATE CLOCK
  ======================================================= */

  useEffect(() => {

    const updateClock =
      () => {

        setCurrentDateTime(
          getCurrentDateTime()
        );
      };


    updateClock();


    const interval =
      setInterval(
        updateClock,
        1000
      );


    return () =>
      clearInterval(
        interval
      );

  }, []);


  /* =======================================================
     SYNC HISTORY
  ======================================================= */

  useEffect(() => {

    if (
      Array.isArray(
        userData?.history
      )
    ) {

      setHistory(
        userData.history
      );
    }

  }, [
    userData?.history
  ]);


  /* =======================================================
     SPEECH SYNTHESIS
  ======================================================= */

  const stopSpeaking = () => {

    if (
      typeof window !==
      "undefined" &&
      window.speechSynthesis
    ) {

      window.speechSynthesis.cancel();
    }


    speechQueueRef.current =
      [];

    speechIndexRef.current =
      0;

    setSpeaking(false);
  };


  const speakChunk = (
    chunks,
    index
  ) => {

    if (
      !chunks ||
      index >= chunks.length
    ) {

      setSpeaking(false);

      return;
    }


    speechIndexRef.current =
      index;


    const utterance =
      new SpeechSynthesisUtterance(
        chunks[index]
      );


    const speed =
      Number(
        userData?.speechSpeed ||
        1
      );


    utterance.rate =
      Math.max(
        0.5,
        Math.min(
          2,
          speed
        )
      );


    utterance.pitch =
      1;


    utterance.volume =
      1;


    utterance.onstart =
      () => {

        setSpeaking(true);
      };


    utterance.onend =
      () => {

        speakChunk(
          chunks,
          index + 1
        );
      };


    utterance.onerror =
      () => {

        setSpeaking(false);
      };


    window.speechSynthesis
      .speak(
        utterance
      );
  };


  const speak = (
    text
  ) => {

    if (
      !text ||
      typeof window ===
        "undefined" ||
      !window.speechSynthesis
    ) {
      return;
    }


    stopSpeaking();


    const cleanText =
      String(text)
        .replace(
          /[*#`_]/g,
          ""
        )
        .replace(
          /\s+/g,
          " "
        )
        .trim();


    if (!cleanText) {
      return;
    }


    /*
      Split long answers so the browser does not
      stop speaking halfway through a large answer.
    */

    const chunks = [];


    let remaining =
      cleanText;


    while (
      remaining.length > 180
    ) {

      let splitIndex =
        remaining.lastIndexOf(
          ". ",
          180
        );


      if (
        splitIndex < 80
      ) {

        splitIndex =
          remaining.lastIndexOf(
            " ",
            180
          );
      }


      if (
        splitIndex <= 0
      ) {

        splitIndex = 180;
      }


      chunks.push(
        remaining.slice(
          0,
          splitIndex + 1
        )
      );


      remaining =
        remaining.slice(
          splitIndex + 1
        ).trim();
    }


    if (remaining) {

      chunks.push(
        remaining
      );
    }


    speechQueueRef.current =
      chunks;


    speechIndexRef.current =
      0;


    speakChunk(
      chunks,
      0
    );
  };


  /* =======================================================
     OPEN URL
  ======================================================= */

  const openUrl = (
    url
  ) => {

    if (!url) {
      return;
    }


    const newWindow =
      window.open(
        url,
        "_blank",
        "noopener,noreferrer"
      );


    /*
      Some browsers block popup windows.
      In that case navigate the current tab.
    */

    if (!newWindow) {

      window.location.href =
        url;
    }
  };


  /* =======================================================
     SAVE HISTORY
  ======================================================= */

  const addHistory = async (
    question,
    answer,
    type = "text"
  ) => {

    if (
      !question ||
      !answer
    ) {
      return;
    }


    try {

      const response =
        await axios.post(
          `${serverUrl}/api/user/savehistory`,
          {
            command: question,
            answer,
            type
          },
          {
            withCredentials: true
          }
        );


      const newHistory =
        response?.data?.history;


      if (
        Array.isArray(
          newHistory
        )
      ) {

        setHistory(
          newHistory
        );


        if (setUserData) {

          setUserData(
            prev => ({
              ...prev,
              history:
                newHistory
            })
          );
        }


        return;
      }


      /*
        If backend returns only the saved item,
        add it locally.
      */

      const saved =
        response?.data?.data ||
        response?.data?.historyItem ||
        response?.data;


      if (
        saved &&
        typeof saved ===
          "object"
      ) {

        setHistory(
          prev => [
            saved,
            ...prev
          ]
        );
      }

    } catch (error) {

      console.error(
        "Save history error:",
        error
      );
    }
  };


  /* =======================================================
     DELETE HISTORY
  ======================================================= */

  const deleteHistoryItem = async (
    historyId
  ) => {

    if (!historyId) {
      return;
    }


    try {

      await axios.delete(
        `${serverUrl}/api/user/history/${historyId}`,
        {
          withCredentials: true
        }
      );


      const updated =
        history.filter(
          item =>
            item._id !==
            historyId
        );


      setHistory(
        updated
      );


      if (setUserData) {

        setUserData(
          prev => ({
            ...prev,
            history:
              updated
          })
        );
      }


      if (
        selectedHistory?._id ===
        historyId
      ) {

        setSelectedHistory(
          null
        );
      }

    } catch (error) {

      console.error(
        "Delete history error:",
        error
      );
    }
  };


  /* =======================================================
     CLEAR HISTORY
  ======================================================= */

  const clearAllHistory = async () => {

    try {

      await axios.delete(
        `${serverUrl}/api/user/history`,
        {
          withCredentials: true
        }
      );


      setHistory([]);


      setSelectedHistory(
        null
      );


      if (setUserData) {

        setUserData(
          prev => ({
            ...prev,
            history: []
          })
        );
      }

    } catch (error) {

      console.error(
        "Clear history error:",
        error
      );
    }
  };


  /* =======================================================
     CURRENT DATE/TIME COMMANDS
  ======================================================= */

  const processDateTimeCommand = (
    cleanedCommand,
    type,
    shouldSpeak
  ) => {

    const lower =
      cleanedCommand
        .toLowerCase()
        .trim();


    const current =
      getCurrentDateTime();


    let answer = null;


    /* CURRENT TIME */

    if (
      /^(what is|what's|tell me|give me|show me)?\s*(the\s+)?(current\s+)?time\??$/i.test(
        cleanedCommand
      ) ||
      /what time is it/i.test(
        lower
      ) ||
      /current time/i.test(
        lower
      )
    ) {

      answer =
        `The current time is ${current.time}.`;
    }


    /* TODAY / DATE */

    else if (
      /what day is it/i.test(
        lower
      ) ||
      /what day is today/i.test(
        lower
      ) ||
      /^today\??$/i.test(
        cleanedCommand
      )
    ) {

      answer =
        `Today is ${current.day}, ${current.fullDate}.`;
    }


    else if (
      /what is the date/i.test(
        lower
      ) ||
      /what's the date/i.test(
        lower
      ) ||
      /today's date/i.test(
        lower
      ) ||
      /todays date/i.test(
        lower
      ) ||
      /current date/i.test(
        lower
      )
    ) {

      answer =
        `Today's date is ${current.fullDate}.`;
    }


    /* DAY */

    else if (
      /what day/i.test(
        lower
      ) ||
      /current day/i.test(
        lower
      )
    ) {

      answer =
        `Today is ${current.day}.`;
    }


    /* MONTH */

    else if (
      /what month is it/i.test(
        lower
      ) ||
      /current month/i.test(
        lower
      ) ||
      /^month\??$/i.test(
        cleanedCommand
      )
    ) {

      answer =
        `The current month is ${current.month}.`;
    }


    /* YEAR */

    else if (
      /what year is it/i.test(
        lower
      ) ||
      /current year/i.test(
        lower
      ) ||
      /^year\??$/i.test(
        cleanedCommand
      ) ||
      /which year is it/i.test(
        lower
      )
    ) {

      answer =
        `The current year is ${current.year}.`;
    }


    /* FULL DATE */

    else if (
      /current date and time/i.test(
        lower
      ) ||
      /date and time/i.test(
        lower
      ) ||
      /date time/i.test(
        lower
      )
    ) {

      answer =
        `Today is ${current.day}, ${current.fullDate}, and the current time is ${current.time}.`;
    }


    if (!answer) {
      return null;
    }


    setAiText(
      answer
    );


    setShowAIText(
      true
    );


    /*
      Voice -> speak.
      Typed -> DO NOT speak.
    */

    if (shouldSpeak) {

      speak(answer);
    }


    addHistory(
      cleanedCommand,
      answer,
      type
    );


    return answer;
  };


  /* =======================================================
     WEBSITE SEARCH COMMAND
  ======================================================= */

  const processWebsiteSearch = async (
    cleanedCommand,
    type,
    shouldSpeak
  ) => {

    const result =
      extractSearchCommand(
        cleanedCommand
      );


    if (!result) {
      return false;
    }


    const {
      site,
      query
    } =
      result;


    const searchUrl =
      getWebsiteSearchUrl(
        site,
        query
      );


    if (!searchUrl) {
      return false;
    }


    const displayName =
      site === "x"
        ? "X"
        : site
            .charAt(0)
            .toUpperCase() +
          site.slice(1);


    const answer =
      `Searching ${displayName} for ${query}.`;


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
      searchUrl
    );


    if (shouldSpeak) {

      speak(answer);
    }


    return true;
  };


  /* =======================================================
     DIRECT WEBSITE OPEN
  ======================================================= */

  const processOpenWebsite = (
    cleanedCommand,
    shouldSpeak,
    type
  ) => {

    const match =
      cleanedCommand.match(
        /^(?:open|launch|visit|go to|take me to)\s+(.+?)(?:\s+website|\s+site)?$/i
      );


    if (!match) {
      return false;
    }


    const site =
      normalizeSite(
        match[1]
      );


    if (!site) {
      return false;
    }


    const url =
      websites[site];


    if (!url) {
      return false;
    }


    const displayName =
      site === "x"
        ? "X"
        : site
            .charAt(0)
            .toUpperCase() +
          site.slice(1);


    const answer =
      `Opening ${displayName}.`;


    setAiText(
      answer
    );


    setShowAIText(
      true
    );


    openUrl(
      url
    );


    addHistory(
      cleanedCommand,
      answer,
      type
    );


    if (shouldSpeak) {

      speak(answer);
    }


    return true;
  };


  /* =======================================================
     GENERIC GOOGLE SEARCH
  ======================================================= */

  const processGenericGoogleSearch = (
    cleanedCommand,
    shouldSpeak,
    type
  ) => {

    const match =
      cleanedCommand.match(
        /^(?:search|google)\s+(.+)$/i
      );


    if (!match) {
      return false;
    }


    const query =
      match[1]?.trim();


    if (!query) {
      return false;
    }


    const answer =
      `Searching Google for ${query}.`;


    const url =
      `https://www.google.com/search?q=${encodeURIComponent(
        query
      )}`;


    setAiText(
      answer
    );


    setShowAIText(
      true
    );


    openUrl(
      url
    );


    addHistory(
      cleanedCommand,
      answer,
      type
    );


    if (shouldSpeak) {

      speak(answer);
    }


    return true;
  };


  /* =======================================================
     GENERIC YOUTUBE SEARCH
  ======================================================= */

  const processGenericYouTubeSearch = (
    cleanedCommand,
    shouldSpeak,
    type
  ) => {

    const match =
      cleanedCommand.match(
        /^youtube\s+(.+)$/i
      );


    if (!match) {
      return false;
    }


    const query =
      match[1]?.trim();


    if (!query) {
      return false;
    }


    const answer =
      `Searching YouTube for ${query}.`;


    const url =
      `https://www.youtube.com/results?search_query=${encodeURIComponent(
        query
      )}`;


    setAiText(
      answer
    );


    setShowAIText(
      true
    );


    openUrl(
      url
    );


    addHistory(
      cleanedCommand,
      answer,
      type
    );


    if (shouldSpeak) {

      speak(answer);
    }


    return true;
  };


  /* =======================================================
     MAIN COMMAND PROCESSOR
  ======================================================= */

  const processCommand = async (
    originalCommand,
    type = "text",
    shouldSpeak = false
  ) => {

    const cleanedCommand =
      originalCommand
        ?.trim()
        .replace(/\s+/g, " ");


    if (!cleanedCommand) {
      return;
    }


    setProcessing(
      true
    );


    try {

      /*
        ---------------------------------------------------
        1. CURRENT DATE/TIME
        ---------------------------------------------------
      */

      const dateTimeAnswer =
        processDateTimeCommand(
          cleanedCommand,
          type,
          shouldSpeak
        );


      if (dateTimeAnswer) {

        return;
      }


      /*
        ---------------------------------------------------
        2. WEBSITE SEARCH
        IMPORTANT:
        This MUST come before generic Google search.
        ---------------------------------------------------
      */

      const websiteSearch =
        await processWebsiteSearch(
          cleanedCommand,
          type,
          shouldSpeak
        );


      if (websiteSearch) {

        return;
      }


      /*
        ---------------------------------------------------
        3. OPEN WEBSITE
        ---------------------------------------------------
      */

      const openedWebsite =
        processOpenWebsite(
          cleanedCommand,
          shouldSpeak,
          type
        );


      if (openedWebsite) {

        return;
      }


      /*
        ---------------------------------------------------
        4. GENERIC GOOGLE SEARCH
        ---------------------------------------------------
      */

      const googleSearch =
        processGenericGoogleSearch(
          cleanedCommand,
          shouldSpeak,
          type
        );


      if (googleSearch) {

        return;
      }


      /*
        ---------------------------------------------------
        5. GENERIC YOUTUBE SEARCH
        ---------------------------------------------------
      */

      const youtubeSearch =
        processGenericYouTubeSearch(
          cleanedCommand,
          shouldSpeak,
          type
        );


      if (youtubeSearch) {

        return;
      }


      /*
        ---------------------------------------------------
        6. NORMAL GEMINI QUESTION
        ---------------------------------------------------
      */

      if (
        typeof getGeminiResponse !==
        "function"
      ) {

        throw new Error(
          "getGeminiResponse is not available in UserContext."
        );
      }


      const response =
        await getGeminiResponse(
          cleanedCommand
        );


      /*
        UserContext implementations sometimes
        return a string and sometimes an object.
      */

      let answer = "";


      if (
        typeof response ===
        "string"
      ) {

        answer =
          response;
      }

      else if (
        response?.answer
      ) {

        answer =
          response.answer;
      }

      else if (
        response?.response
      ) {

        answer =
          response.response;
      }

      else if (
        response?.data?.answer
      ) {

        answer =
          response.data.answer;
      }

      else {

        answer =
          JSON.stringify(
            response
          );
      }


      answer =
        String(answer || "")
          .trim();


      if (!answer) {

        answer =
          "I could not generate an answer.";
      }


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


      /*
        VERY IMPORTANT:
        Only voice commands speak.
        Typed commands stay text-only.
      */

      if (shouldSpeak) {

        speak(answer);
      }

    } catch (error) {

      console.error(
        "Command processing error:",
        error
      );


      const errorMessage =
        "Sorry, I could not process that request.";


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

      setProcessing(
        false
      );
    }
  };


  /* =======================================================
     SEND TYPED COMMAND
  ======================================================= */

  const handleSend = async (
    event
  ) => {

    if (event) {

      event.preventDefault();
    }


    const value =
      command.trim();


    if (!value) {
      return;
    }


    setCommand("");


    /*
      Typed = text
      shouldSpeak = false
    */

    await processCommand(
      value,
      "text",
      false
    );
  };


  /* =======================================================
     SPEECH RECOGNITION
  ======================================================= */

  const startListening = () => {

    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }


    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;


    if (!SpeechRecognition) {

      alert(
        "Speech recognition is not supported in this browser. Please use Google Chrome."
      );

      return;
    }


    if (
      recognitionRef.current
    ) {

      try {

        recognitionRef.current.stop();

      } catch (error) {

        console.error(
          error
        );
      }
    }


    const recognition =
      new SpeechRecognition();


    recognition.lang =
      "en-IN";


    recognition.continuous =
      false;


    recognition.interimResults =
      false;


    recognition.maxAlternatives =
      1;


    recognition.onstart =
      () => {

        setListening(true);
      };


    recognition.onresult =
      async event => {

        const transcript =
          event
            ?.results?.[0]?.[0]?.transcript
            ?.trim();


        if (!transcript) {
          return;
        }


        setCommand(
          transcript
        );


        /*
          Voice command:
          shouldSpeak = true
        */

        await processCommand(
          transcript,
          "voice",
          true
        );
      };


    recognition.onerror =
      event => {

        console.error(
          "Speech recognition error:",
          event
        );


        setListening(false);
      };


    recognition.onend =
      () => {

        setListening(false);
      };


    recognitionRef.current =
      recognition;


    try {

      recognition.start();

    } catch (error) {

      console.error(
        "Could not start recognition:",
        error
      );


      setListening(false);
    }
  };


  const stopListening = () => {

    if (
      recognitionRef.current
    ) {

      try {

        recognitionRef.current.stop();

      } catch (error) {

        console.error(
          error
        );
      }
    }


    setListening(false);
  };


  /* =======================================================
     IMAGE FILE
  ======================================================= */

  const handleImageChange = (
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


    setImageFile(
      file
    );


    const reader =
      new FileReader();


    reader.onload =
      () => {

        setImagePreview(
          reader.result
        );
      };


    reader.readAsDataURL(
      file
    );
  };


  /* =======================================================
     IMAGE ANALYSIS
  ======================================================= */

  const analyzeSelectedImage =
    async () => {

      if (!imageFile) {
        return;
      }


      setProcessingFile(
        true
      );


      try {

        const formData =
          new FormData();


        formData.append(
          "image",
          imageFile
        );


        const response =
          await axios.post(
            `${serverUrl}/api/user/analyze-image`,
            formData,
            {
              withCredentials: true,
              headers: {
                "Content-Type":
                  "multipart/form-data"
              }
            }
          );


        const answer =
          response?.data?.answer ||
          response?.data?.response ||
          response?.data?.message ||
          "I could not analyze this image.";


        setAiText(
          answer
        );


        setShowAIText(
          true
        );


        await addHistory(
          `Analyze image: ${imageFile.name}`,
          answer,
          "image"
        );


      } catch (error) {

        console.error(
          "Image analysis error:",
          error
        );


        const answer =
          "Sorry, I could not analyze the image.";


        setAiText(
          answer
        );


        setShowAIText(
          true
        );

      } finally {

        setProcessingFile(
          false
        );
      }
    };


  /* =======================================================
     PDF FILE
  ======================================================= */

  const handlePdfChange = (
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


    setPdfFile(
      file
    );
  };


  /* =======================================================
     PDF ANALYSIS
  ======================================================= */

  const analyzeSelectedPdf =
    async () => {

      if (!pdfFile) {
        return;
      }


      setProcessingFile(
        true
      );


      try {

        let answer = "";


        /*
          Use the analyzePdfFile function from
          UserContext if available.
        */

        if (
          typeof analyzePdfFile ===
          "function"
        ) {

          const response =
            await analyzePdfFile(
              pdfFile
            );


          if (
            typeof response ===
            "string"
          ) {

            answer =
              response;
          }

          else {

            answer =
              response?.answer ||
              response?.response ||
              response?.data?.answer ||
              "";
          }

        } else {

          /*
            Fallback direct API call.
          */

          const formData =
            new FormData();


          formData.append(
            "pdf",
            pdfFile
          );


          const response =
            await axios.post(
              `${serverUrl}/api/user/analyze-pdf`,
              formData,
              {
                withCredentials: true,
                headers: {
                  "Content-Type":
                    "multipart/form-data"
                }
              }
            );


          answer =
            response?.data?.answer ||
            response?.data?.response ||
            "";
        }


        if (!answer) {

          answer =
            "I could not analyze this PDF.";
        }


        setAiText(
          answer
        );


        setShowAIText(
          true
        );


        await addHistory(
          `Analyze PDF: ${pdfFile.name}`,
          answer,
          "pdf"
        );

      } catch (error) {

        console.error(
          "PDF analysis error:",
          error
        );


        const answer =
          "Sorry, I could not analyze this PDF.";


        setAiText(
          answer
        );


        setShowAIText(
          true
        );

      } finally {

        setProcessingFile(
          false
        );
      }
    };


  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout = async () => {

    try {

      await axios.get(
        `${serverUrl}/api/auth/logout`,
        {
          withCredentials: true
        }
      );

    } catch (error) {

      console.error(
        "Logout error:",
        error
      );
    }


    if (setUserData) {

      setUserData(
        null
      );
    }


    navigate(
      "/signin"
    );
  };


  /* =======================================================
     CLEANUP
  ======================================================= */

  useEffect(() => {

    return () => {

      if (
        recognitionRef.current
      ) {

        try {

          recognitionRef.current.stop();

        } catch (error) {

          console.error(
            error
          );
        }
      }


      if (
        typeof window !==
          "undefined" &&
        window.speechSynthesis
      ) {

        window.speechSynthesis.cancel();
      }

    };

  }, []);


  /* =======================================================
     USER DISPLAY DATA
  ======================================================= */

  const assistantName =
    userData?.assistantName ||
    "Assistant";


  const userName =
    userData?.name ||
    "User";


  const assistantImage =
    userData?.assistantImage ||
    aiImg;


  /* =======================================================
     RENDER
  ======================================================= */

  return (

    <div
      className="
        min-h-screen
        w-full
        bg-linear-to-br
        from-slate-950
        via-slate-900
        to-black
        text-white
        overflow-hidden
      "
    >

      {/* =================================================
          MOBILE SIDEBAR OVERLAY
      ================================================= */}

      {showSidebar && (

        <div
          className="
            fixed
            inset-0
            z-40
            bg-black/60
            backdrop-blur-sm
          "
          onClick={() =>
            setShowSidebar(false)
          }
        />
      )}


      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside
        className={`
          fixed
          left-0
          top-0
          bottom-0
          z-50
          w-80
          max-w-[85vw]
          bg-slate-950
          border-r
          border-white/10
          shadow-2xl
          transform
          transition-transform
          duration-300
          ${
            showSidebar
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >

        <div
          className="
            flex
            items-center
            justify-between
            px-5
            py-5
            border-b
            border-white/10
          "
        >

          <div>

            <h2
              className="
                text-lg
                font-bold
              "
            >
              {assistantName}
            </h2>

            <p
              className="
                text-xs
                text-gray-400
              "
            >
              Virtual Assistant
            </p>

          </div>


          <button
            onClick={() =>
              setShowSidebar(false)
            }
            className="
              rounded-full
              p-2
              hover:bg-white/10
            "
          >
            <IoMdClose
              size={22}
            />
          </button>

        </div>


        <div
          className="
            p-4
            space-y-2
          "
        >

          <button
            onClick={() => {
              setShowHistory(true);
              setShowSidebar(false);
            }}
            className="
              w-full
              flex
              items-center
              gap-3
              rounded-xl
              px-4
              py-3
              text-left
              hover:bg-white/10
              transition
            "
          >

            <FiClock />

            <span>
              History
            </span>

          </button>


          <button
            onClick={() => {
              stopSpeaking();
            }}
            className="
              w-full
              flex
              items-center
              gap-3
              rounded-xl
              px-4
              py-3
              text-left
              hover:bg-white/10
              transition
            "
          >

            <FiStopCircle />

            <span>
              Stop Voice
            </span>

          </button>


          <button
            onClick={handleLogout}
            className="
              w-full
              flex
              items-center
              gap-3
              rounded-xl
              px-4
              py-3
              text-left
              text-red-400
              hover:bg-red-500/10
              transition
            "
          >

            <FiLogOut />

            <span>
              Logout
            </span>

          </button>

        </div>

      </aside>


      {/* =================================================
          TOP BAR
      ================================================= */}

      <header
        className="
          relative
          z-30
          flex
          items-center
          justify-between
          px-4
          sm:px-6
          py-4
          border-b
          border-white/10
          bg-black/20
          backdrop-blur-xl
        "
      >

        <button
          onClick={() =>
            setShowSidebar(true)
          }
          className="
            rounded-xl
            p-2.5
            hover:bg-white/10
            transition
          "
        >

          <IoMdMenu
            size={25}
          />

        </button>


        <div
          className="
            flex
            flex-col
            items-center
          "
        >

          <h1
            className="
              text-lg
              sm:text-xl
              font-bold
            "
          >
            {assistantName}
          </h1>

          <p
            className="
              text-[11px]
              text-gray-400
            "
          >
            Welcome, {userName}
          </p>

        </div>


        <button
          onClick={() =>
            setShowHistory(true)
          }
          className="
            rounded-xl
            p-2.5
            hover:bg-white/10
            transition
          "
        >

          <FiClock
            size={22}
          />

        </button>

      </header>


      {/* =================================================
          MAIN
      ================================================= */}

      <main
        className="
          relative
          z-10
          flex
          min-h-[calc(100vh-73px)]
          flex-col
          items-center
          px-4
          py-8
          sm:py-10
        "
      >

        {/* ASSISTANT IMAGE */}

        <div
          className="
            relative
            mb-5
          "
        >

          <div
            className="
              absolute
              inset-0
              rounded-full
              bg-cyan-500/20
              blur-3xl
            "
          />

          <img
            src={assistantImage}
            alt="AI Assistant"
            className="
              relative
              h-32
              w-32
              sm:h-40
              sm:w-40
              rounded-full
              object-cover
              border
              border-white/20
              shadow-2xl
            "
          />

        </div>


        <h2
          className="
            text-2xl
            sm:text-3xl
            font-bold
            text-center
          "
        >
          How can I help you?
        </h2>


        <p
          className="
            mt-2
            text-sm
            text-gray-400
            text-center
          "
        >
          Ask me anything by typing or speaking.
        </p>


        {/* =================================================
            CURRENT DATE/TIME CARD
        ================================================= */}

        <div
          className="
            mt-5
            rounded-2xl
            border
            border-white/10
            bg-white/5
            px-5
            py-3
            text-center
            backdrop-blur-xl
          "
        >

          <div
            className="
              flex
              flex-wrap
              justify-center
              gap-x-3
              gap-y-1
              text-sm
            "
          >

            <span>
              {currentDateTime.day}
            </span>

            <span
              className="
                text-gray-500
              "
            >
              •
            </span>

            <span>
              {currentDateTime.fullDate}
            </span>

            <span
              className="
                text-gray-500
              "
            >
              •
            </span>

            <span>
              {currentDateTime.time}
            </span>

          </div>

        </div>


        {/* =================================================
            AI ANSWER
        ================================================= */}

        {showAIText && (

          <div
            className="
              mt-8
              w-full
              max-w-3xl
              rounded-2xl
              border
              border-white/10
              bg-white/5
              p-5
              shadow-xl
              backdrop-blur-xl
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
                src={assistantImage}
                alt="Assistant"
                className="
                  h-9
                  w-9
                  rounded-full
                  object-cover
                  shrink-0
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
                    mb-2
                    text-xs
                    text-cyan-400
                    font-semibold
                  "
                >
                  {assistantName}
                </p>

                <p
                  className="
                    whitespace-pre-wrap
wrap-break-word                    text-sm
                    sm:text-base
                    leading-7
                    text-gray-100
                  "
                >
                  {aiText}
                </p>

              </div>

            </div>

          </div>

        )}


        {/* =================================================
            IMAGE PREVIEW
        ================================================= */}

        {imagePreview && (

          <div
            className="
              mt-5
              w-full
              max-w-xl
              rounded-2xl
              border
              border-white/10
              bg-white/5
              p-4
            "
          >

            <div
              className="
                flex
                items-center
                justify-between
                mb-3
              "
            >

              <span
                className="
                  text-sm
                  text-gray-300
                "
              >
                Selected Image
              </span>

              <button
                onClick={() => {
                  setImageFile(null);
                  setImagePreview("");
                }}
                className="
                  rounded-lg
                  p-2
                  hover:bg-white/10
                "
              >
                <FiX />
              </button>

            </div>


            <img
              src={imagePreview}
              alt="Selected"
              className="
                max-h-72
                w-full
                rounded-xl
                object-contain
                bg-black/30
              "
            />


            <button
              onClick={analyzeSelectedImage}
              disabled={processingFile}
              className="
                mt-4
                w-full
                rounded-xl
                bg-cyan-500
                px-4
                py-3
                font-semibold
                text-black
                hover:bg-cyan-400
                disabled:opacity-50
              "
            >

              {processingFile
                ? "Analyzing image..."
                : "Analyze Image"}

            </button>

          </div>

        )}


        {/* =================================================
            PDF PREVIEW
        ================================================= */}

        {pdfFile && (

          <div
            className="
              mt-5
              w-full
              max-w-xl
              rounded-2xl
              border
              border-white/10
              bg-white/5
              p-4
            "
          >

            <div
              className="
                flex
                items-center
                justify-between
                gap-3
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-3
                  min-w-0
                "
              >

                <FiFileText
                  size={28}
                  className="
                    shrink-0
                    text-red-400
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
                      font-medium
                    "
                  >
                    {pdfFile.name}
                  </p>

                  <p
                    className="
                      text-xs
                      text-gray-400
                    "
                  >
                    PDF document
                  </p>

                </div>

              </div>


              <button
                onClick={() =>
                  setPdfFile(null)
                }
                className="
                  rounded-lg
                  p-2
                  hover:bg-white/10
                "
              >

                <FiX />

              </button>

            </div>


            <button
              onClick={analyzeSelectedPdf}
              disabled={processingFile}
              className="
                mt-4
                w-full
                rounded-xl
                bg-cyan-500
                px-4
                py-3
                font-semibold
                text-black
                hover:bg-cyan-400
                disabled:opacity-50
              "
            >

              {processingFile
                ? "Analyzing PDF..."
                : "Analyze PDF"}

            </button>

          </div>

        )}


        {/* =================================================
            INPUT
        ================================================= */}

        <form
          onSubmit={handleSend}
          className="
            mt-8
            w-full
            max-w-3xl
          "
        >

          <div
            className="
              flex
              items-center
              gap-2
              rounded-2xl
              border
              border-white/10
              bg-white/5
              p-2
              shadow-2xl
              backdrop-blur-xl
            "
          >

            {/* IMAGE */}

            <button
              type="button"
              onClick={() =>
                fileInputRef.current?.click()
              }
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-xl
                hover:bg-white/10
                transition
              "
              title="Upload image"
            >

              <FiImage
                size={20}
              />

            </button>


            {/* PDF */}

            <button
              type="button"
              onClick={() =>
                pdfInputRef.current?.click()
              }
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-xl
                hover:bg-white/10
                transition
              "
              title="Upload PDF"
            >

              <FiFileText
                size={20}
              />

            </button>


            {/* TEXT */}

            <input
              type="text"
              value={command}
              onChange={event =>
                setCommand(
                  event.target.value
                )
              }
              placeholder={
                listening
                  ? "Listening..."
                  : "Type your question..."
              }
              className="
                min-w-0
                flex-1
                bg-transparent
                px-2
                py-3
                text-sm
                sm:text-base
                text-white
                outline-none
                placeholder:text-gray-500
              "
            />


            {/* MIC */}

            <button
              type="button"
              onClick={
                listening
                  ? stopListening
                  : startListening
              }
              className={`
                flex
                h-11
                w-11
shrink-0                items-center
                justify-center
                rounded-xl
                transition
                ${
                  listening
                    ? "bg-red-500 text-white"
                    : "hover:bg-white/10"
                }
              `}
              title={
                listening
                  ? "Stop listening"
                  : "Speak"
              }
            >

              {listening ? (

                <FiMicOff
                  size={20}
                />

              ) : (

                <FiMic
                  size={20}
                />

              )}

            </button>


            {/* SEND */}

            <button
              type="submit"
              disabled={
                !command.trim() ||
                processing
              }
              className="
                flex
                h-11
                w-11
                shrink
                items-center
                justify-center
                rounded-xl
                bg-cyan-500
                text-black
                transition
                hover:bg-cyan-400
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
              title="Send"
            >

              <FiSend
                size={19}
              />

            </button>

          </div>

        </form>


        {/* =================================================
            SPEAKING STATUS
        ================================================= */}

        {speaking && (

          <div
            className="
              mt-4
              flex
              items-center
              gap-3
              rounded-full
              border
              border-white/10
              bg-white/5
              px-4
              py-2
              text-sm
              text-gray-300
            "
          >

            <span>
              Speaking...
            </span>

            <button
              onClick={stopSpeaking}
              className="
                text-red-400
                hover:text-red-300
              "
            >

              <FiStopCircle />

            </button>

          </div>

        )}


        {/* =================================================
            HIDDEN FILE INPUTS
        ================================================= */}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />


        <input
          ref={pdfInputRef}
          type="file"
          accept="application/pdf,.pdf"
          onChange={handlePdfChange}
          className="hidden"
        />


        {/* =================================================
            EXAMPLES
        ================================================= */}

        <div
          className="
            mt-8
            flex
            max-w-3xl
            flex-wrap
            justify-center
            gap-2
          "
        >

          {[
            "What is the current time?",
            "What is today's date?",
            "What day is it?",
            "What month is it?",
            "What year is it?",
            "search cats on yahoo",
            "search cats on youtube",
            "search arijit singh on spotify"
          ].map(
            example => (

              <button
                key={example}
                type="button"
                onClick={() =>
                  setCommand(
                    example
                  )
                }
                className="
                  rounded-full
                  border
                  border-white/10
                  bg-white/5
                  px-3
                  py-2
                  text-xs
                  text-gray-300
                  hover:bg-white/10
                  transition
                "
              >

                {example}

              </button>

            )
          )}

        </div>

      </main>


      {/* =================================================
          HISTORY MODAL
      ================================================= */}

      {showHistory && (

        <div
          className="
            fixed
            inset-0
            z-60
            flex
            items-center
            justify-center
            bg-black/70
            p-4
            backdrop-blur-sm
          "
          onClick={() =>
            setShowHistory(false)
          }
        >

          <div
            className="
              flex
              max-h-[90vh]
              w-full
              max-w-4xl
              flex-col
              overflow-hidden
              rounded-3xl
              border
              border-white/10
              bg-slate-950
              shadow-2xl
            "
            onClick={event =>
              event.stopPropagation()
            }
          >

            {/* HISTORY HEADER */}

            <div
              className="
                flex
                items-center
                justify-between
                gap-3
                border-b
                border-white/10
                px-5
                py-4
              "
            >

              <div>

                <h2
                  className="
                    text-lg
                    font-bold
                  "
                >
                  Conversation History
                </h2>

                <p
                  className="
                    text-xs
                    text-gray-400
                  "
                >
                  Your questions and assistant answers
                </p>

              </div>


              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >

                {history.length > 0 && (

                  <button
                    onClick={clearAllHistory}
                    className="
                      flex
                      items-center
                      gap-2
                      rounded-xl
                      bg-red-500/10
                      px-3
                      py-2
                      text-xs
                      text-red-400
                      hover:bg-red-500/20
                    "
                  >

                    <FiTrash2 />

                    Clear

                  </button>

                )}


                <button
                  onClick={() =>
                    setShowHistory(false)
                  }
                  className="
                    rounded-xl
                    p-2
                    hover:bg-white/10
                  "
                >

                  <FiX
                    size={21}
                  />

                </button>

              </div>

            </div>


            {/* HISTORY CONTENT */}

            <div
              className="
                flex
                min-h-0
                flex-1
                flex-col
                overflow-hidden
                md:flex-row
              "
            >

              {/* HISTORY LIST */}

              <div
                className="
                  w-full
                  overflow-y-auto
                  border-b
                  border-white/10
                  md:w-2/5
                  md:border-b-0
                  md:border-r
                "
              >

                {history.length === 0 ? (

                  <div
                    className="
                      flex
                      h-64
                      items-center
                      justify-center
                      px-6
                      text-center
                      text-sm
                      text-gray-500
                    "
                  >

                    No conversation history yet.

                  </div>

                ) : (

                  <div
                    className="
                      divide-y
                      divide-white/5
                    "
                  >

                    {history.map(
                      item => (

                        <button
                          key={
                            item._id ||
                            item.id ||
                            `${item.command}-${item.createdAt}`
                          }
                          onClick={() =>
                            setSelectedHistory(
                              item
                            )
                          }
                          className={`
                            w-full
                            p-4
                            text-left
                            transition
                            hover:bg-white/5
                            ${
                              selectedHistory?._id ===
                                item._id
                                ? "bg-white/10"
                                : ""
                            }
                          `}
                        >

                          <div
                            className="
                              flex
                              items-start
                              justify-between
                              gap-3
                            "
                          >

                            <div
                              className="
                                min-w-0
                                flex-1
                              "
                            >

                              <p
                                className="
                                  line-clamp-2
                                  text-sm
                                  font-medium
                                  text-gray-100
                                "
                              >
                                {item.command}
                              </p>


                              <p
                                className="
                                  mt-1
                                  text-[11px]
                                  uppercase
                                  text-gray-500
                                "
                              >
                                {item.type ||
                                  "text"}
                              </p>

                            </div>


                            <button
                              type="button"
                              onClick={event => {
                                event.stopPropagation();

                                deleteHistoryItem(
                                  item._id ||
                                    item.id
                                );
                              }}
                              className="
                                shrink-0
                                rounded-lg
                                p-2
                                text-gray-500
                                hover:bg-red-500/10
                                hover:text-red-400
                              "
                            >

                              <FiTrash2
                                size={15}
                              />

                            </button>

                          </div>

                        </button>

                      )
                    )}

                  </div>

                )}

              </div>


              {/* SELECTED HISTORY */}

              <div
                className="
                  min-h-0
                  flex-1
                  overflow-y-auto
                  p-5
                "
              >

                {!selectedHistory ? (

                  <div
                    className="
                      flex
                      h-full
                      min-h-64
                      items-center
                      justify-center
                      text-center
                      text-sm
                      text-gray-500
                    "
                  >

                    Select a conversation to view
                    the complete question and answer.

                  </div>

                ) : (

                  <div
                    className="
                      space-y-6
                    "
                  >

                    {/* QUESTION */}

                    <div>

                      <p
                        className="
                          mb-2
                          text-xs
                          font-semibold
                          uppercase
                          tracking-wider
                          text-cyan-400
                        "
                      >
                        You
                      </p>


                      <div
                        className="
                          rounded-2xl
                          border
                          border-white/10
                          bg-white/5
                          p-4
                        "
                      >

                        <p
                          className="
                            whitespace-pre-wrap
wrap-break-word                             text-sm
                            leading-7
                            text-gray-100
                          "
                        >
                          {selectedHistory.command}
                        </p>

                      </div>

                    </div>


                    {/* ANSWER */}

                    <div>

                      <p
                        className="
                          mb-2
                          text-xs
                          font-semibold
                          uppercase
                          tracking-wider
                          text-cyan-400
                        "
                      >
                        {assistantName}
                      </p>


                      <div
                        className="
                          rounded-2xl
                          border
                          border-white/10
                          bg-white/5
                          p-4
                        "
                      >

                        <p
                          className="
                            whitespace-pre-wrap
wrap-break-word                             text-sm
                            leading-7
                            text-gray-100
                          "
                        >
                          {selectedHistory.answer}
                        </p>

                      </div>

                    </div>


                    {/* DATE */}

                    {selectedHistory.createdAt && (

                      <p
                        className="
                          text-xs
                          text-gray-500
                        "
                      >

                        {new Date(
                          selectedHistory.createdAt
                        ).toLocaleString(
                          "en-IN"
                        )}

                      </p>

                    )}

                  </div>

                )}

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}


export default Home;