import React, { useContext, useState } from "react";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { userDataContext } from "../context/UserContext.jsx";


const SignIn = () => {

    const [showPassword, setShowPassword] =
        useState(false);

    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const [err, setErr] =
        useState("");

    const {
        serverUrl,
        setUserData
    } = useContext(userDataContext);

    const navigate = useNavigate();


    const handleSignIn = async e => {

        e.preventDefault();

        setErr("");
        setLoading(true);

        try {

            const result =
                await axios.post(
                    `${serverUrl}/api/auth/signin`,
                    {
                        email:
                            email.trim().toLowerCase(),
                        password
                    },
                    {
                        withCredentials: true
                    }
                );

            setUserData(result.data);

            navigate("/");

        } catch (error) {

            console.error(
                "SIGN IN ERROR:",
                error
            );

            setUserData(null);

            setErr(
                error.response?.data?.message ||
                "Something went wrong"
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

                bg-[#070B14]

                px-4
                py-6

                sm:px-6
                md:px-8
            "
        >

            {/* CYAN GLOW - TOP LEFT */}

            <div
                className="
                    pointer-events-none
                    absolute

                    -left-32
                    -top-32

                    h-80
                    w-80

                    rounded-full

                    bg-cyan-400/10

                    blur-3xl
                "
            />


            {/* CYAN GLOW - BOTTOM RIGHT */}

            <div
                className="
                    pointer-events-none
                    absolute

                    -bottom-32
                    -right-32

                    h-80
                    w-80

                    rounded-full

                    bg-cyan-500/10

                    blur-3xl
                "
            />


            {/* SIGN IN CARD */}

            <form
                onSubmit={handleSignIn}
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
                    border-white/10

                    bg-[#0A1020]

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
                        mb-3

                        text-center

                        text-2xl
                        font-semibold
                        leading-tight

                        text-white

                        sm:text-3xl
                    "
                >

                    Sign In to{" "}

                    <span
                        className="
                            text-cyan-300
                        "
                    >
                        Virtual Assistant
                    </span>

                </h1>


                {/* EMAIL */}

                <input
                    type="email"
                    placeholder="Email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={e =>
                        setEmail(e.target.value)
                    }
                    className="
                        h-13
                        w-full

                        rounded-full

                        border-2
                        border-white/15

                        bg-[#070B14]

                        px-4

                        text-base
                        text-white

                        outline-none

                        transition

                        placeholder:text-gray-400

                        focus:border-cyan-400
                        focus:ring-2
                        focus:ring-cyan-400/20

                        sm:h-14
                        sm:px-5
                        sm:text-lg
                    "
                />


                {/* PASSWORD */}

                <div
                    className="
                        relative

                        h-13
                        w-full

                        rounded-full

                        border-2
                        border-white/15

                        bg-[#070B14]

                        text-white

                        transition

                        focus-within:border-cyan-400
                        focus-within:ring-2
                        focus-within:ring-cyan-400/20

                        sm:h-14
                    "
                >

                    <input
                        type={
                            showPassword
                                ? "text"
                                : "password"
                        }
                        placeholder="Password"
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={e =>
                            setPassword(
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


                    {/* PASSWORD VISIBILITY */}

                    <button
                        type="button"
                        aria-label={
                            showPassword
                                ? "Hide password"
                                : "Show password"
                        }
                        onClick={() =>
                            setShowPassword(
                                prev => !prev
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

                            hover:text-cyan-300

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


                {/* FORGOT / CHANGE PASSWORD */}

                <div
                    className="
                        flex
                        w-full
                        justify-end
                    "
                >

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/change-password"
                            )
                        }
                        className="
                            text-sm

                            text-cyan-300

                            transition

                            hover:text-cyan-200
                            hover:underline

                            sm:text-base
                        "
                    >
                        Forgot / Change Password?
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


                {/* SIGN IN BUTTON */}

                <button
                    type="submit"
                    disabled={loading}
                    className="
                        mt-2

                        h-12

                        min-w-35

                        rounded-full

                        bg-cyan-400

                        px-6

                        text-base
                        font-semibold

                        text-black

                        transition

                        hover:bg-cyan-300

                        active:scale-95

                        disabled:cursor-not-allowed
                        disabled:opacity-60

                        sm:h-14
                        sm:min-w-38
                        sm:text-lg

                        shadow-lg
                        shadow-cyan-950/30
                    "
                >

                    {loading
                        ? "Loading..."
                        : "Sign In"}

                </button>


                {/* SIGN UP */}

                <p
                    className="
                        mt-1

                        text-center

                        text-sm
                        text-gray-300

                        sm:text-base
                    "
                >

                    Want to create a new account?{" "}

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/signup")
                        }
                        className="
                            text-cyan-300

                            transition

                            hover:text-cyan-200
                            hover:underline
                        "
                    >
                        Sign Up
                    </button>

                </p>

            </form>

        </div>
    );
};


export default SignIn;