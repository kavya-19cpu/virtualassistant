import React, {
    useContext,
    useEffect,
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


    const [
        assistantName,
        setAssistantName
    ] = useState(
        userData?.assistantName || ""
    );


    const [
        loading,
        setLoading
    ] = useState(false);


    const [
        uploadedImageUrl,
        setUploadedImageUrl
    ] = useState(null);


    const navigate = useNavigate();


    /*
     * CREATE PREVIEW FOR UPLOADED IMAGE
     */

    useEffect(() => {

        if (!backendImage) {

            setUploadedImageUrl(null);

            return;
        }


        const imageUrl =
            URL.createObjectURL(
                backendImage
            );


        setUploadedImageUrl(
            imageUrl
        );


        return () => {

            URL.revokeObjectURL(
                imageUrl
            );

        };

    }, [backendImage]);


    /*
     * IMAGE TO DISPLAY
     *
     * Uploaded image has priority.
     * Otherwise show selected preset image.
     */

    const previewImage =
        uploadedImageUrl ||
        selectedImage;


    /*
     * UPDATE ASSISTANT
     */

    const handleUpdateAssistant =
        async () => {

            if (!assistantName.trim()) {

                alert(
                    "Please enter assistant name"
                );

                return;
            }


            if (
                !backendImage &&
                !selectedImage
            ) {

                alert(
                    "Please select an assistant image"
                );

                return;
            }


            setLoading(true);


            try {

                const formData =
                    new FormData();


                formData.append(
                    "assistantName",
                    assistantName.trim()
                );


                if (backendImage) {

                    formData.append(
                        "assistantImage",
                        backendImage
                    );

                } else if (
                    selectedImage
                ) {

                    formData.append(
                        "imageUrl",
                        selectedImage
                    );

                }


                const result =
                    await axios.put(
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


                setUserData(
                    result.data
                );


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
                to-[#070B14]

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

                    text-cyan-300

                    bg-cyan-400/5
                    hover:bg-cyan-400/15

                    border
                    border-cyan-400/20
                    hover:border-cyan-400/40

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

                {/* SELECTED / UPLOADED IMAGE */}

                {previewImage && (

                    <div
                        className="
                            w-18.75
                            h-32.5

                            sm:w-25
                            sm:h-42.5

                            md:w-30
                            md:h-50

                            lg:w-37.5
                            lg:h-62.5

                            bg-[#020810]

                            border-2
                            border-cyan-400

                            rounded-2xl

                            overflow-hidden

                            shrink-0

                            flex
                            items-center
                            justify-center

                            mb-6
                            sm:mb-7
                            md:mb-8

                            shadow-2xl
                            shadow-cyan-950

                        "
                    >

                        <img
                            src={previewImage}
                            alt="Assistant"
                            className="
                                w-full
                                h-full
                                object-cover
                                block
                            "
                        />

                    </div>

                )}


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

                    <span
                        className="
                            text-cyan-300
                        "
                    >
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
                        border-white/20
                        hover:border-white/30

                        bg-white/5

                        text-white
                        placeholder-gray-400

                        px-4
                        sm:px-5
                        md:px-6

                        rounded-full

                        text-[15px]
                        sm:text-base
                        md:text-[18px]

                        focus:border-cyan-400
                        focus:bg-white/10

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

                            bg-cyan-400
                            hover:bg-cyan-300

                            rounded-full

                            text-[14px]
                            sm:text-base
                            md:text-[18px]

                            cursor-pointer

                            active:scale-95

                            transition-all
                            duration-200

                            disabled:opacity-50
                            disabled:cursor-not-allowed

                            box-border

                            whitespace-normal

                            shadow-lg
                            shadow-cyan-950/40
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