import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 m-0 p-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation */}
        <nav className="flex flex-col sm:flex-row justify-between items-center py-5 border-b-2 border-gray-200 mb-8 bg-white/90 rounded-lg px-4 sm:px-6">
          <h1 className="text-2xl sm:text-3xl m-0 text-gray-800 cursor-pointer">
            <a href="/" className="no-underline text-gray-800">
              📝 RHD Blog
            </a>
          </h1>
          <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0">
            <a
              href="/"
              className="px-3 py-2 bg-gray-100 text-gray-800 border-none rounded cursor-pointer font-medium text-sm transition-all duration-300 no-underline block text-center"
            >
              Home
            </a>
            <a
              href="/create"
              className="px-3 py-2 bg-gray-100 text-gray-800 border-none rounded cursor-pointer font-medium text-sm transition-all duration-300 no-underline block text-center"
            >
              Create Post
            </a>
            <a
              href="/manage"
              className="px-3 py-2 bg-gray-100 text-gray-800 border-none rounded cursor-pointer font-medium text-sm transition-all duration-300 no-underline block text-center"
            >
              Manage Posts
            </a>
            <a
              href="/login"
              className="px-3 py-2 bg-gray-100 text-gray-800 border-none rounded cursor-pointer font-medium text-sm transition-all duration-300 no-underline block text-center"
            >
              Login
            </a>
            <a
              href="/register"
              className="px-3 py-2 bg-gray-100 text-gray-800 border-none rounded cursor-pointer font-medium text-sm transition-all duration-300 no-underline block text-center"
            >
              Register
            </a>
          </div>
        </nav>

        {/* Page Content */}
        <Outlet />
      </div>
    </div>
  );
}
