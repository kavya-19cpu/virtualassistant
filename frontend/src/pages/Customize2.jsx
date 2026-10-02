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
                `${serverUrl}/api/user/update`,
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
                py-8

                sm:px-6
                md:px-8

                relative

                overflow-x-hidden
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

                    flex
                    items-center
                    justify-center

                    text-white

                    bg-white/5
                    hover:bg-white/10

                    rounded-full

                    cursor-pointer

                    transition
                "
                aria-label="Go back"
            >

                <IoMdArrowBack
                    className="w-6 h-6"
                />

            </button>


            {/* HEADING */}

            <h1
                className="
                    text-white

                    font-semibold
                    text-center

                    leading-tight

                    mb-7

                    text-[26px]
                    sm:text-[32px]
                    md:text-[38px]
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

                    h-13
                    sm:h-14
                    md:h-15

                    outline-none

                    border-2
                    border-white

                    bg-transparent

                    text-white
                    placeholder-gray-300

                    px-4
                    sm:px-5

                    rounded-full

                    text-base
                    sm:text-[17px]
                    md:text-[18px]

                    focus:border-blue-400

                    transition
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

                        min-h-12.5
                        sm:min-h-14

                        mt-7

                        px-6

                        text-black
                        font-semibold

                        bg-white
                        rounded-full

                        text-sm
                        sm:text-base
                        md:text-[18px]

                        cursor-pointer

                        hover:bg-gray-200
                        active:scale-95

                        transition

                        disabled:opacity-50
                        disabled:cursor-not-allowed
                    "
                >

                    {loading
                        ? "Loading..."
                        : "Finally Create your Assistant"}

                </button>

            )}

        </div>

    );
};


export default Customize2;