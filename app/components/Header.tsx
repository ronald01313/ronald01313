import { useState, useEffect } from "react";
import { Link } from "react-router";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  compact?: boolean;
}

export default function Header({ 
  title = "My Blog", 
  subtitle = "Thoughts, stories, and ideas",
  compact = false
}: HeaderProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const initialTheme = savedTheme || (document.documentElement.classList.contains("dark") ? "dark" : "light");
    setTheme(initialTheme);
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
    <header className={`relative text-center mb-16 ${compact ? 'py-8' : 'py-20'}`}>
      <div className="absolute left-4 top-4 md:left-8 md:top-8 flex items-center gap-4">
        <Link 
          to="/" 
          className="p-3 rounded-2xl bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all shadow-sm border border-zinc-200 dark:border-zinc-700"
          title="Home"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </Link>
        <Link 
          to="/profile" 
          className="p-3 rounded-2xl bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all shadow-sm border border-zinc-200 dark:border-zinc-700"
          title="Profile"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </Link>
      </div>
      <div className="absolute right-4 top-4 md:right-8 md:top-8">
        <button
          onClick={toggleTheme}
          className="p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all shadow-sm border border-zinc-200 dark:border-zinc-700"
          title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
        >
          {theme === "light" ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
            </svg>
          )}
        </button>
      </div>
      <h1 className={`${compact ? 'text-4xl' : 'text-5xl md:text-7xl'} font-extrabold text-zinc-900 dark:text-white mb-6 tracking-tight`}>
        {title.includes("RHD Blog") ? (
          <>The <span className="text-blue-600">RHD</span> Journal</>
        ) : (
          title
        )}
      </h1>
      <p className={`${compact ? 'text-base' : 'text-xl'} text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto px-4 font-normal leading-relaxed`}>
        {subtitle}
      </p>
    </header>
  );
}
