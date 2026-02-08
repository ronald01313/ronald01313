import { useState, useEffect } from "react";
import { Outlet, Link, useNavigate } from "react-router";
import { getCurrentUser, supabase } from "../lib/supabase";
import Footer from "../components/Footer";

export default function Layout() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Initial user load
    getCurrentUser().then(setUser);

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    
    // Load theme from localStorage
    const savedTheme = localStorage.getItem("theme") as "light" | "dark";
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
      }
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    }

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 m-0 p-0 flex flex-col transition-colors duration-500">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-2 no-underline group">
                <div className="w-10 h-10 bg-zinc-900 dark:bg-white rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <img src="/rhd_blog.png" alt="RHD" className="w-7 h-7 object-contain invert dark:invert-0" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-black text-zinc-900 dark:text-white leading-tight tracking-tighter uppercase">
                    RHD <span className="text-blue-600">Strategy</span>
                  </span>
                  <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 tracking-[0.2em] uppercase leading-none">
                    Insight & Analysis
                  </span>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              {/* Theme Toggle - Now accessible to everyone */}
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all duration-300 backdrop-blur-sm border border-zinc-200 dark:border-zinc-700"
                aria-label="Toggle theme"
              >
                {theme === "light" ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </button>

              {/* Hamburger Button (mobile only) */}
              <button
                className="sm:hidden p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:outline-none transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                <svg
                  className="w-6 h-6 text-zinc-800 dark:text-zinc-200"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>

              {/* Desktop Menu */}
              <div className="hidden sm:flex gap-3">
                <NavLinks user={user} navigate={navigate} />
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="flex flex-col gap-3 mt-4 sm:hidden pb-2">
              <NavLinks user={user} navigate={navigate} onClick={() => setIsMenuOpen(false)} />
            </div>
          )}
        </div>
      </nav>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full transition-colors duration-500">
        {/* Page Content */}
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

/* Reusable Nav Links */
function NavLinks({ user, navigate, onClick }: { user?: any; navigate: any; onClick?: () => void }) {
  const linkClass =
    "px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-lg cursor-pointer font-semibold text-sm transition-all duration-300 no-underline block text-center border border-zinc-200 dark:border-zinc-700 shadow-sm";

  return (
    <>
      <Link to="/" className={linkClass} onClick={onClick}>
        Home
      </Link>
      {user ? (
        <>
          <Link to="/create" className={linkClass} onClick={onClick}>
            Create Post
          </Link>
          <Link to="/profile" className={linkClass} onClick={onClick}>
            Profile
          </Link>
          <button
            onClick={async () => {
              const { signOut } = await import("../lib/supabase");
              await signOut();
              if (onClick) onClick();
              navigate("/");
            }}
            className={linkClass}
          >
            Logout
          </button>
        </>
      ) : (
        <Link to="/login" className={linkClass} onClick={onClick}>
          Login
        </Link>
      )}
    </>
  );
}
