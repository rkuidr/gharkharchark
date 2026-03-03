import { motion } from "motion/react";
import React from "react";

interface WelcomeScreenProps {
  onLogin: () => void;
  onSignup: () => void;
  onGuest: () => void;
}

export function WelcomeScreen({
  onLogin,
  onSignup,
  onGuest,
}: WelcomeScreenProps) {
  return (
    <div
      className="fixed inset-0 z-40 flex flex-col"
      style={{ background: "#F1F5F9", maxWidth: 430, margin: "0 auto" }}
    >
      {/* Hero top half */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-8 pt-14 pb-8"
        style={{
          background:
            "linear-gradient(160deg, #0F172A 0%, #134E2A 60%, #166534 100%)",
          borderRadius: "0 0 40px 40px",
        }}
      >
        {/* Decorative circle */}
        <div
          className="absolute top-8 right-8 w-32 h-32 rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, #22C55E, transparent)",
          }}
        />

        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.55, ease: [0.34, 1.56, 0.64, 1] }}
          className="w-20 h-20 rounded-2xl overflow-hidden mb-5"
          style={{ boxShadow: "0 8px 32px rgba(34,197,94,0.45)" }}
        >
          <img
            src="/assets/uploads/FamilyExpense-Logo-1.png"
            alt="FamilyExpense"
            className="w-full h-full object-contain"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold text-white tracking-tight">
            FamilyExpense
          </h1>
          <p className="text-green-300 text-sm mt-2 font-medium">
            Ghar ka kharcha, smart tarike se 🏠
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-8 grid grid-cols-3 gap-4 w-full max-w-xs"
        >
          {[
            { emoji: "📊", label: "Track Karo" },
            { emoji: "💡", label: "Samjho" },
            { emoji: "🎯", label: "Bachao" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center gap-1.5"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{ background: "rgba(34,197,94,0.15)" }}
              >
                {item.emoji}
              </div>
              <span className="text-green-200 text-xs font-medium">
                {item.label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bottom actions */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.45 }}
        className="px-6 py-8 space-y-3 bg-white"
        style={{ borderRadius: "24px 24px 0 0" }}
      >
        <button
          type="button"
          data-ocid="welcome.login_button"
          onClick={onLogin}
          className="w-full py-4 rounded-2xl font-bold text-base text-white transition-all active:scale-95"
          style={{
            background: "#22C55E",
            boxShadow: "0 4px 16px rgba(34,197,94,0.4)",
          }}
        >
          Login karo
        </button>

        <button
          type="button"
          data-ocid="welcome.signup_button"
          onClick={onSignup}
          className="w-full py-4 rounded-2xl font-bold text-base border-2 transition-all active:scale-95"
          style={{
            borderColor: "#0F172A",
            color: "#0F172A",
            background: "transparent",
          }}
        >
          Account banao
        </button>

        <div className="text-center pt-2">
          <button
            type="button"
            data-ocid="welcome.guest_link"
            onClick={onGuest}
            className="text-sm text-gray-400 underline-offset-2 hover:text-gray-600 transition-colors"
          >
            Guest ke roop mein continue karein
          </button>
        </div>
      </motion.div>
    </div>
  );
}
