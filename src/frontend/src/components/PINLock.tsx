import { Delete } from "lucide-react";
import React, { useState } from "react";

interface PINLockProps {
  correctPin: string;
  onUnlock: () => void;
}

export function PINLock({ correctPin, onUnlock }: PINLockProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const handleDigit = (digit: string) => {
    if (pin.length >= 4) return;
    const newPin = pin + digit;
    setPin(newPin);
    setError(false);
    if (newPin.length === 4) {
      setTimeout(() => {
        if (newPin === correctPin) {
          onUnlock();
        } else {
          setError(true);
          setPin("");
        }
      }, 200);
    }
  };

  const handleDelete = () => {
    setPin((p) => p.slice(0, -1));
    setError(false);
  };

  const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"];

  return (
    <div className="fixed inset-0 bg-gk-primary flex flex-col items-center justify-center z-[9999] px-8">
      <img
        src="/assets/generated/gharkharcha-logo.dim_128x128.png"
        alt="FamilyExpense"
        className="w-16 h-16 rounded-2xl mb-4"
      />
      <h1 className="text-white text-2xl font-bold mb-1">FamilyExpense</h1>
      <p className="text-green-300 text-sm mb-8">Enter your PIN to continue</p>

      {/* PIN Dots */}
      <div className="flex gap-4 mb-8">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
              i < pin.length
                ? error
                  ? "bg-gk-danger border-gk-danger"
                  : "bg-gk-accent border-gk-accent"
                : "border-white/40"
            }`}
          />
        ))}
      </div>

      {error && (
        <p className="text-gk-danger text-sm font-semibold mb-4">
          Incorrect PIN. Try again.
        </p>
      )}

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-[280px]">
        {digits.map((d) => {
          const key = d === "" ? "empty" : d === "del" ? "del" : d;
          if (d === "") return <div key={key} />;
          if (d === "del") {
            return (
              <button
                type="button"
                key={key}
                onClick={handleDelete}
                className="h-16 rounded-2xl bg-white/10 flex items-center justify-center text-white active:bg-white/20 transition-colors"
              >
                <Delete size={22} />
              </button>
            );
          }
          return (
            <button
              type="button"
              key={key}
              onClick={() => handleDigit(d)}
              className="h-16 rounded-2xl bg-white/10 text-white text-2xl font-bold active:bg-white/20 transition-colors"
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}
