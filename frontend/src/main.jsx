import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import App from "./App.jsx"
import "./index.css"
import UserContext from "./context/UserContext.jsx"

ReactDOM.createRoot(
    document.getElementById("root")
).render(
    <React.StrictMode>
        <BrowserRouter>
            <UserContext>
                <App />
            </UserContext>
        </BrowserRouter>
    </React.StrictMode>
)