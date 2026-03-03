import {
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Smartphone,
} from "lucide-react";
import { motion } from "motion/react";
import React, { useState } from "react";
import { SiGoogle } from "react-icons/si";
import { useAuth } from "../contexts/AuthContext";

interface LoginScreenProps {
  onBack: () => void;
  onSignup: () => void;
  onPhone: () => void;
  onSuccess: () => void;
}

export function LoginScreen({
  onBack,
  onSignup,
  onPhone,
  onSuccess,
}: LoginScreenProps) {
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForgotModal, setShowForgotModal] = useState(false);

  const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleLogin = async () => {
    setError("");
    if (!email) {
      setError("Email daalna zaroori hai");
      return;
    }
    if (!validateEmail(email)) {
      setError("Sahi email format daalen");
      return;
    }
    if (!password) {
      setError("Password daalna zaroori hai");
      return;
    }
    setIsLoading(true);
    try {
      login(email, password);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setIsGoogleLoading(true);
    try {
      loginWithGoogle();
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google login failed");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "-100%", opacity: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="fixed inset-0 z-40 flex flex-col bg-white overflow-y-auto scrollbar-hide"
      style={{ maxWidth: 430, margin: "0 auto" }}
    >
      {/* Header */}
      <div
        className="px-5 pt-12 pb-8"
        style={{
          background: "linear-gradient(160deg, #0F172A 0%, #134E2A 100%)",
        }}
      >
        <button
          type="button"
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 text-white mb-5 active:scale-90 transition-transform"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-2xl font-bold text-white">Wapas aao! 👋</h1>
        <p className="text-green-300 text-sm mt-1">
          Apne account mein login karein
        </p>
      </div>

      <div className="flex-1 px-5 py-6 space-y-4">
        {/* Error */}
        {error && (
          <div
            data-ocid="login.error_state"
            className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium"
          >
            {error}
          </div>
        )}

        {/* Email */}
        <div>
          <label
            htmlFor="login-email"
            className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5"
          >
            Email ID
          </label>
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border-2 border-transparent focus-within:border-green-500 transition-colors">
            <Mail size={16} className="text-gray-400 shrink-0" />
            <input
              id="login-email"
              data-ocid="login.email_input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="aapka@email.com"
              className="flex-1 bg-transparent outline-none text-gray-800 text-sm"
              autoComplete="email"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="login-password"
            className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5"
          >
            Password
          </label>
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border-2 border-transparent focus-within:border-green-500 transition-colors">
            <Lock size={16} className="text-gray-400 shrink-0" />
            <input
              id="login-password"
              data-ocid="login.password_input"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="••••••••"
              className="flex-1 bg-transparent outline-none text-gray-800 text-sm"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Forgot password */}
        <div className="text-right">
          <button
            type="button"
            data-ocid="login.forgot_password_link"
            onClick={() => setShowForgotModal(true)}
            className="text-sm text-green-600 font-semibold"
          >
            Password bhool gaye?
          </button>
        </div>

        {/* Login button */}
        <button
          type="button"
          data-ocid="login.submit_button"
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full py-4 rounded-2xl font-bold text-base text-white flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-70"
          style={{
            background: "#22C55E",
            boxShadow: "0 4px 16px rgba(34,197,94,0.4)",
          }}
        >
          {isLoading ? <Loader2 size={20} className="animate-spin" /> : null}
          {isLoading ? "Login ho raha hai..." : "Login karo"}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-gray-400 text-xs font-medium">ya phir</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Google */}
        <button
          type="button"
          data-ocid="login.google_button"
          onClick={handleGoogle}
          disabled={isGoogleLoading}
          className="w-full py-3.5 rounded-2xl font-semibold text-sm text-gray-700 flex items-center justify-center gap-3 bg-white border-2 border-gray-200 active:scale-95 transition-all disabled:opacity-70 hover:border-gray-300"
        >
          {isGoogleLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <SiGoogle size={18} className="text-red-500" />
          )}
          Continue with Google
        </button>

        {/* Phone */}
        <button
          type="button"
          data-ocid="login.phone_button"
          onClick={onPhone}
          className="w-full py-3.5 rounded-2xl font-semibold text-sm text-gray-700 flex items-center justify-center gap-3 bg-white border-2 border-gray-200 active:scale-95 transition-all hover:border-gray-300"
        >
          <Smartphone size={18} className="text-blue-500" />
          Phone se login
        </button>

        {/* Signup link */}
        <p className="text-center text-sm text-gray-500 pb-4">
          Account nahi hai?{" "}
          <button
            type="button"
            data-ocid="login.signup_link"
            onClick={onSignup}
            className="text-green-600 font-bold"
          >
            Signup karo
          </button>
        </p>
      </div>

      {/* Forgot password modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-5">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"
          >
            <div className="text-4xl mb-3 text-center">📧</div>
            <h3 className="font-bold text-gray-800 text-lg text-center mb-2">
              Password Reset
            </h3>
            <p className="text-gray-500 text-sm text-center leading-relaxed">
              Password reset ke liye apna registered email check karein. Aapko
              ek reset link bheja jayega.
            </p>
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              className="mt-5 w-full py-3 rounded-xl font-bold text-white"
              style={{ background: "#22C55E" }}
            >
              Theek hai
            </button>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
