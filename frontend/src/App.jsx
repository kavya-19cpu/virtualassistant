import React, { useContext } from "react";
import { Route, Routes, Navigate } from "react-router-dom";

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
            <div className="w-full h-screen flex justify-center items-center bg-black text-white text-2xl">
                Loading...
            </div>
        );
    }

    return (
        <Routes>

            <Route
                path="/"
                element={
                    !userData
                        ? <Navigate to="/signin" />
                        : userData.assistantImage && userData.assistantName
                            ? <Home />
                            : <Navigate to="/customize" />
                }
            />

            <Route
                path="/signin"
                element={
                    !userData
                        ? <SignIn />
                        : <Navigate to="/" />
                }
            />

            <Route
                path="/signup"
                element={
                    !userData
                        ? <SignUp />
                        : <Navigate to="/" />
                }
            />

            <Route
                path="/customize"
                element={
                    userData
                        ? <Customize />
                        : <Navigate to="/signup" />
                }
            />

            <Route
                path="/customize2"
                element={
                    userData
                        ? <Customize2 />
                        : <Navigate to="/signup" />
                }
            />

        </Routes>
    );
}

export default App;