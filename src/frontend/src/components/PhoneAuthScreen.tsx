import { ArrowLeft, Loader2, Smartphone } from "lucide-react";
import { motion } from "motion/react";
import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

interface PhoneAuthScreenProps {
  onBack: () => void;
  onSuccess: () => void;
}

export function PhoneAuthScreen({ onBack, onSuccess }: PhoneAuthScreenProps) {
  const { loginWithPhone } = useAuth();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const handleSendOtp = () => {
    setError("");
    if (!phone || phone.length !== 10 || !/^\d{10}$/.test(phone)) {
      setError("10 digit ka valid Indian mobile number daalen");
      return;
    }
    setOtpSent(true);
    setStep("otp");
  };

  const handleVerify = async () => {
    setError("");
    if (!otp || otp.length !== 6) {
      setError("6 digit ka OTP daalen");
      return;
    }
    setIsLoading(true);
    try {
      loginWithPhone(phone, otp);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = () => {
    setOtp("");
    setError("");
    setOtpSent(false);
    setTimeout(() => setOtpSent(true), 500);
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
          onClick={
            step === "otp"
              ? () => {
                  setStep("phone");
                  setOtp("");
                  setError("");
                }
              : onBack
          }
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 text-white mb-5 active:scale-90 transition-transform"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(34,197,94,0.2)" }}
          >
            <Smartphone size={20} className="text-green-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {step === "phone" ? "Phone se Login" : "OTP Verify Karein"}
            </h1>
            <p className="text-green-300 text-sm mt-0.5">
              {step === "phone"
                ? "Apna mobile number daalen"
                : `OTP bheja gaya: +91 ${phone}`}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-5 py-6 space-y-5">
        {/* Error */}
        {error && (
          <div
            data-ocid="phone.error_state"
            className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium"
          >
            {error}
          </div>
        )}

        {step === "phone" ? (
          <>
            <div>
              <label
                htmlFor="phone-number"
                className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5"
              >
                Mobile Number
              </label>
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border-2 border-transparent focus-within:border-green-500 transition-colors">
                <span className="text-gray-600 font-semibold text-sm shrink-0">
                  +91
                </span>
                <div className="w-px h-5 bg-gray-300" />
                <input
                  id="phone-number"
                  data-ocid="phone.number_input"
                  type="tel"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                  placeholder="9876543210"
                  className="flex-1 bg-transparent outline-none text-gray-800 text-sm tracking-widest font-semibold"
                  autoComplete="tel"
                  maxLength={10}
                />
              </div>
              <p className="text-gray-400 text-xs mt-1.5">
                10 digit Indian mobile number
              </p>
            </div>

            <button
              type="button"
              data-ocid="phone.send_otp_button"
              onClick={handleSendOtp}
              className="w-full py-4 rounded-2xl font-bold text-base text-white flex items-center justify-center gap-2 active:scale-95 transition-all"
              style={{
                background: "#22C55E",
                boxShadow: "0 4px 16px rgba(34,197,94,0.4)",
              }}
            >
              OTP Bhejo 📱
            </button>
          </>
        ) : (
          <>
            {/* Demo hint */}
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-sm">
              <span className="font-bold">Demo mode:</span> OTP hai{" "}
              <span className="font-bold tracking-widest">123456</span>
            </div>

            <div>
              <label
                htmlFor="phone-otp"
                className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5"
              >
                6-digit OTP
              </label>
              <input
                id="phone-otp"
                data-ocid="phone.otp_input"
                type="tel"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                placeholder="123456"
                maxLength={6}
                className="w-full bg-gray-50 rounded-xl px-4 py-4 text-center text-3xl font-bold tracking-[0.5em] border-2 border-transparent focus:border-green-500 outline-none transition-colors text-gray-800"
                autoComplete="one-time-code"
              />
            </div>

            <button
              type="button"
              data-ocid="phone.verify_button"
              onClick={handleVerify}
              disabled={isLoading}
              className="w-full py-4 rounded-2xl font-bold text-base text-white flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-70"
              style={{
                background: "#22C55E",
                boxShadow: "0 4px 16px rgba(34,197,94,0.4)",
              }}
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : null}
              {isLoading ? "Verify ho raha hai..." : "Verify karo ✓"}
            </button>

            <p className="text-center text-sm text-gray-500">
              OTP nahi mila?{" "}
              <button
                type="button"
                data-ocid="phone.resend_link"
                onClick={handleResendOtp}
                className="text-green-600 font-bold"
              >
                OTP dubara bhejo
              </button>
            </p>

            {otpSent && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm text-center"
              >
                ✅ OTP bheja gaya (Demo: 123456)
              </motion.div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
