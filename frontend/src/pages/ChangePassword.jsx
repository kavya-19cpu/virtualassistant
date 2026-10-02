import React, { useContext, useState } from "react";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import bg from "../assets/AuthPg.png";
import { userDataContext } from "../context/UserContext.jsx";

const ChangePassword = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [err, setErr] = useState("");

    const { serverUrl } = useContext(userDataContext);
    const navigate = useNavigate();

    const handleChangePassword = async (e) => {
        e.preventDefault();

        setErr("");
        setMessage("");

        if (!name.trim() || !email.trim() || !newPassword) {
            setErr("Please fill in all fields");
            return;
        }

        if (newPassword.length < 6) {
            setErr("Password must be at least 6 characters");
            return;
        }

        setLoading(true);

        try {
            const result = await axios.post(
                `${serverUrl}/api/auth/change-password`,
                {
                    name: name.trim(),
                    email: email.trim().toLowerCase(),
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
            console.error("CHANGE PASSWORD ERROR:", error);

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
            className="flex min-h-screen w-full items-center justify-center bg-cover bg-center bg-no-repeat px-4 py-6 sm:px-6 md:px-8"
            style={{ backgroundImage: `url(${bg})` }}
        >
            <form
                onSubmit={handleChangePassword}
                className="flex w-full max-w-lg flex-col items-center justify-center gap-4 rounded-2xl bg-black/40 px-5 py-8 shadow-lg shadow-black/70 backdrop-blur-md sm:gap-5 sm:px-8 sm:py-10 md:px-10"
            >
                <h1 className="mb-2 text-center text-2xl font-semibold leading-tight text-white sm:text-3xl">
                    Change Password
                </h1>

                <p className="mb-2 text-center text-sm text-gray-300 sm:text-base">
                    Enter your name and email to change your password.
                </p>

                <input
                    type="text"
                    placeholder="Name"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-13 w-full rounded-full border-2 border-white bg-transparent px-4 text-base text-white outline-none transition placeholder:text-gray-300 focus:border-blue-400 sm:h-14 sm:px-5 sm:text-lg"
                />

                <input
                    type="email"
                    placeholder="Email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-13 w-full rounded-full border-2 border-white bg-transparent px-4 text-base text-white outline-none transition placeholder:text-gray-300 focus:border-blue-400 sm:h-14 sm:px-5 sm:text-lg"
                />

                <div className="relative h-13 w-full rounded-full border-2 border-white bg-transparent text-white transition focus-within:border-blue-400 sm:h-14">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="New Password"
                        autoComplete="new-password"
                        required
                        minLength={6}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="h-full w-full rounded-full bg-transparent px-4 pr-14 text-base text-white outline-none placeholder:text-gray-300 sm:px-5 sm:text-lg"
                    />

                    <button
                        type="button"
                        aria-label={
                            showPassword
                                ? "Hide password"
                                : "Show password"
                        }
                        onClick={() =>
                            setShowPassword((prev) => !prev)
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white sm:right-5"
                    >
                        {showPassword ? (
                            <IoEyeOff className="h-5 w-5 sm:h-6 sm:w-6" />
                        ) : (
                            <IoEye className="h-5 w-5 sm:h-6 sm:w-6" />
                        )}
                    </button>
                </div>

                {err && (
                    <p className="w-full wrap-break-word text-center text-sm text-red-400 sm:text-base">
                        *{err}
                    </p>
                )}

                {message && (
                    <p className="w-full wrap-break-word text-center text-sm text-green-400 sm:text-base">
                        {message}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="mt-2 h-12 min-w-40 rounded-full bg-white px-6 text-base font-semibold text-black transition hover:bg-gray-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 sm:h-14 sm:min-w-44 sm:text-lg"
                >
                    {loading ? "Changing..." : "Change Password"}
                </button>

                <button
                    type="button"
                    onClick={() => navigate("/signin")}
                    className="text-sm text-blue-400 hover:underline sm:text-base"
                >
                    Back to Sign In
                </button>
            </form>
        </div>
    );
};

export default ChangePassword;