import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { signIn } from "../lib/supabase";

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    const result = await signIn(email, password);
    setIsLoading(false);

    if (result.success) {
      setSuccess(result.message);
      setEmail("");
      setPassword("");
      setTimeout(() => {
        navigate("/profile");
      }, 1500);
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-8 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-xl transition-all duration-300">
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 mx-auto mb-4">
          <img src="/rhd_blog.png" alt="RHD" className="w-10 h-10 object-contain" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Welcome Back</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Enter your credentials to access your account</p>
      </div>

      {error && (
        <div className="p-4 mb-6 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl text-sm font-medium border border-red-100 dark:border-red-900/30 flex items-center gap-2">
          <span>⚠️</span> {error}
        </div>
      )}

      {success && (
        <div className="p-4 mb-6 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-xl text-sm font-medium border border-green-100 dark:border-green-900/30 flex items-center gap-2">
          <span>✅</span> {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 bg-gray-50 dark:bg-gray-800 border border-transparent focus:border-blue-500 dark:focus:border-blue-500 rounded-xl text-gray-900 dark:text-white outline-none transition-all"
            placeholder="your@email.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-4 bg-gray-50 dark:bg-gray-800 border border-transparent focus:border-blue-500 dark:focus:border-blue-500 rounded-xl text-gray-900 dark:text-white outline-none transition-all"
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full p-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all duration-300 ${
            isLoading 
              ? "bg-gray-400 cursor-not-allowed" 
              : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-200/50 dark:shadow-none"
          }`}
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div className="text-center mt-8">
        <p className="text-gray-600 dark:text-gray-400">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-600 dark:text-blue-400 font-bold hover:underline transition-all">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
