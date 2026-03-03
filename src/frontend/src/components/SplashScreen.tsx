import { motion } from "motion/react";
import React, { useEffect } from "react";

interface SplashScreenProps {
  onDone: () => void;
}

export function SplashScreen({ onDone }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(onDone, 2200);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{
        background:
          "linear-gradient(160deg, #0F172A 0%, #134E2A 50%, #0F172A 100%)",
      }}
    >
      {/* Decorative circles */}
      <div
        className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, #22C55E, transparent)" }}
      />
      <div
        className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, #22C55E, transparent)" }}
      />

      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
        className="flex flex-col items-center gap-5"
      >
        {/* Logo */}
        <motion.div
          animate={{ scale: [1, 1.06, 1] }}
          transition={{
            duration: 1.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="w-24 h-24 rounded-2xl shadow-2xl overflow-hidden"
          style={{ boxShadow: "0 8px 40px rgba(34,197,94,0.5)" }}
        >
          <img
            src="frontend/public/assets/generated/FamilyExpense Logo.png"
            alt="FamilyExpense"
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* App name */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-center"
        >
          <h1
            className="text-4xl font-bold tracking-tight"
            style={{ color: "#FFFFFF" }}
          >
            FamilyExpense
          </h1>
          <p
            className="text-sm mt-2 font-medium tracking-wide"
            style={{ color: "#86EFAC" }}
          >
            Smart Expense Manager
          </p>
        </motion.div>
      </motion.div>

      {/* Loading dots */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="absolute bottom-16 flex gap-2"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: "#22C55E" }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 1,
              repeat: Number.POSITIVE_INFINITY,
              delay: i * 0.2,
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}
