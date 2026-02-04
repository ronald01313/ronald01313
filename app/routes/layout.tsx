import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { getCurrentUser } from "../lib/supabase";

export default function Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 m-0 p-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation */}
        <nav className="py-5 border-b-2 border-gray-200 mb-8 bg-white/90 rounded-lg px-4 sm:px-6">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <h1 className="text-2xl sm:text-3xl m-0 text-gray-800 cursor-pointer">
              <a href="/" className="no-underline text-gray-800">
                📝 RHD Blog
              </a>
            </h1>

            {/* Hamburger Button (mobile only) */}
            <button
              className="sm:hidden p-2 rounded-md hover:bg-gray-100 focus:outline-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6 text-gray-800"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>

            {/* Desktop Menu */}
            <div className="hidden sm:flex gap-3">
              <NavLinks user={user} />
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="flex flex-col gap-3 mt-4 sm:hidden">
              <NavLinks user={user} onClick={() => setIsMenuOpen(false)} />
            </div>
          )}
        </nav>

        {/* Page Content */}
        <Outlet />
      </div>
    </div>
  );
}

/* Reusable Nav Links */
function NavLinks({ user, onClick }: { user?: any; onClick?: () => void }) {
  const linkClass =
    "px-3 py-2 bg-gray-100 text-gray-800 rounded cursor-pointer font-medium text-sm transition-all duration-300 no-underline block text-center hover:bg-gray-200";

  return (
    <>
      <a href="/" className={linkClass} onClick={onClick}>
        Home
      </a>
      {user && (
        <>
          <a href="/create" className={linkClass} onClick={onClick}>
            Create Post
          </a>
          <a href="/manage" className={linkClass} onClick={onClick}>
            Manage Posts
          </a>
          <a href="/profile" className={linkClass} onClick={onClick}>
            Profile
          </a>
          <button
            onClick={async () => {
              const { signOut } = await import("../lib/supabase");
              await signOut();
              window.location.href = "/";
            }}
            className={linkClass}
          >
            Logout
          </button>
        </>
      )}
      {!user && (
        <>
          <a href="/login" className={linkClass} onClick={onClick}>
            Login
          </a>
          <a href="/register" className={linkClass} onClick={onClick}>
            Register
          </a>
        </>
      )}
    </>
  );
}
