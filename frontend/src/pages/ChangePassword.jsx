import React, { useContext, useState } from "react";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { userDataContext } from "../context/UserContext.jsx";


const ChangePassword = () => {

    const [showPassword, setShowPassword] =
        useState(false);

    const [name, setName] =
        useState("");

    const [email, setEmail] =
        useState("");

    const [newPassword, setNewPassword] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const [message, setMessage] =
        useState("");

    const [err, setErr] =
        useState("");


    const {
        serverUrl
    } = useContext(userDataContext);


    const navigate = useNavigate();


    const handleChangePassword = async (e) => {

        e.preventDefault();

        setErr("");
        setMessage("");


        if (
            !name.trim() ||
            !email.trim() ||
            !newPassword
        ) {
            setErr(
                "Please fill in all fields"
            );
            return;
        }


        if (newPassword.length < 6) {
            setErr(
                "Password must be at least 6 characters"
            );
            return;
        }


        setLoading(true);


        try {

            const result =
                await axios.post(
                    `${serverUrl}/api/auth/change-password`,
                    {
                        name: name.trim(),
                        email:
                            email
                                .trim()
                                .toLowerCase(),
                        newPassword
                    }
                );


            setMessage(
                result.data?.message ||
                "Password changed successfully"
            );


            setName("");
            setEmail("");
            setNewPassword("");


            setTimeout(() => {
                navigate("/signin");
            }, 1500);


        } catch (error) {

            console.error(
                "CHANGE PASSWORD ERROR:",
                error
            );


            setErr(
                error.response?.data?.message ||
                "Unable to change password"
            );


        } finally {

            setLoading(false);

        }
    };


    return (

        <div
            className="
                relative
                flex
                min-h-screen
                w-full
                items-center
                justify-center
                overflow-hidden
                bg-[#050B14]
                px-4
                py-6
                sm:px-6
                md:px-8
            "
        >

            {/* Subtle blue glow */}

            <div
                className="
                    pointer-events-none
                    absolute
                    -left-32
                    -top-32
                    h-80
                    w-80
                    rounded-full
                    bg-blue-600/10
                    blur-3xl
                "
            />


            <div
                className="
                    pointer-events-none
                    absolute
                    -bottom-32
                    -right-32
                    h-80
                    w-80
                    rounded-full
                    bg-blue-500/10
                    blur-3xl
                "
            />


            <form
                onSubmit={handleChangePassword}
                className="
                    relative
                    z-10
                    flex
                    w-full
                    max-w-lg
                    flex-col
                    items-center
                    justify-center
                    gap-4
                    rounded-2xl
                    border
                    border-[#243247]
                    bg-[#0A1220]
                    px-5
                    py-8
                    shadow-2xl
                    shadow-black/50
                    sm:gap-5
                    sm:px-8
                    sm:py-10
                    md:px-10
                "
            >

                {/* HEADING */}

                <h1
                    className="
                        mb-2
                        text-center
                        text-2xl
                        font-semibold
                        leading-tight
                        text-white
                        sm:text-3xl
                    "
                >
                    Change Password
                </h1>


                {/* DESCRIPTION */}

                <p
                    className="
                        mb-2
                        text-center
                        text-sm
                        text-gray-400
                        sm:text-base
                    "
                >
                    Enter your name and email to change
                    your password.
                </p>


                {/* NAME */}

                <input
                    type="text"
                    placeholder="Name"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(e) =>
                        setName(e.target.value)
                    }
                    className="
                        h-13
                        w-full
                        rounded-full
                        border-2
                        border-[#334155]
                        bg-[#050B14]
                        px-4
                        text-base
                        text-white
                        outline-none
                        transition
                        placeholder:text-gray-400
                        focus:border-blue-500
                        focus:ring-2
                        focus:ring-blue-500/20
                        sm:h-14
                        sm:px-5
                        sm:text-lg
                    "
                />


                {/* EMAIL */}

                <input
                    type="email"
                    placeholder="Email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) =>
                        setEmail(e.target.value)
                    }
                    className="
                        h-13
                        w-full
                        rounded-full
                        border-2
                        border-[#334155]
                        bg-[#050B14]
                        px-4
                        text-base
                        text-white
                        outline-none
                        transition
                        placeholder:text-gray-400
                        focus:border-blue-500
                        focus:ring-2
                        focus:ring-blue-500/20
                        sm:h-14
                        sm:px-5
                        sm:text-lg
                    "
                />


                {/* NEW PASSWORD */}

                <div
                    className="
                        relative
                        h-13
                        w-full
                        rounded-full
                        border-2
                        border-[#334155]
                        bg-[#050B14]
                        text-white
                        transition
                        focus-within:border-blue-500
                        focus-within:ring-2
                        focus-within:ring-blue-500/20
                        sm:h-14
                    "
                >

                    <input
                        type={
                            showPassword
                                ? "text"
                                : "password"
                        }
                        placeholder="New Password"
                        autoComplete="new-password"
                        required
                        minLength={6}
                        value={newPassword}
                        onChange={(e) =>
                            setNewPassword(
                                e.target.value
                            )
                        }
                        className="
                            h-full
                            w-full
                            rounded-full
                            bg-transparent
                            px-4
                            pr-14
                            text-base
                            text-white
                            outline-none
                            placeholder:text-gray-400
                            sm:px-5
                            sm:text-lg
                        "
                    />


                    <button
                        type="button"
                        aria-label={
                            showPassword
                                ? "Hide password"
                                : "Show password"
                        }
                        onClick={() =>
                            setShowPassword(
                                (prev) => !prev
                            )
                        }
                        className="
                            absolute
                            right-4
                            top-1/2
                            -translate-y-1/2
                            cursor-pointer
                            text-gray-300
                            transition
                            hover:text-blue-400
                            sm:right-5
                        "
                    >

                        {showPassword ? (

                            <IoEyeOff
                                className="
                                    h-5
                                    w-5
                                    sm:h-6
                                    sm:w-6
                                "
                            />

                        ) : (

                            <IoEye
                                className="
                                    h-5
                                    w-5
                                    sm:h-6
                                    sm:w-6
                                "
                            />

                        )}

                    </button>

                </div>


                {/* ERROR */}

                {err && (

                    <p
                        className="
                            w-full
                            wrap-break-word
                            text-center
                            text-sm
                            text-red-400
                            sm:text-base
                        "
                    >
                        *{err}
                    </p>

                )}


                {/* SUCCESS MESSAGE */}

                {message && (

                    <p
                        className="
                            w-full
                            wrap-break-word
                            text-center
                            text-sm
                            text-green-400
                            sm:text-base
                        "
                    >
                        {message}
                    </p>

                )}


                {/* CHANGE PASSWORD BUTTON */}

                <button
                    type="submit"
                    disabled={loading}
                    className="
                        mt-2
                        h-12
                        min-w-40
                        rounded-full
                        bg-blue-500
                        px-6
                        text-base
                        font-semibold
                        text-white
                        transition
                        hover:bg-blue-400
                        active:scale-95
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                        sm:h-14
                        sm:min-w-44
                        sm:text-lg
                    "
                >
                    {loading
                        ? "Changing..."
                        : "Change Password"}
                </button>


                {/* BACK TO SIGN IN */}

                <button
                    type="button"
                    onClick={() =>
                        navigate("/signin")
                    }
                    className="
                        text-sm
                        text-blue-400
                        transition
                        hover:text-blue-300
                        hover:underline
                        sm:text-base
                    "
                >
                    Back to Sign In
                </button>

            </form>

        </div>

    );
};


export default ChangePassword;