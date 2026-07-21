import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  MoonStar,
  ArrowRight,
} from "lucide-react";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const savedEmail = localStorage.getItem("remember_email");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async () => {
    setErrorMsg("");
    setLoading(true);

    if (rememberMe) {
      localStorage.setItem("remember_email", email);
    } else {
      localStorage.removeItem("remember_email");
    }

    setTimeout(() => {
      setLoading(false);

      const rawUser = localStorage.getItem("tawfiq_registered_user");
      let savedUser = null;

      try {
        savedUser = rawUser ? JSON.parse(rawUser) : null;
      } catch (e) {
        console.error("Error parsing registered user:", e);
      }

      // If no account exists yet, let them log in and auto-save the profile
      if (!savedUser) {
        savedUser = { email: email.trim(), password: password.trim() };
        localStorage.setItem(
          "tawfiq_registered_user",
          JSON.stringify(savedUser),
        );
      }

      if (
        savedUser.email.toLowerCase() === email.trim().toLowerCase() &&
        savedUser.password === password
      ) {
        // Successfully authenticated, now clear old onboarding flag to force onboarding step
        localStorage.removeItem("tawfiq_onboarding_done");

        // Force navigation to onboarding setup wizard
        navigate("/onboarding");
      } else {
        setErrorMsg("Invalid email or password. Please try again.");
      }
    }, 1000);
  };

  const handleGuest = () => {
    navigate("/today");
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden py-12 bg-[length:300%_300%] animate-gradient"
      style={{
        background: "linear-gradient(135deg,#dffcf0,#b7f7d7,#ffffff,#d7fbe8)",
      }}
    >
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700 relative z-10">
        <div className="text-center mb-6">
          <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-r from-green-600 to-emerald-600 flex items-center justify-center shadow-lg">
            <MoonStar size={34} className="text-white" />
          </div>
          <p className="text-green-700 font-bold tracking-[0.25em] mt-3 text-xl">
            Tawfiq
          </p>
          <h1 className="text-4xl font-black mt-3 tracking-tight">
            Welcome Back
          </h1>
          <p className="text-muted-foreground mt-3">
            Pray. Learn. Remember Allah.
          </p>
        </div>

        <div className="rounded-3xl hover:shadow-green-200 border bg-white/70 backdrop-blur-xl border-white/40 shadow-[0_20px_60px_rgba(16,185,129,0.15)] p-8 space-y-8">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium text-center">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="text-sm font-semibold mb-2 block">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                <Mail size={18} className="text-green-700" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full rounded-2xl border border-slate-200 hover:border-green-300 focus:border-green-500 placeholder:text-slate-400 pl-20 pr-4 h-16 outline-none focus:ring-2 focus:ring-green-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold mb-2 block">Password</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                <Lock size={18} className="text-green-700" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-2xl border border-slate-200 hover:border-green-300 focus:border-green-500 placeholder:text-slate-400 pl-20 pr-12 h-16 outline-none focus:ring-2 focus:ring-green-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="accent-green-600"
              />
              <span className="text-sm">Remember Me</span>
            </label>
            <Link
              to="/forgot-password"
              className="text-sm text-green-600 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading || !email.trim() || !password.trim()}
          className="w-full mt-6 rounded-3xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-4 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Signing In...
            </>
          ) : (
            <>
              <LogIn size={18} />
              Login
            </>
          )}
        </button>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            New to Tawfiq?
            <Link
              to="/register"
              className="ml-2 font-semibold text-green-600 hover:underline"
            >
              Create your free account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
