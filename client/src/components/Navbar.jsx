import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-blue-950 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* Logo */}
        <Link
          to="/"
          className="font-bold text-lg px-2 py-1 hover:bg-white/10 rounded"
        >
          TravelTales
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="hover:bg-white/10 px-2 py-1 rounded">Home</Link>
          <Link to="/create" className="hover:bg-white/10 px-2 py-1 rounded">Create</Link>
          {user && (
            <Link to="/dashboard" className="hover:bg-white/10 px-2 py-1 rounded">
              Dashboard
            </Link>
          )}
        </div>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <div className="flex items-center gap-2 bg-white/10 px-2 py-1 rounded">
                <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-semibold">
                  {user.name ? user.name[0] : "U"}
                </div>
                <div className="text-sm leading-none">
                  <div>{user.name}</div>
                  <div className="text-xs text-white/80">{user.email}</div>
                </div>
              </div>
              <button
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                className="px-3 py-1 bg-white text-sky-600 rounded hover:bg-white/90"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-3 py-1 bg-white text-sky-500 rounded">
                Login
              </Link>
              <Link to="/register" className="px-3 py-1 border border-white rounded">
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-2xl focus:outline-none"
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-blue-900 px-4 pb-4 space-y-3">
          <Link onClick={() => setOpen(false)} to="/" className="block">
            Home
          </Link>
          <Link onClick={() => setOpen(false)} to="/create" className="block">
            Create
          </Link>
          {user && (
            <Link onClick={() => setOpen(false)} to="/dashboard" className="block">
              Dashboard
            </Link>
          )}

          <hr className="border-white/20" />

          {user ? (
            <>
              <div className="text-sm">
                <div>{user.name}</div>
                <div className="text-xs text-white/80">{user.email}</div>
              </div>
              <button
                onClick={() => {
                  logout();
                  setOpen(false);
                  navigate("/login");
                }}
                className="w-full bg-white text-sky-600 py-1 rounded"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                onClick={() => setOpen(false)}
                to="/login"
                className="block bg-white text-sky-600 py-1 rounded text-center"
              >
                Login
              </Link>
              <Link
                onClick={() => setOpen(false)}
                to="/register"
                className="block border border-white py-1 rounded text-center"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
