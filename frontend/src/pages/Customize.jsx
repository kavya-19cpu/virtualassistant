
import React, {
    useContext,
    useRef
} from "react";


import Card from "../components/Card";


import image1 from "../assets/image1.webp";
import image2 from "../assets/image2.webp";
import image3 from "../assets/image3.png";
import image4 from "../assets/image4.webp";
import image6 from "../assets/image6.webp";


import {
    useNavigate
} from "react-router-dom";


import {
    BiImageAdd
} from "react-icons/bi";


import {
    userDataContext
} from "../context/UserContext";


import {
    IoMdArrowBack
} from "react-icons/io";


const Customize = () => {


    const {
        backendImage,
        setBackendImage,
        frontendImage,
        setFrontendImage,
        selectedImage,
        setSelectedImage
    } = useContext(userDataContext);


    const navigate = useNavigate();


    const inputImage = useRef();


    const handleImage = (e) => {


        const file = e.target.files[0];


        if (!file) return;


        setBackendImage(file);


        setFrontendImage(
            URL.createObjectURL(file)
        );

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

                overflow-x-hidden
            "
        >


            {/* BACK BUTTON */}


            <button
                type="button"
                onClick={() =>
                    navigate("/")
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

                    border
                    border-white/10

                    rounded-full

                    transition-all
                    duration-200

                    cursor-pointer

                    active:scale-95

                    z-10
                "
                aria-label="Go back"
            >


                <IoMdArrowBack
                    className="
                        w-6
                        h-6
                    "
                />


            </button>


            {/* HEADING */}


            <h1
                className="
                    w-full

                    text-white

                    font-semibold
                    text-center

                    leading-tight

                    mb-7

                    px-2

                    text-[clamp(24px,7vw,38px)]

                    wrap-break-word
                "
            >


                Select your

                <span className="text-blue-200">
                    {" "}Assistant Image
                </span>


            </h1>


            {/* IMAGE GRID */}


            <div
                className="
                    w-full
                    max-w-225

                    grid

                    grid-cols-3

                    gap-3
                    sm:gap-4
                    md:gap-5

                    justify-items-center

                    px-2

                    box-border
                "
            >


                {/* PRESET IMAGES */}


                <Card image={image1} />

                <Card image={image2} />

                <Card image={image3} />

                <Card image={image4} />

                <Card image={image6} />


                {/* UPLOAD CARD */}


                <div
                    onClick={() => {

                        inputImage.current.click();

                        setSelectedImage("input");

                    }}
                    className={`
                        w-18.75
                        h-32.5

                        sm:w-25
                        sm:h-42.5

                        md:w-30
                        md:h-50

                        lg:w-37.5
                        lg:h-62.5

                        bg-[#020220]

                        border-2
                        border-blue-600

                        rounded-2xl

                        overflow-hidden

                        cursor-pointer

                        flex
                        items-center
                        justify-center

                        shrink-0

                        hover:border-4
                        hover:border-white

                        hover:shadow-2xl
                        hover:shadow-blue-950

                        transition-all
                        duration-200

                        ${
                            selectedImage === "input"
                                ? "border-4 border-white shadow-2xl shadow-blue-950"
                                : ""
                        }
                    `}
                >


                    {/* UPLOAD ICON */}


                    {!frontendImage && (


                        <BiImageAdd
                            className="
                                text-white

                                w-8
                                h-8

                                sm:w-10
                                sm:h-10
                            "
                        />


                    )}


                    {/* UPLOADED IMAGE */}


                    {frontendImage && (


                        <img
                            src={frontendImage}
                            alt="Uploaded assistant"
                            className="
                                w-full
                                h-full
                                object-cover
                                block
                            "
                        />


                    )}


                </div>


                {/* FILE INPUT */}


                <input
                    type="file"
                    accept="image/*"
                    ref={inputImage}
                    hidden
                    onChange={handleImage}
                />


            </div>


            {/* NEXT BUTTON */}


            {selectedImage && (


                <button
                    type="button"
                    onClick={() =>
                        navigate("/customize2")
                    }
                    className="
                        min-w-32.5

                        sm:min-w-37.5

                        h-12

                        sm:h-14

                        md:h-15

                        mt-7

                        px-6

                        text-black
                        font-semibold

                        bg-white

                        rounded-full

                        text-base

                        sm:text-[18px]

                        md:text-[19px]

                        cursor-pointer

                        hover:bg-gray-200

                        active:scale-95

                        transition-all
                        duration-200
                    "
                >


                    Next


                </button>


            )}


        </div>

    );
};


export default Customize;