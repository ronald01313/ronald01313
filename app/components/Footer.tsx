import { Link } from "react-router";

export default function Footer() {
  return (
    <footer className="mt-12 py-12 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter">
              RHD <span className="text-blue-600">Strategy</span>
            </div>
            <div className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">
              © 2026 RHD strategy. All Rights Reserved.
            </div>
          </div>
          <div className="flex gap-8">
            <Link to="/" className="text-zinc-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 font-semibold text-sm transition-colors">Home</Link>
            <Link to="/profile" className="text-zinc-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 font-semibold text-sm transition-colors">Profile</Link>
            <Link to="#" className="text-zinc-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 font-semibold text-sm transition-colors">Privacy</Link>
            <Link to="#" className="text-zinc-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 font-semibold text-sm transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
