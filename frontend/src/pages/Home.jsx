import React,{useContext,useEffect,useRef,useState} from "react";
import {userDataContext} from "../context/UserContext";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import user from "../assets/user.gif";
import ai from "../assets/ai.gif";
import {IoMdMenu,IoMdClose} from "react-icons/io";

const Home=()=>{
    const {
        serverUrl,
        userData,
        setUserData,
        getGeminiResponse
    }=useContext(userDataContext);

    const navigate=useNavigate();

    const [isListening,setIsListening]=useState(false);
    const [isAIActive,setIsAIActive]=useState(false);
    const [isSpeaking,setIsSpeaking]=useState(false);
    const [userText,setUserText]=useState("");
    const [aiText,setAiText]=useState("");
    const [showAIText,setShowAIText]=useState(false);
    const [showMenu,setShowMenu]=useState(false);
    const [historyItems,setHistoryItems]=useState([]);
    const [typedText,setTypedText]=useState("");
    const [isSending,setIsSending]=useState(false);

    const recognitionRef=useRef(null);
    const listeningRef=useRef(false);
    const speakingRef=useRef(false);
    const processingRef=useRef(false);
    const restartTimeoutRef=useRef(null);

    const saveHistory=async(command,answer)=>{
        try{
            const result=await axios.post(
                `${serverUrl}/api/user/savehistory`,
                {
                    command,
                    answer
                },
                {
                    withCredentials:true
                }
            );

            if(result.data?.history){
                setHistoryItems(result.data.history);

                setUserData(prev=>{
                    if(!prev)return prev;

                    return{
                        ...prev,
                        history:result.data.history
                    };
                });
            }
        }catch(error){
            console.error(
                "SAVE HISTORY ERROR:",
                error.response?.data||error.message
            );
        }
    };

    useEffect(()=>{
        if(userData?.history){
            setHistoryItems(userData.history);
        }
    },[userData]);

    const showAnswer=(item)=>{
        setUserText(item.command);
        setAiText(item.answer);
        setShowAIText(true);
        setIsAIActive(false);
    };

    const speak=(text)=>{
        if(!text)return;

        window.speechSynthesis.cancel();

        const utterance=new SpeechSynthesisUtterance(text);

        utterance.rate=1.05;
        utterance.pitch=1;
        utterance.volume=1;

        const voices=window.speechSynthesis.getVoices();

        const englishVoice=voices.find(
            voice=>voice.lang?.toLowerCase().startsWith("en")
        );

        if(englishVoice){
            utterance.voice=englishVoice;
        }

        utterance.onstart=()=>{
            speakingRef.current=true;
            setIsSpeaking(true);
            setIsAIActive(true);
        };

        utterance.onend=()=>{
            speakingRef.current=false;
            setIsSpeaking(false);

            if(!processingRef.current){
                setIsAIActive(false);
            }

            if(
                listeningRef.current&&
                !processingRef.current
            ){
                restartRecognition();
            }
        };

        utterance.onerror=()=>{
            speakingRef.current=false;
            setIsSpeaking(false);
            setIsAIActive(false);
        };

        window.speechSynthesis.speak(utterance);
    };

    const stopSpeaking=()=>{
        window.speechSynthesis.cancel();

        speakingRef.current=false;
        setIsSpeaking(false);
        setIsAIActive(false);

        if(
            listeningRef.current&&
            !processingRef.current
        ){
            restartRecognition();
        }
    };

    const restartRecognition=()=>{
        if(
            !recognitionRef.current||
            !listeningRef.current||
            speakingRef.current||
            processingRef.current
        ){
            return;
        }

        clearTimeout(restartTimeoutRef.current);

        restartTimeoutRef.current=setTimeout(()=>{
            try{
                recognitionRef.current.start();
            }catch(error){
                if(error.name!=="InvalidStateError"){
                    console.error(
                        "RESTART RECOGNITION ERROR:",
                        error
                    );
                }
            }
        },300);
    };

    const handleSpecialCommand=async(data,shouldSpeak)=>{
        if(!data)return false;

        const type=data.type;
        const responseText=data.response||"";

        if(type==="open"){
            const url=data.url;

            if(url){
                window.open(url,"_blank");

                setAiText(
                    responseText||
                    `Opening ${data.name||"website"}`
                );

                setShowAIText(true);

                if(shouldSpeak){
                    speak(
                        responseText||
                        `Opening ${data.name||"website"}`
                    );
                }

                return true;
            }
        }

        if(type==="search"){
            const query=data.query;

            if(query){
                window.open(
                    `https://www.google.com/search?q=${encodeURIComponent(query)}`,
                    "_blank"
                );

                setAiText(
                    responseText||
                    `Searching for ${query}`
                );

                setShowAIText(true);

                if(shouldSpeak){
                    speak(
                        responseText||
                        `Searching for ${query}`
                    );
                }

                return true;
            }
        }

        return false;
    };

    const processCommand=async(command,shouldSpeak=true)=>{
        if(!command?.trim())return;

        processingRef.current=true;

        setIsSending(true);
        setUserText(command);
        setAiText("");
        setShowAIText(false);
        setIsAIActive(true);

        try{
            const cleanedCommand=command.trim();

            const result=await getGeminiResponse(cleanedCommand);

            if(!result){
                const errorText="Sorry, I could not get a response.";

                setAiText(errorText);
                setShowAIText(true);

                await saveHistory(
                    cleanedCommand,
                    errorText
                );

                if(shouldSpeak){
                    speak(errorText);
                }else{
                    setIsAIActive(false);
                }

                return;
            }

            let data=result;

            if(typeof result==="string"){
                try{
                    data=JSON.parse(result);
                }catch{
                    data={
                        type:"general",
                        response:result
                    };
                }
            }

            const responseText=
                data?.response||
                data?.answer||
                "Sorry, I could not understand that.";

            setAiText(responseText);
            setShowAIText(true);

            await saveHistory(
                cleanedCommand,
                responseText
            );

            const specialHandled=
                await handleSpecialCommand(
                    data,
                    shouldSpeak
                );

            if(!specialHandled){
                if(shouldSpeak){
                    speak(responseText);
                }else{
                    setIsAIActive(false);
                }
            }
        }catch(error){
            console.error(
                "PROCESS COMMAND ERROR:",
                error
            );

            const errorText=
                "Sorry, something went wrong.";

            setAiText(errorText);
            setShowAIText(true);

            if(shouldSpeak){
                speak(errorText);
            }else{
                setIsAIActive(false);
            }
        }finally{
            processingRef.current=false;
            setIsSending(false);

            if(
                !shouldSpeak&&
                !speakingRef.current
            ){
                setIsAIActive(false);
            }
        }
    };

    const handleSendText=async()=>{
        const command=typedText.trim();

        if(!command||isSending)return;

        if(isListening){
            stopListening();
        }

        setTypedText("");

        await processCommand(
            command,
            false
        );
    };

    useEffect(()=>{
        const SpeechRecognition=
            window.SpeechRecognition||
            window.webkitSpeechRecognition;

        if(!SpeechRecognition){
            console.error(
                "Speech recognition is not supported in this browser."
            );
            return;
        }

        const recognition=new SpeechRecognition();

        recognition.continuous=true;
        recognition.lang="en-US";
        recognition.interimResults=false;
        recognition.maxAlternatives=1;

        recognition.onstart=()=>{
            listeningRef.current=true;
            setIsListening(true);
        };

        recognition.onresult=async(event)=>{
            if(processingRef.current)return;

            const result=
                event.results[event.results.length-1];

            if(!result?.isFinal)return;

            const transcript=
                result[0]?.transcript?.trim();

            if(!transcript)return;

            const lowerText=transcript.toLowerCase();

            const stopCommands=[
                "thank you",
                "thanks",
                "stop",
                "bye",
                "goodbye",
                "stop listening",
                "cancel"
            ];

            if(
                stopCommands.some(
                    command=>lowerText===command
                )
            ){
                stopListening();
                return;
            }

            setUserText(transcript);
            setShowAIText(false);

            if(
                lowerText==="hey"||
                lowerText==="hi"||
                lowerText==="hello"
            ){
                const answer="Yes, I am listening.";

                setAiText(answer);
                setShowAIText(true);

                await saveHistory(
                    transcript,
                    answer
                );

                speak(answer);
                return;
            }

            try{
                recognition.stop();
            }catch(error){}

            await processCommand(
                transcript,
                true
            );
        };

        recognition.onend=()=>{
            if(
                listeningRef.current&&
                !speakingRef.current&&
                !processingRef.current
            ){
                restartRecognition();
            }else if(!listeningRef.current){
                setIsListening(false);
            }
        };

        recognition.onerror=(event)=>{
            console.error(
                "SPEECH RECOGNITION ERROR:",
                event.error
            );

            if(
                event.error==="not-allowed"||
                event.error==="audio-capture"
            ){
                listeningRef.current=false;
                setIsListening(false);
            }
        };

        recognitionRef.current=recognition;

        return()=>{
            listeningRef.current=false;

            clearTimeout(
                restartTimeoutRef.current
            );

            try{
                recognition.stop();
            }catch(error){}

            window.speechSynthesis.cancel();
        };
    },[]);

    const startListening=()=>{
        if(!recognitionRef.current)return;

        window.speechSynthesis.cancel();

        speakingRef.current=false;
        setIsSpeaking(false);

        listeningRef.current=true;
        setIsListening(true);

        try{
            recognitionRef.current.start();
        }catch(error){
            if(error.name!=="InvalidStateError"){
                console.error(
                    "START LISTENING ERROR:",
                    error
                );
            }
        }
    };

    const stopListening=()=>{
        listeningRef.current=false;

        setIsListening(false);

        clearTimeout(
            restartTimeoutRef.current
        );

        try{
            recognitionRef.current?.stop();
        }catch(error){}

        window.speechSynthesis.cancel();

        speakingRef.current=false;
        setIsSpeaking(false);
        setIsAIActive(false);
    };

    const toggleMic=()=>{
        if(isListening){
            stopListening();
        }else{
            startListening();
        }
    };

    const handleLogout=async()=>{
        stopListening();
        stopSpeaking();

        try{
            await axios.get(
                `${serverUrl}/api/auth/logout`,
                {
                    withCredentials:true
                }
            );
        }catch(error){
            console.error(
                "LOGOUT ERROR:",
                error.response?.data||error.message
            );
        }

        setUserData(null);
        navigate("/login");
    };

    return(
        <div className="min-h-screen w-full bg-linear-to-br from-black via-[#050b1a] to-[#10152b] text-white">

            <div className="flex items-center justify-between px-5 py-5">

                <div className="flex items-center gap-3">

                    <button
                        onClick={()=>setShowMenu(true)}
                        className="text-3xl"
                    >
                        <IoMdMenu/>
                    </button>

                    <h1 className="text-xl font-semibold">
                        Virtual Assistant
                    </h1>

                </div>

                <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-full bg-red-500 hover:bg-red-600"
                >
                    Logout
                </button>

            </div>

            {showMenu&&(
                <div className="fixed inset-0 z-50">

                    <div
                        className="absolute inset-0 bg-black/60"
                        onClick={()=>setShowMenu(false)}
                    />

                    <div className="relative w-[320px] max-w-[85%] h-full bg-[#10152b] p-5 overflow-y-auto">

                        <div className="flex justify-between items-center mb-6">

                            <h2 className="text-xl font-semibold">
                                History
                            </h2>

                            <button
                                onClick={()=>setShowMenu(false)}
                                className="text-3xl"
                            >
                                <IoMdClose/>
                            </button>

                        </div>

                        {historyItems.length===0?(
                            <p className="text-gray-400">
                                No history yet.
                            </p>
                        ):(
                            <div className="space-y-3">

                                {historyItems.map((item,index)=>(
                                    <button
                                        key={item._id||index}
                                        onClick={()=>{
                                            showAnswer(item);
                                            setShowMenu(false);
                                        }}
                                        className="w-full text-left p-3 rounded-xl bg-white/10 hover:bg-white/20"
                                    >
                                        <p className="font-medium">
                                            {item.command}
                                        </p>

                                        <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                                            {item.answer}
                                        </p>
                                    </button>
                                ))}

                            </div>
                        )}

                    </div>
                </div>
            )}

            <div className="flex flex-col items-center justify-center px-5 pt-5">

                <div className="mb-5 text-center">

                    <h2 className="text-2xl font-bold">
                        {userData?.assistantName||
                        "Assistant"}
                    </h2>

                    <p className="text-gray-400 mt-1">
                        Hello {userData?.name||"User"}
                    </p>

                </div>

                <div className="relative w-55 h-55 rounded-full overflow-hidden">

                    <img
                        src={
                            isAIActive?
                            ai:
                            user
                        }
                        alt="assistant"
                        className="w-full h-full object-cover"
                    />

                </div>

                {userText&&(
                    <div className="mt-7 max-w-2xl w-full text-center">

                        <p className="text-gray-400 text-sm mb-2">
                            You
                        </p>

                        <p className="text-lg">
                            {userText}
                        </p>

                    </div>
                )}

                {showAIText&&aiText&&(
                    <div className="mt-5 max-w-2xl w-full text-center">

                        <p className="text-gray-400 text-sm mb-2">
                            {userData?.assistantName||
                            "Assistant"}
                        </p>

                        <p className="text-lg leading-relaxed">
                            {aiText}
                        </p>

                    </div>
                )}

                <div className="mt-8 w-full max-w-2xl">

                    <div className="flex gap-3">

                        <input
                            type="text"
                            value={typedText}
                            onChange={e=>setTypedText(e.target.value)}
                            onKeyDown={e=>{
                                if(e.key==="Enter"){
                                    handleSendText();
                                }
                            }}
                            placeholder="Type your question..."
                            disabled={isSending}
                            className="flex-1 px-5 py-3 rounded-full bg-white/10 border border-white/20 outline-none focus:border-white/50"
                        />

                        <button
                            onClick={handleSendText}
                            disabled={
                                isSending||
                                !typedText.trim()
                            }
                            className="px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                        >
                            Send
                        </button>

                    </div>

                </div>

                <div className="mt-6 flex flex-wrap justify-center gap-3">

                    <button
                        onClick={toggleMic}
                        className={`px-6 py-3 rounded-full font-semibold ${
                            isListening
                            ?"bg-red-600 hover:bg-red-700"
                            :"bg-green-600 hover:bg-green-700"
                        }`}
                    >
                        {isListening
                            ?"🎤 Stop Mic"
                            :"🎤 Start Mic"
                        }
                    </button>

                    {isSpeaking&&(
                        <button
                            onClick={stopSpeaking}
                            className="px-6 py-3 rounded-full bg-orange-600 hover:bg-orange-700 font-semibold"
                        >
                            🔇 Stop Speaking
                        </button>
                    )}

                </div>

                <div className="mt-4 text-center text-gray-400">

                    {isSpeaking?(
                        <p>
                            Assistant is speaking...
                        </p>
                    ):isListening?(
                        <p>
                            Listening... Speak now.
                        </p>
                    ):isSending?(
                        <p>
                            Thinking...
                        </p>
                    ):(
                        <p>
                            Click Start Mic to speak
                        </p>
                    )}

                </div>

            </div>

        </div>
    );
};

export default Home;