
import React,{useState,useContext} from "react";
import {IoEye,IoEyeOff} from "react-icons/io5";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import {userDataContext} from "../context/UserContext.jsx";


const SignUp=()=>{


    const [showPassword,setShowPassword]=
        useState(false);


    const [name,setName]=
        useState("");


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


    const handleSignUp=async e=>{
        e.preventDefault();


        setErr("");


        const nameRegex=
            /^[A-Za-z]+(?: [A-Za-z]+)*$/;


        if(!nameRegex.test(name.trim())){
            setErr(
                "Name should contain letters and spaces only"
            );
            return;
        }


        setLoading(true);


        try{


            const result=
                await axios.post(
                    `${serverUrl}/api/auth/SignUp`,
                    {
                        name:name.trim(),
                        email:
                            email.trim().toLowerCase(),
                        password
                    },
                    {
                        withCredentials:true
                    }
                );


            setUserData(result.data);


            navigate("/customize");


        }catch(error){


            console.error(
                "SIGN UP ERROR:",
                error.response?.data||
                error.message
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
                    border-[#243247]
                    bg-[#0A1220]
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
                    <span className="text-blue-400">
                        Virtual Assistant
                    </span>
                </h1>


                <input
                    type="text"
                    placeholder="Enter your Name"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={e=>
                        setName(e.target.value)
                    }
                    pattern="[A-Za-z]+(?: [A-Za-z]+)*"
                    title="Name should contain letters and spaces only"
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
                        sm:text-[17px]
                        md:h-15
                        md:text-[18px]
                    "
                />


                <input
                    type="email"
                    placeholder="Email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={e=>
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
                        sm:text-[17px]
                        md:h-15
                        md:text-[18px]
                    "
                />


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
                        md:h-15
                    "
                >


                    <input
                        type={
                            showPassword
                                ?"text"
                                :"password"
                        }
                        placeholder="Password"
                        autoComplete="new-password"
                        required
                        value={password}
                        onChange={e=>
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
                        {showPassword?(
                            <IoEyeOff
                                className="
                                    h-5
                                    w-5
                                    sm:h-6
                                    sm:w-6
                                "
                            />
                        ):(
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


                {err&&(
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


                <button
                    type="submit"
                    disabled={loading}
                    className="
                        mt-3
                        h-12
                        min-w-35
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
                        sm:mt-5
                        sm:h-14
                        sm:min-w-37.5
                        sm:text-[18px]
                        md:h-15
                        md:text-[19px]
                    "
                >
                    {loading
                        ?"Loading..."
                        :"Sign Up"}
                </button>


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
                        onClick={()=>
                            navigate("/signin")
                        }
                        className="
                            text-blue-400
                            transition
                            hover:text-blue-300
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