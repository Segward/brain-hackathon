import { Link } from "react-router-dom";
import { useState } from "react";

function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div className="bg-white w-screen gap-16 md:gap-48 flex items-center justify-center h-[10vh]">
        <Link to="/" className="flex items-center gap-8">
          <div className="icon hover:scale-110" />
          <span className="text-lg md:text-xl hover:scale-110">Autonomipartiet</span>
        </Link>
        <li className="hidden sm:flex items-center justify-center gap-16 text-md md:text-lg">
          <Link to="/program" className="hover:scale-110">Programmet vårt</Link>
        </li>
        <button className="flex sm:hidden hamburger" onClick={() => setOpen(v => !v)}/>
      </div>
      { open && 
        <div className="flex sm:hidden flex-col items-start gap-4 bg-white h-screen w-[200px] fixed right-0 top-[10vh] p-4">
          <li className="flex w-full flex-col items-center gap-8 text-md">
            <Link to="/program" className="hover:scale-110">Programmet vårt</Link>
          </li>
        </div>
      }
    </div>
  )
}

export default Navbar;
