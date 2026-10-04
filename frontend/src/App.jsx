import React, {
    useContext
} from "react";

import {
    Navigate,
    Route,
    Routes
} from "react-router-dom";

import ChangePassword
    from "./pages/ChangePassword.jsx";

import SignIn
    from "./pages/SignIn.jsx";

import SignUp
    from "./pages/SignUp.jsx";

import Customize
    from "./pages/Customize.jsx";

import Customize2
    from "./pages/Customize2.jsx";

import Home
    from "./pages/Home.jsx";

import {
    userDataContext
} from "./context/UserContext.jsx";


function App() {

    const {
        userData,
        loading
    } = useContext(userDataContext);


    if (loading) {

        return (
            <div className="
                flex
                h-screen
                w-full
                items-center
                justify-center
                bg-black
                text-xl
                text-white
            ">
                Loading...
            </div>
        );
    }


    return (

        <Routes>

            {/* HOME */}

            <Route
                path="/"
                element={
                    !userData ? (
                        <Navigate
                            to="/signin"
                        />
                    ) : userData.assistantImage &&
                      userData.assistantName ? (
                        <Home />
                    ) : (
                        <Navigate
                            to="/customize"
                        />
                    )
                }
            />


            {/* SIGN IN */}

            <Route
                path="/signin"
                element={
                    !userData ? (
                        <SignIn />
                    ) : (
                        <Navigate
                            to="/"
                        />
                    )
                }
            />


            {/* SIGN UP */}

            <Route
                path="/signup"
                element={
                    !userData ? (
                        <SignUp />
                    ) : (
                        <Navigate
                            to="/"
                        />
                    )
                }
            />


            {/* CUSTOMIZE */}

            <Route
                path="/customize"
                element={
                    userData ? (
                        <Customize />
                    ) : (
                        <Navigate
                            to="/signup"
                        />
                    )
                }
            />


            {/* CUSTOMIZE 2 */}

            <Route
                path="/customize2"
                element={
                    userData ? (
                        <Customize2 />
                    ) : (
                        <Navigate
                            to="/signup"
                        />
                    )
                }
            />


            {/* CHANGE PASSWORD */}

            <Route
                path="/change-password"
                element={
                    userData ? (
                        <ChangePassword />
                    ) : (
                        <Navigate
                            to="/signin"
                        />
                    )
                }
            />


        </Routes>

    );
}


export default App;