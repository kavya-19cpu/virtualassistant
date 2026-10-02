import React,{useContext,useEffect,useRef,useState} from "react";
import {userDataContext} from "../context/UserContext";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import userImg from "../assets/user.gif";
import aiImg from "../assets/ai.gif";
import {IoMdMenu,IoMdClose} from "react-icons/io";

function Home(){
    const {
        userData,
        serverUrl,
        setUserData,
        getGeminiResponse
    }=useContext(userDataContext);

    const navigate=useNavigate();

    const [isListening,setIsListening]=useState(false);
    const [isAIActive,setIsAIActive]=useState(false);
    const [userText,setUserText]=useState("");
    const [aiText,setAiText]=useState("");
    const [showAIText,setShowAIText]=useState(false);
    const [showMenu,setShowMenu]=useState(false);
    const [historyItems,setHistoryItems]=useState([]);
    const [typedText,setTypedText]=useState("");
    const [isSending,setIsSending]=useState(false);
    const [selectedHistory,setSelectedHistory]=useState(null);

    const recognitionRef=useRef(null);
    const listeningRef=useRef(false);
    const speakingRef=useRef(false);
    const processingRef=useRef(false);
    const restartTimeoutRef=useRef(null);

    useEffect(()=>{
        setHistoryItems(
            Array.isArray(userData?.history)
                ?userData.history
                :[]
        );
    },[userData?.history]);

    const saveHistory=async(command,answer)=>{
        if(!command||!answer)return;

        const newItem={
            command:String(command).trim(),
            answer:String(answer).trim()
        };

        setHistoryItems(prev=>[
            newItem,
            ...prev.filter(item=>{
                const oldCommand=
                    typeof item==="string"
                        ?item
                        :item?.command||"";
                const oldAnswer=
                    typeof item==="string"
                        ?""
                        :item?.answer||"";

                return!(
                    oldCommand===newItem.command&&
                    oldAnswer===newItem.answer
                );
            })
        ].slice(0,50));

        try{
            const result=await axios.post(
                `${serverUrl}/api/user/savehistory`,
                {
                    command:newItem.command,
                    answer:newItem.answer
                },
                {
                    withCredentials:true
                }
            );

            if(result.data?.history){
                setHistoryItems(result.data.history);

                setUserData(prev=>
                    prev
                        ?{
                            ...prev,
                            history:result.data.history
                        }
                        :prev
                );
            }
        }catch(error){
            console.error(
                "SAVE HISTORY ERROR:",
                error.response?.data||error.message
            );
        }
    };

    const showAnswer=(command,answer)=>{
        setUserText(command||"");
        setAiText(answer||"");
        setShowAIText(true);
        setSelectedHistory({
            command,
            answer
        });
        setShowMenu(false);
    };

    const speak=text=>{
        if(!text)return;

        window.speechSynthesis.cancel();

        const utterance=new SpeechSynthesisUtterance(
            String(text)
        );

        utterance.rate=1.05;
        utterance.pitch=1;
        utterance.volume=1;

        utterance.onstart=()=>{
            speakingRef.current=true;
            setIsAIActive(true);
        };

        utterance.onend=()=>{
            speakingRef.current=false;
            setIsAIActive(false);

            if(
                listeningRef.current&&
                !processingRef.current&&
                recognitionRef.current
            ){
                try{
                    recognitionRef.current.start();
                }catch{}
            }
        };

        utterance.onerror=()=>{
            speakingRef.current=false;
            setIsAIActive(false);
        };

        window.speechSynthesis.speak(utterance);
    };

    const websiteMap={
        google:"https://www.google.com",
        youtube:"https://www.youtube.com",
        instagram:"https://www.instagram.com",
        facebook:"https://www.facebook.com",
        snapchat:"https://www.snapchat.com",
        wikipedia:"https://www.wikipedia.org",
        gaana:"https://gaana.com",
        spotify:"https://open.spotify.com",
        github:"https://github.com",
        reddit:"https://www.reddit.com",
        linkedin:"https://www.linkedin.com",
        netflix:"https://www.netflix.com",
        gmail:"https://mail.google.com",
        whatsapp:"https://web.whatsapp.com",
        amazon:"https://www.amazon.in",
        flipkart:"https://www.flipkart.com",
        twitter:"https://x.com",
        x:"https://x.com",
        telegram:"https://web.telegram.org",
        discord:"https://discord.com",
        stackoverflow:"https://stackoverflow.com",
        canva:"https://www.canva.com",
        quora:"https://www.quora.com",
        pinterest:"https://www.pinterest.com",
        twitch:"https://www.twitch.tv",
        imdb:"https://www.imdb.com",
        soundcloud:"https://soundcloud.com",
        deezer:"https://www.deezer.com",
        yahoo:"https://www.yahoo.com",
        bing:"https://www.bing.com",
        topper:"https://www.toppr.com",
        toppr:"https://www.toppr.com",
        vedant:"https://www.vedantu.com",
        vedantu:"https://www.vedantu.com",
        hungama:"https://www.hungama.com",
        udemy:"https://www.udemy.com",
        coursera:"https://www.coursera.org",
        gate:"https://gate2027.iitm.ac.in"
    };

    const createSiteSearchUrl=(site,query)=>{
        const q=encodeURIComponent(query);

        const searchUrls={
            google:`https://www.google.com/search?q=${q}`,
            youtube:`https://www.youtube.com/results?search_query=${q}`,
            instagram:`https://www.instagram.com/explore/search/keyword/?q=${q}`,
            facebook:`https://www.facebook.com/search/top?q=${q}`,
            wikipedia:`https://www.wikipedia.org/w/index.php?search=${q}`,
            spotify:`https://open.spotify.com/search/${q}`,
            github:`https://github.com/search?q=${q}`,
            reddit:`https://www.reddit.com/search/?q=${q}`,
            linkedin:`https://www.linkedin.com/search/results/all/?keywords=${q}`,
            amazon:`https://www.amazon.in/s?k=${q}`,
            flipkart:`https://www.flipkart.com/search?q=${q}`,
            bing:`https://www.bing.com/search?q=${q}`,
            yahoo:`https://search.yahoo.com/search?p=${q}`,
            stackoverflow:`https://stackoverflow.com/search?q=${q}`,
            pinterest:`https://www.pinterest.com/search/pins/?q=${q}`,
            quora:`https://www.quora.com/search?q=${q}`,
            twitch:`https://www.twitch.tv/search?term=${q}`,
            imdb:`https://www.imdb.com/find/?q=${q}`,
            soundcloud:`https://soundcloud.com/search?q=${q}`,
            deezer:`https://www.deezer.com/search/${q}`,
            udemy:`https://www.udemy.com/courses/search/?q=${q}`,
            coursera:`https://www.coursera.org/search?query=${q}`,
            canva:`https://www.canva.com/search?q=${q}`
        };

        return searchUrls[site]||null;
    };

    const getSearchUrl=command=>{
        const text=command.trim().replace(/[?!.]+$/,"");

        const match=text.match(
            /^(?:search|find|look for|look up)\s+(.+?)\s+(?:on|in|at|using)\s+([a-zA-Z0-9]+)$/i
        );

        if(match){
            const site=match[2].toLowerCase();
            const query=match[1].trim();

            return{
                url:createSiteSearchUrl(site,query),
                site:match[2].trim(),
                query
            };
        }

        const reverse=text.match(
            /^(?:search|find|look for|look up)\s+([a-zA-Z0-9]+)\s+(?:for|about|regarding)\s+(.+)$/i
        );

        if(reverse){
            const site=reverse[1].toLowerCase();
            const query=reverse[2].trim();

            return{
                url:createSiteSearchUrl(site,query),
                site:reverse[1].trim(),
                query
            };
        }

        return null;
    };

    const getDirectUrl=command=>{
        const text=command.trim();

        const domainMatch=text.match(
            /^(?:open|launch|visit|go to|take me to)\s+(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+)$/i
        );

        if(domainMatch){
            let url=domainMatch[1].replace(/[.,!?]+$/,"");

            if(!/^https?:\/\//i.test(url)){
                url=`https://${url}`;
            }

            return url;
        }

        const nameMatch=text.match(
            /^(?:open|launch|visit|go to|take me to)\s+(.+)$/i
        );

        if(!nameMatch)return null;

        const siteName=nameMatch[1]
            .trim()
            .toLowerCase()
            .replace(/\s+website$/i,"")
            .replace(/\s+site$/i,"");

        return websiteMap[siteName]||null;
    };

    const openUrl=url=>{
        if(!url)return false;

        let finalUrl=String(url).trim();

        if(!/^https?:\/\//i.test(finalUrl)){
            finalUrl=`https://${finalUrl}`;
        }

        try{
            const parsed=new URL(finalUrl);

            if(
                parsed.protocol!=="http:"&&
                parsed.protocol!=="https:"
            ){
                return false;
            }

            const newTab=window.open(
                parsed.href,
                "_blank"
            );

            if(!newTab)return false;

            return true;
        }catch(error){
            console.error(
                "Invalid URL:",
                url
            );
            return false;
        }
    };

    const handleSpecialCommand=(data,shouldSpeak)=>{
        if(!data)return false;

        const type=data.type;
        const response=data.response||"";
        let handled=true;

        switch(type){
            case "google_open":
                openUrl(
                    "https://www.google.com"
                );
                break;

            case "google_search":
                if(data.query){
                    openUrl(
                        `https://www.google.com/search?q=${encodeURIComponent(data.query)}`
                    );
                }
                break;

            case "youtube_open":
                openUrl(
                    "https://www.youtube.com"
                );
                break;

            case "youtube_search":
            case "youtube_play":
                if(data.query){
                    openUrl(
                        `https://www.youtube.com/results?search_query=${encodeURIComponent(data.query)}`
                    );
                }
                break;

            case "calculator_open":
                openUrl(
                    "https://www.google.com/search?q=calculator"
                );
                break;

            case "calculator_calculate":
                if(data.query){
                    openUrl(
                        `https://www.google.com/search?q=${encodeURIComponent(data.query)}`
                    );
                }
                break;

            case "instagram_open":
                openUrl(
                    "https://www.instagram.com"
                );
                break;

            case "facebook_open":
                openUrl(
                    "https://www.facebook.com"
                );
                break;

            case "weather_show":
                openUrl(
                    data.query
                        ?`https://www.google.com/search?q=${encodeURIComponent(data.query)}`
                        :"https://www.google.com/search?q=weather"
                );
                break;

            default:
                handled=false;
                break;
        }

        if(response){
            setAiText(response);
            setShowAIText(true);

            if(shouldSpeak){
                speak(response);
            }
        }

        if(!shouldSpeak){
            setIsAIActive(false);
        }

        return handled;
    };

    const processCommand=async(
        command,
        shouldSpeak=true
    )=>{
        const cleanedCommand=String(
            command||""
        ).trim();

        if(
            !cleanedCommand||
            processingRef.current
        ){
            return;
        }

        processingRef.current=true;
        setIsSending(true);
        setUserText(cleanedCommand);
        setAiText("");
        setShowAIText(false);
        setSelectedHistory(null);
        setIsAIActive(true);

        try{
            const siteSearch=getSearchUrl(
                cleanedCommand
            );

            if(siteSearch?.url){
                const message=
                    `Searching ${siteSearch.site} for ${siteSearch.query}.`;

                setAiText(message);
                setShowAIText(true);

                await saveHistory(
                    cleanedCommand,
                    message
                );

                openUrl(siteSearch.url);

                if(shouldSpeak){
                    speak(message);
                }else{
                    setIsAIActive(false);
                }

                return;
            }

            const googleMatch=cleanedCommand.match(
                /^(?:open|search|find)\s+(.+?)\s+(?:at|on|in)\s+google$/i
            );

            if(googleMatch){
                const query=googleMatch[1].trim();

                const message=
                    `Searching Google for ${query}.`;

                setAiText(message);
                setShowAIText(true);

                await saveHistory(
                    cleanedCommand,
                    message
                );

                openUrl(
                    `https://www.google.com/search?q=${encodeURIComponent(query)}`
                );

                if(shouldSpeak){
                    speak(message);
                }else{
                    setIsAIActive(false);
                }

                return;
            }

            const directUrl=getDirectUrl(
                cleanedCommand
            );

            if(directUrl){
                const siteName=cleanedCommand
                    .replace(
                        /^(open|launch|visit|go to|take me to)\s+/i,
                        ""
                    )
                    .trim();

                const message=
                    `Opening ${siteName}.`;

                setAiText(message);
                setShowAIText(true);

                await saveHistory(
                    cleanedCommand,
                    message
                );

                openUrl(directUrl);

                if(shouldSpeak){
                    speak(message);
                }else{
                    setIsAIActive(false);
                }

                return;
            }

            const result=await getGeminiResponse(
                cleanedCommand
            );

            let parsedResult=result;

            if(typeof result==="string"){
                const cleanResult=result
                    .replace(/```json/gi,"")
                    .replace(/```/g,"")
                    .trim();

                try{
                    parsedResult=JSON.parse(
                        cleanResult
                    );
                }catch{
                    const jsonMatch=
                        cleanResult.match(
                            /{[\s\S]*}/
                        );

                    if(jsonMatch){
                        try{
                            parsedResult=JSON.parse(
                                jsonMatch[0]
                            );
                        }catch{
                            parsedResult={
                                type:"general",
                                response:cleanResult
                            };
                        }
                    }else{
                        parsedResult={
                            type:"general",
                            response:cleanResult
                        };
                    }
                }
            }

            if(!parsedResult||parsedResult.error){
                const errorText=
                    parsedResult?.error||
                    "Sorry, I could not process that request.";

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

            const responseText=
                parsedResult.response||
                parsedResult.answer||
                parsedResult.text||
                "";

            if(!responseText){
                const errorText=
                    "Sorry, I did not get an answer.";

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

            setAiText(responseText);
            setShowAIText(true);

            await saveHistory(
                cleanedCommand,
                responseText
            );

            if(
                handleSpecialCommand(
                    {
                        ...parsedResult,
                        response:responseText
                    },
                    shouldSpeak
                )
            ){
                return;
            }

            if(shouldSpeak){
                speak(responseText);
            }else{
                setIsAIActive(false);
            }

        }catch(error){
            console.error(
                "Assistant error:",
                error
            );

            const errorText=
                error.response?.data?.message||
                error.message||
                "Sorry, something went wrong.";

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
        }finally{
            processingRef.current=false;
            setIsSending(false);

            if(
                !speakingRef.current&&
                !shouldSpeak
            ){
                setIsAIActive(false);
            }
        }
    };

    const handleSendText=async()=>{
        const command=typedText.trim();

        if(!command||isSending)return;

        if(isListening){
            listeningRef.current=false;

            try{
                recognitionRef.current?.stop();
            }catch{}
        }

        setTypedText("");

        await processCommand(
            command,
            false
        );
    };

    const handleInputKeyDown=event=>{
        if(event.key==="Enter"){
            event.preventDefault();
            handleSendText();
        }
    };

    useEffect(()=>{
        const SpeechRecognition=
            window.SpeechRecognition||
            window.webkitSpeechRecognition;

        if(!SpeechRecognition)return;

        const recognition=
            new SpeechRecognition();

        recognition.continuous=true;
        recognition.lang="en-US";
        recognition.interimResults=false;
        recognition.maxAlternatives=1;

        recognitionRef.current=
            recognition;

        recognition.onstart=()=>{
            listeningRef.current=true;
            setIsListening(true);
        };

        recognition.onresult=async event=>{
            if(processingRef.current)return;

            const lastResult=
                event.results[
                    event.results.length-1
                ];

            if(
                !lastResult||
                !lastResult[0]
            ){
                return;
            }

            const transcript=
                lastResult[0].transcript.trim();

            if(!transcript)return;

            const lowerTranscript=
                transcript.toLowerCase();

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
                stopCommands.includes(
                    lowerTranscript
                )
            ){
                listeningRef.current=false;
                speakingRef.current=false;

                setIsListening(false);
                setIsAIActive(false);

                try{
                    recognition.stop();
                }catch{}

                window.speechSynthesis.cancel();

                return;
            }

            setUserText(transcript);
            setAiText("");
            setShowAIText(false);

            if(
                lowerTranscript==="hey"||
                lowerTranscript==="hi"||
                lowerTranscript==="hello"
            ){
                const answer=
                    "Yes, I am listening.";

                await saveHistory(
                    transcript,
                    answer
                );

                speak(answer);

                return;
            }

            try{
                recognition.stop();
            }catch{}

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
                clearTimeout(
                    restartTimeoutRef.current
                );

                restartTimeoutRef.current=
                    setTimeout(()=>{
                        try{
                            recognition.start();
                        }catch{}
                    },150);
            }else if(
                !listeningRef.current
            ){
                setIsListening(false);
                setIsAIActive(false);
            }
        };

        recognition.onerror=event=>{
            console.log(
                "Speech recognition error:",
                event.error
            );

            if(
                event.error==="not-allowed"||
                event.error==="audio-capture"
            ){
                listeningRef.current=false;
                setIsListening(false);
                setIsAIActive(false);
            }
        };

        return()=>{
            listeningRef.current=false;
            processingRef.current=false;
            speakingRef.current=false;

            clearTimeout(
                restartTimeoutRef.current
            );

            try{
                recognition.stop();
            }catch{}

            window.speechSynthesis.cancel();
        };
    },[getGeminiResponse]);

    const startListening=()=>{
        if(!recognitionRef.current){
            alert(
                "Speech recognition is not supported in this browser."
            );
            return;
        }

        try{
            window.speechSynthesis.cancel();

            speakingRef.current=false;
            processingRef.current=false;

            setIsAIActive(false);

            listeningRef.current=true;
            setIsListening(true);

            recognitionRef.current.start();
        }catch{}
    };

    const stopListening=()=>{
        listeningRef.current=false;
        processingRef.current=false;
        speakingRef.current=false;

        setIsListening(false);
        setIsAIActive(false);

        clearTimeout(
            restartTimeoutRef.current
        );

        window.speechSynthesis.cancel();

        try{
            recognitionRef.current?.stop();
        }catch{}
    };

    const toggleMic=()=>{
        if(isListening){
            stopListening();
        }else{
            startListening();
        }
    };

    const handleLogout=async()=>{
        try{
            listeningRef.current=false;
            processingRef.current=false;
            speakingRef.current=false;

            setIsListening(false);
            setIsAIActive(false);

            clearTimeout(
                restartTimeoutRef.current
            );

            try{
                recognitionRef.current?.stop();
            }catch{}

            window.speechSynthesis.cancel();

            await axios.post(
                `${serverUrl}/api/auth/logout`,
                {},
                {
                    withCredentials:true
                }
            );

            setUserData(null);
            navigate("/signin");
        }catch(error){
            console.error(
                "LOGOUT ERROR:",
                error
            );
        }
    };

    const handleCustomize=()=>{
        navigate("/customize2");
    };

    const assistantImage=
        userData?.assistantImage||
        userData?.selectedImage||
        userData?.image;

    const assistantName=
        userData?.assistantName||
        "Assistant";

    return(
        <div className="relative min-h-screen w-full overflow-hidden bg-[#05060b] text-white">

            <main
                className={`w-full max-w-225 min-h-screen flex flex-col items-center justify-center box-border pt-10 mx-auto transition-all duration-200 ${
                    showMenu
                        ?"blur-[3px] opacity-70"
                        :"blur-0 opacity-100"
                }`}
            >
                <div className="w-full flex flex-col items-center justify-center px-5 box-border">

                    <div className="relative w-[clamp(190px,50vw,300px)] h-[clamp(280px,48vh,400px)] flex items-center justify-center overflow-hidden rounded-[20px] bg-black/10">

                        {assistantImage?(
                            <img
                                src={assistantImage}
                                alt={assistantName}
                                className="w-full h-full object-contain object-center block"
                            />
                        ):(
                            <div className="w-full h-full flex items-center justify-center text-[80px]">
                                🤖
                            </div>
                        )}

                    </div>

                    <div className="mt-3.5 text-white text-2xl font-semibold text-center max-sm:text-xl">
                        I'm {assistantName}
                    </div>

                    <div className="w-full h-25 flex items-center justify-center mt-2 max-sm:h-22.5">
                        <img
                            src={isAIActive?aiImg:userImg}
                            alt={isAIActive?"AI":"User"}
                            className="w-22.5 h-22.5 object-contain block max-sm:w-20 max-sm:h-20"
                        />
                    </div>

                    <div className="w-full min-h-15 flex items-center justify-center px-3">
                        <div className="text-white text-[18px] font-bold text-center w-full leading-[1.4] whitespace-pre-wrap wrap-break-word max-h-45 overflow-y-auto dark-scrollbar">
                            {showAIText?aiText:userText}
                        </div>
                    </div>

                    <div className="w-full max-w-175 mt-5 px-2">
                        <div className="flex items-center gap-2 w-full">

                            <input
                                type="text"
                                value={typedText}
                                onChange={event=>
                                    setTypedText(
                                        event.target.value
                                    )
                                }
                                onKeyDown={
                                    handleInputKeyDown
                                }
                                placeholder="Type your question or command..."
                                disabled={isSending}
                                className="flex-1 min-w-0 px-4 py-3 rounded-xl bg-white/10 border border-white/10 focus:border-blue-400/50 outline-none text-white placeholder:text-gray-500 text-sm transition-all duration-150 disabled:opacity-50"
                            />

                            <button
                                onClick={
                                    handleSendText
                                }
                                disabled={
                                    isSending||
                                    !typedText.trim()
                                }
                                className="px-5 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-semibold cursor-pointer disabled:cursor-not-allowed transition-all duration-150 active:scale-95"
                            >
                                {isSending?"...":"Send"}
                            </button>

                        </div>
                    </div>

                    <button
                        onClick={toggleMic}
                        className={`mt-5 px-6 py-3 border-none rounded-xl text-white text-base font-semibold cursor-pointer min-w-32.5 transition-all duration-150 active:scale-95 ${
                            isListening
                                ?"bg-red-500 hover:bg-red-600"
                                :"bg-green-500 hover:bg-green-600"
                        }`}
                    >
                        {isListening
                            ?"Stop Mic"
                            :"Start Mic"}
                    </button>

                    <div className="mt-3 text-gray-300 text-sm text-center max-w-[90%]">
                        {isListening
                            ?"Listening... Speak now."
                            :"Press the mic to start a conversation."}
                    </div>

                </div>
            </main>

            {!showMenu&&(
                <button
                    onClick={()=>
                        setShowMenu(true)
                    }
                    className="fixed top-5 left-5 z-1200 flex items-center justify-center w-11 h-11 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-[29px] cursor-pointer backdrop-blur-xl shadow-lg transition-all duration-150 active:scale-95"
                    aria-label="Open assistant menu"
                >
                    <IoMdMenu/>
                </button>
            )}

            <div className="fixed top-5 right-5 z-1200 flex flex-col items-end gap-3">

                <button
                    onClick={handleLogout}
                    className="px-4.5 py-2.5 border-none rounded-[10px] bg-red-500 hover:bg-red-600 text-white text-sm font-semibold cursor-pointer whitespace-nowrap transition-all duration-150 active:scale-95 shadow-lg"
                >
                    Log Out
                </button>

                <button
                    onClick={handleCustomize}
                    className="px-4.5 py-2.5 border-none rounded-[10px] bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold cursor-pointer whitespace-nowrap transition-all duration-150 active:scale-95 shadow-lg"
                >
                    Customize your Assistant
                </button>

            </div>

            <div
                onClick={()=>
                    setShowMenu(false)
                }
                className={`fixed inset-0 z-1050 bg-transparent transition-all duration-200 ${
                    showMenu
                        ?"visible backdrop-blur-[2px]"
                        :"invisible pointer-events-none"
                }`}
            />

            <aside
                className={`fixed top-0 left-0 bottom-0 z-1100 w-[min(25vw,380px)] min-w-75 max-sm:min-w-0 max-sm:w-[86vw] bg-[#0b0d14]/97 backdrop-blur-2xl border-r border-white/10 shadow-[20px_0_60px_rgba(0,0,0,0.3)] flex flex-col transition-transform duration-200 ease-out ${
                    showMenu
                        ?"translate-x-0"
                        :"-translate-x-full"
                }`}
            >

                <div className="flex items-center justify-between px-5 py-5 border-b border-white/10 shrink-0">

                    <div>
                        <h2 className="text-white text-lg sm:text-xl font-bold m-0">
                            Assistant Menu
                        </h2>

                        <p className="text-gray-500 text-xs mt-1 m-0">
                            Your recent activity
                        </p>
                    </div>

                    <button
                        onClick={()=>
                            setShowMenu(false)
                        }
                        className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-2xl cursor-pointer transition-all duration-150 active:scale-95"
                        aria-label="Close assistant menu"
                    >
                        <IoMdClose/>
                    </button>

                </div>

                <div className="px-5 pt-5 pb-3 flex items-center justify-between shrink-0">

                    <h3 className="text-white text-base font-semibold m-0">
                        History
                    </h3>

                    <span className="text-gray-500 text-xs">
                        {historyItems.length}{" "}
                        {historyItems.length===1
                            ?"item"
                            :"items"}
                    </span>

                </div>

                <div className="flex-1 overflow-y-auto px-4 pb-5 dark-scrollbar">

                    {historyItems.length?(
                        <div className="flex flex-col gap-2">

                            {historyItems.map(
                                (item,index)=>{
                                    const command=
                                        typeof item==="string"
                                            ?item
                                            :item?.command||
                                                item?.text||
                                                item?.query||
                                                "";

                                    const answer=
                                        typeof item==="string"
                                            ?""
                                            :item?.answer||"";

                                    return(
                                        <button
                                            key={
                                                item?._id||
                                                `${index}-${command}`
                                            }
                                            onClick={()=>
                                                showAnswer(
                                                    command,
                                                    answer
                                                )
                                            }
                                            className="w-full text-left group px-4 py-3 rounded-xl bg-white/4 hover:bg-white/8 border border-white/6 hover:border-blue-400/30 text-gray-300 hover:text-white text-sm leading-relaxed wrap-break-word transition-all duration-150 cursor-pointer"
                                        >

                                            <div className="flex flex-col gap-3 min-w-0 w-full">

                                                <div>
                                                    <div className="text-white font-medium">
                                                        {command}
                                                    </div>
                                                </div>

                                                <div>
                                                    <div className="text-gray-500 text-xs">
                                                        Answer:
                                                    </div>

                                                    <div className="text-gray-400 text-sm leading-relaxed mt-1">
                                                        {answer||"No answer saved."}
                                                    </div>
                                                </div>

                                            </div>

                                        </button>
                                    );
                                }
                            )}

                        </div>
                    ):(
                        <div className="h-full min-h-62.5 flex flex-col items-center justify-center text-center px-5">

                            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 text-xl mb-4">
                                ✦
                            </div>

                            <p className="text-gray-400 text-sm m-0">
                                No history yet
                            </p>

                            <p className="text-gray-600 text-xs mt-2 max-w-55 leading-relaxed">
                                Your questions and answers will appear here.
                            </p>

                        </div>
                    )}

                </div>

            </aside>

        </div>
    );
}

export default Home;