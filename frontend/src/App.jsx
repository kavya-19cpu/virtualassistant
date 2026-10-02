import React, { useContext } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import ChangePassword from "./pages/ChangePassword";
import SignIn from "./pages/SignIn.jsx";
import SignUp from "./pages/SignUp.jsx";
import Customize from "./pages/Customize.jsx";
import Customize2 from "./pages/Customize2.jsx";
import Home from "./pages/Home.jsx";

import { userDataContext } from "./context/UserContext.jsx";

function App() {
    const { userData, loading } = useContext(userDataContext);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-black text-2xl text-white">
                Loading...
            </div>
        );
    }

    return (
        <Routes>
            {/* Home */}
            <Route
                path="/"
                element={
                    !userData ? (
                        <Navigate to="/signin" />
                    ) : userData.assistantImage && userData.assistantName ? (
                        <Home />
                    ) : (
                        <Navigate to="/customize" />
                    )
                }
            />

            {/* Sign In */}
            <Route
                path="/signin"
                element={
                    !userData ? (
                        <SignIn />
                    ) : (
                        <Navigate to="/" />
                    )
                }
            />

            {/* Sign Up */}
            <Route
                path="/signup"
                element={
                    !userData ? (
                        <SignUp />
                    ) : (
                        <Navigate to="/" />
                    )
                }
            />

            {/* Customize */}
            <Route
                path="/customize"
                element={
                    userData ? (
                        <Customize />
                    ) : (
                        <Navigate to="/signup" />
                    )
                }
            />

            {/* Customize 2 */}
            <Route
                path="/customize2"
                element={
                    userData ? (
                        <Customize2 />
                    ) : (
                        <Navigate to="/signup" />
                    )
                }
            />

            {/* Change Password */}
            <Route
                path="/change-password"
                element={<ChangePassword />}
            />
        </Routes>
    );
}

export default App;