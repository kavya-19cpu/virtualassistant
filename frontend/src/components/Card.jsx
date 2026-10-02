
import React, { useContext } from "react";
import { userDataContext } from "../context/UserContext";

const Card = ({ image }) => {
    const {
        setBackendImage,
        setFrontendImage,
        selectedImage,
        setSelectedImage
    } = useContext(userDataContext);

    return (
        <div
            className={`
                w-18.75 h-32.5
                sm:w-25 sm:h-42.5
                md:w-30 md:h-50
                lg:w-37.5 lg:h-62.5

                bg-[#020220]
                border-2 border-blue-600
                rounded-2xl
                overflow-hidden
                cursor-pointer
                shrink-0

                hover:shadow-2xl
                hover:shadow-blue-950
                hover:border-4
                hover:border-white

                transition-all duration-200

                ${
                    selectedImage === image
                        ? "border-4 border-white shadow-2xl shadow-blue-950"
                        : ""
                }
            `}
            onClick={() => {
                setSelectedImage(image);
                setBackendImage(null);
                setFrontendImage(null);
            }}
        >
            <img
                src={image}
                alt="Assistant"
                className="w-full h-full object-cover"
            />
        </div>
    );
};

export default Card;
