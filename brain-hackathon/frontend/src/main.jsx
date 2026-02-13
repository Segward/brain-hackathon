import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"

import Router from "./router.jsx"
import Navbar from "./components/navbar.jsx"
import Footer from "./components/footer.jsx"

import "./index.css"

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1">
          <Router />
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  </StrictMode>,
)
