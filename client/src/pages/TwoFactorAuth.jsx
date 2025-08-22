import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";

const NUM_DIGITS = 6;

function isDigit(char) {
  return /^[0-9]$/.test(char);
}

function VerifyCodePage({ 
  onSubmit,
  onResend,
  initialSeconds = 60,
  title = "Nhập mã xác thực",
  subtitle = "Chúng tôi đã gửi mã 6 số đến email của bạn.",
}) {
  const [values, setValues] = useState(Array(NUM_DIGITS).fill(""));
  const [error, setError] = useState("");
  const [seconds, setSeconds] = useState(initialSeconds);
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef([]);

  const code = useMemo(() => values.join(""), [values]);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [seconds]);

  useEffect(() => {
    inputsRef.current?.[0]?.focus();
  }, []);

  const handleChange = (idx, e) => {
    setError("");
    const raw = e.target.value;

    if (raw.length > 1) {
      const digits = raw.replace(/\D/g, "").slice(0, NUM_DIGITS);
      if (!digits) return;
      const next = Array(NUM_DIGITS)
        .fill("")
        .map((_, i) => digits[i] ?? values[i]);
      setValues(next);
      const lastIndex = Math.min(digits.length - 1, NUM_DIGITS - 1);
      inputsRef.current?.[lastIndex]?.focus();
      return;
    }

    if (raw === "") {
      setValues((prev) => prev.map((v, i) => (i === idx ? "" : v)));
      return;
    }
    if (!isDigit(raw)) return;

    setValues((prev) => {
      const next = [...prev];
      next[idx] = raw;
      return next;
    });

    if (idx < NUM_DIGITS - 1) {
      inputsRef.current?.[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === "Backspace") {
      if (values[idx] === "") {
        if (idx > 0) inputsRef.current?.[idx - 1]?.focus();
      } else {
        setValues((prev) => prev.map((v, i) => (i === idx ? "" : v)));
      }
    }
    if (e.key === "ArrowLeft" && idx > 0) {
      inputsRef.current?.[idx - 1]?.focus();
    }
    if (e.key === "ArrowRight" && idx < NUM_DIGITS - 1) {
      inputsRef.current?.[idx + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const text = e.clipboardData.getData("text");
    const digits = text.replace(/\D/g, "").slice(0, NUM_DIGITS);
    if (!digits) return;
    e.preventDefault();
    const next = Array(NUM_DIGITS)
      .fill("")
      .map((_, i) => digits[i] ?? "");
    setValues(next);
    inputsRef.current?.[Math.min(digits.length - 1, NUM_DIGITS - 1)]?.focus();
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (code.length !== NUM_DIGITS) {
      setError("Bạn cần nhập đủ 6 số.");
      return;
    }

    try {
      setLoading(true);
      if (onSubmit) await onSubmit(code);
      else alert(`Code submitted: ${code}`);
    } catch (err) {
      setError(err?.message || "Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    if (seconds > 0) return;
    try {
      setLoading(true);
      if (onResend) await onResend();
      setSeconds(initialSeconds);
    } catch (err) {
      setError(err?.message || "Không gửi lại được mã. Thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-base-200 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md"
      >
        <div className="bg-base-100 border border-base-300 rounded-2xl shadow-xl p-6 sm:p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-semibold text-base-content tracking-tight">
              {title}
            </h1>
            <p className="text-base-content/80 mt-2 text-sm sm:text-base">{subtitle}</p>
          </div>

          <form onSubmit={submit} className="space-y-6" onPaste={handlePaste}>
            <div className="grid grid-cols-6 gap-2 sm:gap-3">
              {Array.from({ length: NUM_DIGITS }).map((_, i) => (
                <label key={i} className="sr-only" htmlFor={`otp-${i}`}>
                  Số {i + 1}
                </label>
              ))}
              {Array.from({ length: NUM_DIGITS }).map((_, i) => (
                <input
                  key={`input-${i}`}
                  id={`otp-${i}`}
                  ref={(el) => (inputsRef.current[i] = el)}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={values[i]}
                  onChange={(e) => handleChange(i, e)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className={[
                    "h-12 sm:h-14 text-center text-lg sm:text-2xl font-semibold",
                    "rounded-2xl border bg-base-200 focus:bg-base-100",
                    "border-base-300 focus:border-primary focus:ring-2 focus:ring-primary/50",
                    "shadow-sm outline-none text-base-content",
                  ].join(" ")}
                />
              ))}
            </div>

            {error && (
              <p className="text-rose-400 text-sm -mt-2" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={code.length !== NUM_DIGITS || loading}
              className="w-full h-12 rounded-2xl bg-primary disabled:bg-primary/50 text-primary-content font-medium shadow hover:bg-primary/80 transition"
            >
              {loading ? "Đang xử lý..." : "Xác nhận"}
            </button>

            <div className="flex items-center justify-between text-sm text-base-content/80">
              <span>Không nhận được mã?</span>
              <button
                type="button"
                onClick={resend}
                disabled={seconds > 0 || loading}
                className="underline disabled:no-underline disabled:text-base-content/50"
                aria-disabled={seconds > 0}
              >
                {seconds > 0 ? `Gửi lại sau ${seconds}s` : "Gửi lại mã"}
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-base-content/60 text-xs mt-4">
          Tip: Dán toàn bộ mã (Ctrl/Cmd + V) vào một ô bất kỳ để tự điền.
        </p>
      </motion.div>
    </div>
  );
}

const TwoFactorAuth = () => {
    const { emailFor2fa, verifyTwoFactorAuth, resendTwoFactorCode } = useAuthStore();
    const { theme } = useThemeStore();

    const handleSubmit = async (code) => {
        await verifyTwoFactorAuth({ email: emailFor2fa, code });
    };

    const handleResend = async () => {
        await resendTwoFactorCode({ email: emailFor2fa });
    };

    return <div data-theme={theme}><VerifyCodePage onSubmit={handleSubmit} onResend={handleResend} /></div>;
};

export default TwoFactorAuth;
