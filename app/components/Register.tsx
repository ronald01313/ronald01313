import { useState } from "react";
import { signUp } from "../lib/supabase";

export function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    const result = await signUp(formData.email, formData.password, formData.username);
    setIsLoading(false);

    if (result.success) {
      setSuccess(result.message);
      setFormData({ username: "", email: "", password: "", confirmPassword: "" });
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-8 border border-gray-200 rounded-lg">
      <h2 className="text-center mb-8 text-gray-800">Register</h2>

      {error && (
        <div className="p-3 mb-5 bg-red-50 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 mb-5 bg-green-50 text-green-700 rounded">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-5">
          <label className="block mb-2 text-gray-800 font-medium">
            Username
          </label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded text-base box-border text-gray-800"
            placeholder="johndoe"
          />
        </div>

        <div className="mb-5">
          <label className="block mb-2 text-gray-800 font-medium">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded text-base box-border text-gray-800"
            placeholder="your@email.com"
          />
        </div>

        <div className="mb-5">
          <label className="block mb-2 text-gray-800 font-medium">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded text-base box-border text-gray-800"
            placeholder="••••••••"
          />
        </div>

        <div className="mb-5">
          <label className="block mb-2 text-gray-800 font-medium">
            Confirm Password
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded text-base box-border text-gray-800"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full p-3 bg-purple-500 text-white border-none rounded text-base font-medium cursor-pointer disabled:cursor-not-allowed disabled:bg-gray-400 mt-3 transition-all duration-300"
        >
          {isLoading ? "Registering..." : "Register"}
        </button>
      </form>

      <p className="text-center mt-5 text-gray-600">
        Already have an account? <a href="/login" className="text-gray-800 no-underline font-medium">Login here</a>
      </p>
    </div>
  );
}
