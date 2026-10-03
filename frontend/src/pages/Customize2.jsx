
import React, {
    useContext,
    useState
} from "react";


import {
    userDataContext
} from "../context/UserContext";


import {
    useNavigate
} from "react-router-dom";


import axios from "axios";


import {
    IoMdArrowBack
} from "react-icons/io";


const Customize2 = () => {


    const {
        userData,
        backendImage,
        selectedImage,
        serverUrl,
        setUserData
    } = useContext(userDataContext);


    const [assistantName, setAssistantName] =
        useState(
            userData?.assistantName || ""
        );


    const [loading, setLoading] =
        useState(false);


    const navigate = useNavigate();


    const handleUpdateAssistant = async () => {


        if (!assistantName.trim()) {
            alert("Please enter assistant name");
            return;
        }


        if (!backendImage && !selectedImage) {
            alert(
                "Please select an assistant image"
            );
            return;
        }


        setLoading(true);


        try {


            const formData = new FormData();


            formData.append(
                "assistantName",
                assistantName.trim()
            );


            if (backendImage) {


                formData.append(
                    "assistantImage",
                    backendImage
                );


            } else if (selectedImage) {


                formData.append(
                    "imageUrl",
                    selectedImage
                );
            }


            const result = await axios.put(
                `${serverUrl}/api/user/updateassistant`,
                formData,
                {
                    withCredentials: true
                }
            );


            console.log(
                "UPDATE RESPONSE:",
                result.data
            );


            setUserData(result.data);


            navigate("/");


        } catch (error) {


            console.error(
                "UPDATE ASSISTANT ERROR:",
                error
            );


            console.error(
                "Status:",
                error.response?.status
            );


            console.error(
                "Backend Response:",
                error.response?.data
            );


        } finally {


            setLoading(false);


        }
    };


    return (


        <div
            className="
                w-full
                min-h-screen

                bg-linear-to-t
                from-black
                to-[#030353]

                flex
                flex-col
                justify-center
                items-center

                px-4
                py-20

                sm:px-6
                sm:py-16

                md:px-8
                md:py-12

                relative

                overflow-x-hidden
                overflow-y-auto

                box-border
            "
        >


            {/* BACK BUTTON */}


            <button
                type="button"
                onClick={() =>
                    navigate("/customize")
                }
                className="
                    absolute

                    top-4
                    left-4

                    sm:top-6
                    sm:left-6

                    md:top-7
                    md:left-7

                    w-10
                    h-10

                    sm:w-11
                    sm:h-11

                    md:w-12
                    md:h-12

                    flex
                    items-center
                    justify-center

                    text-white

                    bg-white/5
                    hover:bg-white/10

                    border
                    border-white/10

                    rounded-full

                    cursor-pointer

                    transition-all
                    duration-200

                    active:scale-95

                    z-10
                "
                aria-label="Go back"
            >


                <IoMdArrowBack
                    className="
                        w-5
                        h-5

                        sm:w-6
                        sm:h-6

                        md:w-6
                        md:h-6
                    "
                />


            </button>


            {/* MAIN CONTENT */}


            <div
                className="
                    w-full
                    max-w-175

                    flex
                    flex-col
                    items-center

                    box-border
                "
            >


                {/* HEADING */}


                <h1
                    className="
                        w-full

                        text-white

                        font-semibold
                        text-center

                        leading-[1.15]

                        mb-6
                        sm:mb-7
                        md:mb-8

                        px-2

                        text-[clamp(24px,7vw,38px)]

                        wrap-break-word
                    "
                >


                    Enter your

                    <span className="text-blue-200">
                        {" "}Assistant Name
                    </span>


                </h1>


                {/* NAME INPUT */}


                <input
                    type="text"
                    placeholder="eg. Sophia"
                    required
                    value={assistantName}
                    onChange={(e) =>
                        setAssistantName(
                            e.target.value
                        )
                    }
                    className="
                        w-full

                        max-w-150

                        h-12
                        sm:h-13
                        md:h-15

                        outline-none

                        border-2
                        border-white

                        bg-transparent

                        text-white
                        placeholder-gray-300

                        px-4
                        sm:px-5
                        md:px-6

                        rounded-full

                        text-[15px]
                        sm:text-base
                        md:text-[18px]

                        focus:border-blue-400

                        transition-all
                        duration-200

                        box-border

                        min-w-0
                    "
                />


                {/* CREATE BUTTON */}


                {assistantName.trim() && (


                    <button
                        type="button"
                        disabled={loading}
                        onClick={
                            handleUpdateAssistant
                        }
                        className="
                            w-full

                            max-w-75

                            min-h-12

                            sm:min-h-13

                            md:min-h-14

                            mt-6
                            sm:mt-7
                            md:mt-8

                            px-5
                            sm:px-6

                            text-black
                            font-semibold

                            bg-white

                            rounded-full

                            text-[14px]
                            sm:text-base
                            md:text-[18px]

                            cursor-pointer

                            hover:bg-gray-200

                            active:scale-95

                            transition-all
                            duration-200

                            disabled:opacity-50
                            disabled:cursor-not-allowed

                            box-border

                            whitespace-normal
                        "
                    >


                        {loading
                            ? "Loading..."
                            : "Finally Create your Assistant"}


                    </button>


                )}


            </div>


        </div>


    );
};


export default Customize2;