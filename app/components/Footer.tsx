import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-12 py-8 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-gray-500 dark:text-gray-400 text-sm font-medium">
            © 2026 RHD strategy. All Rights Reserved.
          </div>
          <div className="flex gap-6">
            <Link to="/" className="text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Home</Link>
            <Link to="/profile" className="text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Profile</Link>
            <Link to="#" className="text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Privacy</Link>
            <Link to="#" className="text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
