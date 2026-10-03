import React, { useState, useContext } from "react";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { userDataContext } from "../context/UserContext.jsx";

const SignUp = () => {

    const [showPassword, setShowPassword] =
        useState(false);

    const [name, setName] =
        useState("");

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


    const handleSignUp = async e => {

        e.preventDefault();

        setErr("");

        const nameRegex =
            /^[A-Za-z]+(?: [A-Za-z]+)*$/;

        if (!nameRegex.test(name.trim())) {

            setErr(
                "Name should contain letters and spaces only"
            );

            return;
        }

        setLoading(true);

        try {

            const result =
                await axios.post(
                    `${serverUrl}/api/auth/SignUp`,
                    {
                        name: name.trim(),
                        email:
                            email.trim().toLowerCase(),
                        password
                    },
                    {
                        withCredentials: true
                    }
                );

            setUserData(result.data);

            navigate("/customize");

        } catch (error) {

            console.error(
                "SIGN UP ERROR:",
                error.response?.data ||
                error.message
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


            {/* SIGN UP CARD */}

            <form
                onSubmit={handleSignUp}
                className="
                    relative
                    z-10

                    flex

                    min-h-140
                    w-full
                    max-w-125

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

                    sm:min-h-150
                    sm:gap-5
                    sm:px-8
                    sm:py-10

                    md:min-h-155
                    md:px-10
                "
            >

                {/* HEADING */}

                <h1
                    className="
                        mb-4

                        text-center

                        text-2xl
                        font-semibold
                        leading-tight

                        text-white

                        sm:mb-6
                        sm:text-[28px]

                        md:text-[30px]
                    "
                >

                    Register to{" "}

                    <span
                        className="
                            text-cyan-300
                        "
                    >
                        Virtual Assistant
                    </span>

                </h1>


                {/* NAME */}

                <input
                    type="text"
                    placeholder="Enter your Name"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={e =>
                        setName(e.target.value)
                    }
                    pattern="[A-Za-z]+(?: [A-Za-z]+)*"
                    title="Name should contain letters and spaces only"
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
                        sm:text-[17px]

                        md:h-15
                        md:text-[18px]
                    "
                />


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
                        sm:text-[17px]

                        md:h-15
                        md:text-[18px]
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
                        md:h-15
                    "
                >

                    <input
                        type={
                            showPassword
                                ? "text"
                                : "password"
                        }
                        placeholder="Password"
                        autoComplete="new-password"
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
                            sm:text-[17px]

                            md:text-[18px]
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


                {/* SIGN UP BUTTON */}

                <button
                    type="submit"
                    disabled={loading}
                    className="
                        mt-3

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

                        sm:mt-5
                        sm:h-14
                        sm:min-w-37.5
                        sm:text-[18px]

                        md:h-15
                        md:text-[19px]

                        shadow-lg
                        shadow-cyan-950/30
                    "
                >

                    {loading
                        ? "Loading..."
                        : "Sign Up"}

                </button>


                {/* SIGN IN */}

                <p
                    className="
                        mt-2

                        text-center

                        text-sm
                        text-gray-300

                        sm:text-base

                        md:text-[18px]
                    "
                >

                    Already have an account?{" "}

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/signin")
                        }
                        className="
                            text-cyan-300

                            transition

                            hover:text-cyan-200
                            hover:underline
                        "
                    >
                        Sign In
                    </button>

                </p>

            </form>

        </div>
    );
};

export default SignUp;