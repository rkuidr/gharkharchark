import {
  ArrowLeft,
  Eye,
  EyeOff,
  IndianRupee,
  Loader2,
  Lock,
  Mail,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

interface SignupScreenProps {
  onBack: () => void;
  onLogin: () => void;
  onSuccess: () => void;
}

export function SignupScreen({
  onBack,
  onLogin,
  onSuccess,
}: SignupScreenProps) {
  const { signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [budget, setBudget] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleSignup = async () => {
    setError("");
    if (!name.trim()) {
      setError("Apna naam daalen");
      return;
    }
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
    if (password.length < 6) {
      setError("Password kam se kam 6 characters ka hona chahiye");
      return;
    }
    if (password !== confirmPassword) {
      setError("Dono passwords match nahi karte");
      return;
    }

    const monthlyBudget = budget ? Number.parseFloat(budget) : 20000;
    if (budget && (Number.isNaN(monthlyBudget) || monthlyBudget < 0)) {
      setError("Sahi budget amount daalen");
      return;
    }

    setIsLoading(true);
    try {
      signup(name, email, password, monthlyBudget);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setIsLoading(false);
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
        <h1 className="text-2xl font-bold text-white">Account banao ✨</h1>
        <p className="text-green-300 text-sm mt-1">
          Apna ghar ka kharcha track karna shuru karein
        </p>
      </div>

      <div className="flex-1 px-5 py-6 space-y-4 pb-10">
        {/* Error */}
        {error && (
          <div
            data-ocid="signup.error_state"
            className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium"
          >
            {error}
          </div>
        )}

        {/* Full Name */}
        <div>
          <label
            htmlFor="signup-name"
            className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5"
          >
            Poora Naam *
          </label>
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border-2 border-transparent focus-within:border-green-500 transition-colors">
            <User size={16} className="text-gray-400 shrink-0" />
            <input
              id="signup-name"
              data-ocid="signup.name_input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Rahul Sharma"
              className="flex-1 bg-transparent outline-none text-gray-800 text-sm"
              autoComplete="name"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="signup-email"
            className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5"
          >
            Email ID *
          </label>
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border-2 border-transparent focus-within:border-green-500 transition-colors">
            <Mail size={16} className="text-gray-400 shrink-0" />
            <input
              id="signup-email"
              data-ocid="signup.email_input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="aapka@email.com"
              className="flex-1 bg-transparent outline-none text-gray-800 text-sm"
              autoComplete="email"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="signup-password"
            className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5"
          >
            Password *{" "}
            <span className="normal-case text-gray-400">
              (min 6 characters)
            </span>
          </label>
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border-2 border-transparent focus-within:border-green-500 transition-colors">
            <Lock size={16} className="text-gray-400 shrink-0" />
            <input
              id="signup-password"
              data-ocid="signup.password_input"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="flex-1 bg-transparent outline-none text-gray-800 text-sm"
              autoComplete="new-password"
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

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="signup-confirm-password"
            className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5"
          >
            Password Confirm Karein *
          </label>
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border-2 border-transparent focus-within:border-green-500 transition-colors">
            <Lock size={16} className="text-gray-400 shrink-0" />
            <input
              id="signup-confirm-password"
              data-ocid="signup.confirm_password_input"
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="flex-1 bg-transparent outline-none text-gray-800 text-sm"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Monthly Budget */}
        <div>
          <label
            htmlFor="signup-budget"
            className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5"
          >
            Monthly Budget{" "}
            <span className="normal-case text-gray-400">(optional)</span>
          </label>
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border-2 border-transparent focus-within:border-green-500 transition-colors">
            <IndianRupee size={16} className="text-gray-400 shrink-0" />
            <input
              id="signup-budget"
              data-ocid="signup.budget_input"
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="20000"
              className="flex-1 bg-transparent outline-none text-gray-800 text-sm"
            />
          </div>
        </div>

        {/* Signup button */}
        <button
          type="button"
          data-ocid="signup.submit_button"
          onClick={handleSignup}
          disabled={isLoading}
          className="w-full py-4 rounded-2xl font-bold text-base text-white flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-70 mt-2"
          style={{
            background: "#22C55E",
            boxShadow: "0 4px 16px rgba(34,197,94,0.4)",
          }}
        >
          {isLoading ? <Loader2 size={20} className="animate-spin" /> : null}
          {isLoading ? "Account ban raha hai..." : "Account banao"}
        </button>

        {/* Login link */}
        <p className="text-center text-sm text-gray-500 pb-4">
          Pehle se account hai?{" "}
          <button
            type="button"
            data-ocid="signup.login_link"
            onClick={onLogin}
            className="text-green-600 font-bold"
          >
            Login karo
          </button>
        </p>
      </div>
    </motion.div>
  );
}
