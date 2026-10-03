
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { userDataContext } from "../context/UserContext";

const Home = () => {
  const {
    userData,
    serverUrl,
    getGeminiResponse,
    saveHistory
  } = useContext(userDataContext);

  const navigate = useNavigate();

  const [typedText, setTypedText] = useState("");
  const [userText, setUserText] = useState("");
  const [aiText, setAiText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [historyItems, setHistoryItems] = useState([]);

  const recognitionRef = useRef(null);
  const listeningRef = useRef(false);
  const speakingRef = useRef(false);
  const processingRef = useRef(false);
  const restartTimeoutRef = useRef(null);
  const mountedRef = useRef(true);

  const assistantName = userData?.assistantName || "Mark";

  const cancelRestart = useCallback(() => {
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
  }, []);

  const startRecognition = useCallback(() => {
    const recognition = recognitionRef.current;

    if (
      !recognition ||
      !listeningRef.current ||
      speakingRef.current ||
      processingRef.current
    ) {
      return;
    }

    cancelRestart();

    try {
      recognition.start();
    } catch (error) {
      // Recognition may already be starting or running.
    }
  }, [cancelRestart]);

  const scheduleRecognitionRestart = useCallback(() => {
    cancelRestart();

    restartTimeoutRef.current = setTimeout(() => {
      startRecognition();
    }, 300);
  }, [cancelRestart, startRecognition]);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    speakingRef.current = false;

    if (mountedRef.current) {
      setIsSpeaking(false);

      if (!processingRef.current) {
        setIsSending(false);
      }
    }

    if (listeningRef.current && !processingRef.current) {
      scheduleRecognitionRestart();
    }
  }, [scheduleRecognitionRestart]);

  const speak = useCallback(
    (text) => {
      if (!text || !("speechSynthesis" in window)) {
        return;
      }

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(String(text));
      utterance.rate = 1.05;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => {
        speakingRef.current = true;

        if (mountedRef.current) {
          setIsSpeaking(true);
        }
      };

      utterance.onend = () => {
        speakingRef.current = false;

        if (mountedRef.current) {
          setIsSpeaking(false);
        }

        if (listeningRef.current && !processingRef.current) {
          scheduleRecognitionRestart();
        }
      };

      utterance.onerror = () => {
        speakingRef.current = false;

        if (mountedRef.current) {
          setIsSpeaking(false);
        }

        if (listeningRef.current && !processingRef.current) {
          scheduleRecognitionRestart();
        }
      };

      window.speechSynthesis.speak(utterance);
    },
    [scheduleRecognitionRestart]
  );

  const loadHistory = useCallback(async () => {
    try {
      const response = await axios.get(
        `${serverUrl}/api/user/current`,
        { withCredentials: true }
      );

      const history = response.data?.history;

      if (mountedRef.current) {
        setHistoryItems(Array.isArray(history) ? history : []);
      }
    } catch (error) {
      console.error(
        "LOAD HISTORY ERROR:",
        error.response?.data || error.message
      );
    }
  }, [serverUrl]);

  useEffect(() => {
    mountedRef.current = true;
    loadHistory();

    return () => {
      mountedRef.current = false;
      listeningRef.current = false;
      cancelRestart();

      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;

        try {
          recognitionRef.current.stop();
        } catch (error) {
          // Recognition may already be stopped.
        }
      }

      window.speechSynthesis.cancel();
    };
  }, [cancelRestart, loadHistory]);

  const stopListening = useCallback(() => {
    listeningRef.current = false;
    cancelRestart();

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        // Recognition may already be stopped.
      }
    }

    window.speechSynthesis.cancel();
    speakingRef.current = false;

    if (mountedRef.current) {
      setIsListening(false);
      setIsSpeaking(false);
    }
  }, [cancelRestart]);

  const startListening = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Speech recognition is not supported in this browser. Try Chrome."
      );
      return;
    }

    if (!recognitionRef.current) {
      const recognition = new SpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = "en-IN";

      recognition.onstart = () => {
        if (mountedRef.current) {
          setIsListening(true);
        }
      };

      recognition.onresult = async (event) => {
        const resultIndex = event.resultIndex;
        const transcript = event.results[resultIndex][0].transcript.trim();

        if (!transcript) return;

        console.log("HEARD:", transcript);

        const lowerTranscript = transcript.toLowerCase().trim();

        if (
          /^(stop listening|close chat|close assistant|turn off microphone|stop microphone|goodbye|bye)$/.test(
            lowerTranscript
          )
        ) {
          stopListening();
          return;
        }

        if (processingRef.current) return;

        // Support commands such as "Hi Mark, what is the time?"
        // Also accept ordinary spoken questions without the wake phrase.
        const command = transcript
          .replace(/^\s*(hi|hey|hello)?\s*mark[\s,.:!-]*/i, "")
          .trim();

        if (!command) {
          speak(`Yes, I am listening.`);
          return;
        }

        try {
          recognitionRef.current?.stop();
        } catch (error) {
          // Recognition may already be stopped.
        }

        await processCommand(command, true);
      };

      recognition.onerror = (event) => {
        console.error("SPEECH RECOGNITION ERROR:", event.error);

        if (
          event.error === "not-allowed" ||
          event.error === "service-not-allowed"
        ) {
          listeningRef.current = false;

          if (mountedRef.current) {
            setIsListening(false);
          }
        }
      };

      recognition.onend = () => {
        if (
          listeningRef.current &&
          !speakingRef.current &&
          !processingRef.current
        ) {
          scheduleRecognitionRestart();
        }
      };

      recognitionRef.current = recognition;
    }

    window.speechSynthesis.cancel();
    listeningRef.current = true;

    if (mountedRef.current) {
      setIsListening(true);
    }

    startRecognition();
  }, [scheduleRecognitionRestart, speak, startRecognition, stopListening]);

  const processCommand = useCallback(
    async (command, shouldSpeak = false) => {
      if (!command?.trim() || processingRef.current) return;

      const cleanCommand = command.trim();

      processingRef.current = true;

      if (mountedRef.current) {
        setUserText(cleanCommand);
        setAiText("");
        setIsSending(true);
      }

      try {
        const lowerCommand = cleanCommand.toLowerCase();

        if (
          /^(stop speaking|stop voice|be quiet|mute yourself)$/.test(
            lowerCommand
          )
        ) {
          stopSpeaking();

          if (mountedRef.current) {
            setAiText("Voice stopped.");
          }

          return;
        }

        const siteCommands = [
          {
            pattern: /^(open )?(google|search google)$/,
            url: "https://www.google.com"
          },
          {
            pattern: /^(open )?(youtube|you tube)$/,
            url: "https://www.youtube.com"
          },
          {
            pattern: /^(open )?(facebook|fb)$/,
            url: "https://www.facebook.com"
          },
          {
            pattern: /^(open )?(instagram|insta)$/,
            url: "https://www.instagram.com"
          },
          {
            pattern: /^(open )?(github|git hub)$/,
            url: "https://github.com"
          },
          {
            pattern: /^(open )?(linkedin|linked in)$/,
            url: "https://www.linkedin.com"
          }
        ];

        const matchedSite = siteCommands.find((site) =>
          site.pattern.test(lowerCommand)
        );

        if (matchedSite) {
          window.open(matchedSite.url, "_blank", "noopener,noreferrer");

          const answer = `Opening ${cleanCommand.replace(/^open\s+/i, "")}.`;

          if (mountedRef.current) {
            setAiText(answer);
          }

          await saveHistory(cleanCommand, answer);

          if (shouldSpeak) speak(answer);
          return;
        }

        const googleSearch = cleanCommand.match(
          /^(?:search google for|google|search for)\s+(.+)$/i
        );

        if (googleSearch) {
          const query = googleSearch[1].trim();

          window.open(
            `https://www.google.com/search?q=${encodeURIComponent(query)}`,
            "_blank",
            "noopener,noreferrer"
          );

          const answer = `Searching Google for ${query}.`;

          if (mountedRef.current) {
            setAiText(answer);
          }

          await saveHistory(cleanCommand, answer);

          if (shouldSpeak) speak(answer);
          return;
        }

        if (/^(customize|change assistant|customize assistant)$/i.test(cleanCommand)) {
          navigate("/customize");
          const answer = "Opening assistant customization.";

          if (mountedRef.current) {
            setAiText(answer);
          }

          await saveHistory(cleanCommand, answer);

          if (shouldSpeak) speak(answer);
          return;
        }

        const result = await getGeminiResponse(cleanCommand);

        let answer = "";

        if (typeof result === "string") {
          answer = result;
        } else if (result && typeof result === "object") {
          answer =
            result.response ||
            result.answer ||
            result.message ||
            "Sorry, I could not understand the response.";
        }

        if (!answer.trim()) {
          answer = "Sorry, I could not get an answer.";
        }

        if (mountedRef.current) {
          setAiText(answer);
        }

        await saveHistory(cleanCommand, answer);
        await loadHistory();

        if (shouldSpeak) {
          speak(answer);
        }
      } catch (error) {
        console.error("PROCESS COMMAND ERROR:", error);

        const errorMessage =
          "Sorry, something went wrong. Please try again.";

        if (mountedRef.current) {
          setAiText(errorMessage);
        }

        if (shouldSpeak) {
          speak(errorMessage);
        }
      } finally {
        processingRef.current = false;

        if (mountedRef.current) {
          setIsSending(false);
        }

        if (listeningRef.current && !speakingRef.current) {
          scheduleRecognitionRestart();
        }
      }
    },
    [
      getGeminiResponse,
      loadHistory,
      navigate,
      saveHistory,
      scheduleRecognitionRestart,
      speak,
      stopSpeaking
    ]
  );

  const handleSendText = async (event) => {
    event.preventDefault();

    const command = typedText.trim();

    if (!command || processingRef.current) return;

    setTypedText("");
    await processCommand(command, false);
  };

  const handleLogout = async () => {
    stopListening();
    stopSpeaking();

    try {
      await axios.get(`${serverUrl}/api/user/logout`, {
        withCredentials: true
      });
    } catch (error) {
      console.error(
        "LOGOUT ERROR:",
        error.response?.data || error.message
      );
    } finally {
      navigate("/login");
    }
  };

  const clearDisplayedAnswer = () => {
    setUserText("");
    setAiText("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-indigo-950 text-white">
      <header className="flex items-center justify-between gap-3 p-4 sm:p-6">
        <button
          type="button"
          onClick={() => setShowMenu((value) => !value)}
          className="rounded-lg border border-white/20 px-4 py-2 hover:bg-white/10"
        >
          ☰ Menu
        </button>

        <h1 className="text-lg font-semibold sm:text-2xl">
          {assistantName}
        </h1>

        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg bg-red-600 px-4 py-2 hover:bg-red-700"
        >
          Logout
        </button>
      </header>

      {showMenu && (
        <div className="mx-4 rounded-xl border border-white/10 bg-slate-900 p-3 sm:mx-6">
          <button
            type="button"
            onClick={() => {
              setShowHistory((value) => !value);
              setShowMenu(false);
              loadHistory();
            }}
            className="block w-full rounded-lg px-4 py-3 text-left hover:bg-white/10"
          >
            Conversation History
          </button>

          <button
            type="button"
            onClick={() => navigate("/customize")}
            className="block w-full rounded-lg px-4 py-3 text-left hover:bg-white/10"
          >
            Customize Assistant
          </button>

          <button
            type="button"
            onClick={() => {
              clearDisplayedAnswer();
              setShowMenu(false);
            }}
            className="block w-full rounded-lg px-4 py-3 text-left hover:bg-white/10"
          >
            Clear Current Answer
          </button>
        </div>
      )}

      <main className="mx-auto flex w-full max-w-4xl flex-col items-center px-4 py-8 sm:py-12">
        <div className="mb-6 flex h-36 w-36 items-center justify-center rounded-full border border-indigo-300/30 bg-indigo-500/20 text-6xl shadow-2xl sm:h-44 sm:w-44">
          {userData?.assistantImage ? (
            <img
              src={userData.assistantImage}
              alt={assistantName}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            "🤖"
          )}
        </div>

        <h2 className="text-center text-2xl font-bold sm:text-3xl">
          Hello{userData?.name ? `, ${userData.name}` : ""}!
        </h2>

        <p className="mt-2 text-center text-sm text-gray-300 sm:text-base">
          Ask by voice or type your question.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {!isListening ? (
            <button
              type="button"
              onClick={startListening}
              className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold hover:bg-indigo-700"
            >
              🎙️ Start Listening
            </button>
          ) : (
            <button
              type="button"
              onClick={stopListening}
              className="rounded-xl bg-orange-600 px-5 py-3 font-semibold hover:bg-orange-700"
            >
              ⏹ Stop Listening
            </button>
          )}

          <button
            type="button"
            onClick={stopSpeaking}
            disabled={!isSpeaking}
            className="rounded-xl bg-red-600 px-5 py-3 font-semibold hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            🔇 Stop Voice
          </button>
        </div>

        <p className="mt-3 text-sm text-gray-300" aria-live="polite">
          {isListening
            ? "Microphone is active. Speak your question."
            : "Microphone is off."}
          {isSending ? " Processing your question…" : ""}
          {isSpeaking ? " Speaking…" : ""}
        </p>

        <form
          onSubmit={handleSendText}
          className="mt-8 flex w-full flex-col gap-3 sm:flex-row"
        >
          <input
            type="text"
            value={typedText}
            onChange={(event) => setTypedText(event.target.value)}
            placeholder="Type your question here..."
            className="min-w-0 flex-1 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-gray-400 focus:border-indigo-400"
          />

          <button
            type="submit"
            disabled={!typedText.trim() || isSending}
            className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSending ? "Please wait..." : "Send"}
          </button>
        </form>

        {(userText || aiText) && (
          <section className="mt-8 w-full rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6">
            {userText && (
              <div className="mb-5">
                <h3 className="mb-2 font-semibold text-indigo-300">
                  Your question
                </h3>
                <p className="whitespace-pre-wrap break-words text-gray-100">
                  {userText}
                </p>
              </div>
            )}

            {aiText && (
              <div>
                <h3 className="mb-2 font-semibold text-green-300">
                  {assistantName}'s answer
                </h3>
                <p className="whitespace-pre-wrap break-words leading-7 text-gray-100">
                  {aiText}
                </p>
              </div>
            )}
          </section>
        )}

        {showHistory && (
          <section className="mt-8 w-full rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-lg font-bold">Conversation History</h3>

              <button
                type="button"
                onClick={() => setShowHistory(false)}
                className="rounded-lg px-3 py-2 hover:bg-white/10"
              >
                Close
              </button>
            </div>

            {historyItems.length === 0 ? (
              <p className="text-gray-400">No saved conversations yet.</p>
            ) : (
              <div className="space-y-4">
                {historyItems.map((item, index) => (
                  <article
                    key={item._id || `${item.command}-${index}`}
                    className="rounded-xl border border-white/10 bg-black/20 p-4"
                  >
                    <p className="mb-2 text-sm text-indigo-300">
                      Question
                    </p>
                    <p className="whitespace-pre-wrap break-words">
                      {item.command}
                    </p>

                    <p className="mb-2 mt-4 text-sm text-green-300">
                      Answer
                    </p>
                    <p className="whitespace-pre-wrap break-words text-gray-200">
                      {item.answer}
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        setUserText(item.command || "");
                        setAiText(item.answer || "");
                        setShowHistory(false);
                      }}
                      className="mt-4 rounded-lg border border-white/20 px-3 py-2 text-sm hover:bg-white/10"
                    >
                      View Conversation
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
};

export default Home;
