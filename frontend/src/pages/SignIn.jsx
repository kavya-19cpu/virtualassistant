import React,{useContext,useState} from "react";
import {IoEye,IoEyeOff} from "react-icons/io5";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import bg from "../assets/AuthPg.png";
import {userDataContext} from "../context/UserContext.jsx";

const SignIn=()=>{

    const [showPassword,setShowPassword]=
        useState(false);

    const [email,setEmail]=
        useState("");

    const [password,setPassword]=
        useState("");

    const [loading,setLoading]=
        useState(false);

    const [err,setErr]=
        useState("");

    const {
        serverUrl,
        setUserData
    }=useContext(userDataContext);

    const navigate=useNavigate();

    const handleSignIn=async e=>{
        e.preventDefault();

        setErr("");
        setLoading(true);

        try{

            const result=
                await axios.post(
                    `${serverUrl}/api/auth/signin`,
                    {
                        email:
                            email.trim().toLowerCase(),
                        password
                    },
                    {
                        withCredentials:true
                    }
                );

            setUserData(result.data);

            navigate("/");

        }catch(error){

            console.error(
                "SIGN IN ERROR:",
                error
            );

            setUserData(null);

            setErr(
                error.response?.data?.message||
                "Something went wrong"
            );

        }finally{
            setLoading(false);
        }
    };

    return(
        <div
            className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#05060b] px-4 py-6 sm:px-6 md:px-8"
        >

            <img
                src={bg}
                alt=""
                className="absolute inset-0 w-full h-full object-cover object-center"
            />

            <div className="absolute inset-0 bg-black/25"/>

            <form
                onSubmit={handleSignIn}
                className="relative z-10 flex w-full max-w-lg flex-col items-center justify-center gap-4 rounded-2xl bg-black/40 px-5 py-8 shadow-lg shadow-black/70 backdrop-blur-md sm:gap-5 sm:px-8 sm:py-10 md:px-10"
            >

                <h1 className="mb-3 text-center text-2xl font-semibold leading-tight text-white sm:text-3xl">
                    Sign In to{" "}
                    <span className="text-blue-400">
                        Virtual Assistant
                    </span>
                </h1>

                <input
                    type="email"
                    placeholder="Email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={e=>
                        setEmail(e.target.value)
                    }
                    className="h-13 w-full rounded-full border-2 border-white bg-transparent px-4 text-base text-white outline-none transition placeholder:text-gray-300 focus:border-blue-400 sm:h-14 sm:px-5 sm:text-lg"
                />

                <div className="relative h-13 w-full rounded-full border-2 border-white bg-transparent text-white transition focus-within:border-blue-400 sm:h-14">

                    <input
                        type={
                            showPassword
                                ?"text"
                                :"password"
                        }
                        placeholder="Password"
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={e=>
                            setPassword(
                                e.target.value
                            )
                        }
                        className="h-full w-full rounded-full bg-transparent px-4 pr-14 text-base text-white outline-none placeholder:text-gray-300 sm:px-5 sm:text-lg"
                    />

                    <button
                        type="button"
                        aria-label={
                            showPassword
                                ?"Hide password"
                                :"Show password"
                        }
                        onClick={()=>
                            setShowPassword(
                                prev=>!prev
                            )
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white sm:right-5"
                    >
                        {showPassword?(
                            <IoEyeOff className="h-5 w-5 sm:h-6 sm:w-6"/>
                        ):(
                            <IoEye className="h-5 w-5 sm:h-6 sm:w-6"/>
                        )}
                    </button>

                </div>

                <div className="flex w-full justify-end">

                    <button
                        type="button"
                        onClick={()=>
                            navigate(
                                "/change-password"
                            )
                        }
                        className="text-sm text-blue-400 hover:underline sm:text-base"
                    >
                        Forgot / Change Password?
                    </button>

                </div>

                {err&&(
                    <p className="w-full wrap-break-word text-center text-sm text-red-400 sm:text-base">
                        *{err}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="mt-2 h-12 min-w-35 rounded-full bg-white px-6 text-base font-semibold text-black transition hover:bg-gray-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 sm:h-14 sm:min-w-38 sm:text-lg"
                >
                    {loading
                        ?"Loading..."
                        :"Sign In"}
                </button>

                <p className="mt-1 text-center text-sm text-white sm:text-base">

                    Want to create a new account?{" "}

                    <button
                        type="button"
                        onClick={()=>
                            navigate("/signup")
                        }
                        className="text-blue-400 hover:underline"
                    >
                        Sign Up
                    </button>

                </p>

            </form>

        </div>
    );
};

export default SignIn;