import React, { useState, useContext } from 'react';
import bg from "../assets/AuthPg.png"
import { IoEye } from "react-icons/io5";
import { IoEyeOff } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import { userDataContext } from "../context/UserContext.jsx";
import axios from "axios";
const SignUp = () => {
    const [showPassword, setShowPassword] = useState(false)
    const { serverUrl, userData, setUserData } = useContext(userDataContext)
    const navigate = useNavigate()
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)

    const [password, setPassword] = useState("")
    const [err, setErr] = useState("")
    const handleSignUp = async (e) => {
        e.preventDefault()
        setErr("")
        setLoading(true)
        try {
            let result = await axios.post(
                `${serverUrl}/api/auth/SignUp`,
                { name, email, password },
                { withCredentials: true }
            )

            console.log(result.data)

            setUserData(result.data)
            navigate("/customize")
            setLoading(false)


        } catch (error) {
            console.log("STATUS:", error.response?.status)
            console.log("BACKEND RESPONSE:", error.response?.data)

            setUserData(null)
            setLoading(false)
            setErr(error.response?.data?.message || "Something went wrong")
        }
    }

    return (
        <div className='w-full h-screen bg-cover flex justify-center items-center' style={{ backgroundImage: `url(${bg})` }}>

            <form className="w-[90%] h-150 max-w-125 bg-[#00000062] backdrop-blur shadow-lg shadow-black flex flex-col items-center justify-center gap-5 px-5" onSubmit={handleSignUp}>

                <h1 className='text-white text-[30px] font-semibold mb-7.5'>Register to<span className='text-blue-400'>Virtual Assistant</span> </h1>

                <input type="text" placeholder='Enter your Name' className='w-full h-15 outline-none border-2 border-white bg-transparent text-white placeholder-gray-300 px-5 py-2.5 rounded-full text-4.5' required onChange={(e) => setName(e.target.value)} value={name} />

                <input type="email" placeholder='Email' className='w-full h-15 outline-none border-2 border-white bg-transparent text-white placeholder-gray-300 px-5 py-2.5 rounded-full text-4.5' required onChange={(e) => setEmail(e.target.value)} value={email} />



                <div className='w-full h-15 border-2 border-white bg-transparent text-white rounded-full text-4.5 relative'>

                    <input type={showPassword ? "text" : "password"} placeholder='password' autoComplete="new-password"
                        className='w-full h-full outline-none  bg-transparent placeholder-gray-300 px-5 py-2.5' required onChange={(e) => setPassword(e.target.value)} value={password} />
                    {!showPassword && <IoEye className='absolute top-4.5 right-5 w-6.25 text-[white] cursor-pointer' onClick={() => setShowPassword(true)} />}
                    {showPassword && <IoEyeOff className='absolute top-4.5 right-5 w-6.25 text-[white] cursor-pointer' onClick={() => setShowPassword(false)} />}




                </div>
                {err.length > 0 && <p className='text-red-500 text-4.25'>
                    *{err}
                </p>}
                <button className='min-w-37.5 h-15 mt-7.5  text-black font-semibold bg-white rounded-full text-4.75' disabled={loading}>{loading ? "Loading..." : "Sign Up"}</button>

                <p className='text-white text-4.5 cursor-pointer' onClick={() => navigate("/signin")}>Already have an account? <span className='text-blue-400 '>Sign In</span></p>
            </form>
        </div>
    )
}

export default SignUp
