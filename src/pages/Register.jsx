import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  Chrome,
  MoonStar,
  User,
} from "lucide-react";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (password !== confirmPassword) return;
    setLoading(true);

    // Simulate saving user details locally for authentication validation on Login.jsx
    setTimeout(() => {
      setLoading(false);
      const userData = { name, email, password };
      localStorage.setItem("tawfiq_registered_user", JSON.stringify(userData));

      // Redirect to login page after successful registration
      navigate("/login");
    }, 1200);
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden py-12 bg-[length:300%_300%] animate-gradient"
      style={{
        background: "linear-gradient(135deg,#dffcf0,#b7f7d7,#ffffff,#d7fbe8)",
      }}
    >
      {/* Background Animated Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-green-300/30 animate-float"
            style={{
              width: `${8 + Math.random() * 8}px`,
              height: `${8 + Math.random() * 8}px`,
              left: `${10 + Math.random() * 80}%`,
              animationDuration: `${8 + Math.random() * 8}s`,
              animationDelay: `${Math.random() * 5}s`,
              bottom: "-20px",
            }}
          />
        ))}
        <div className="absolute w-72 h-72 rounded-full bg-green-200/20 blur-3xl -top-20 -left-20 animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute w-80 h-80 rounded-full bg-emerald-200/15 blur-3xl bottom-0 right-0 animate-[pulse_8s_ease-in-out_infinite]" />
      </div>

      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700 relative z-10">
        {/* Hero */}
        <div className="text-center mb-6">
          <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-r from-green-600 to-emerald-600 flex items-center justify-center shadow-lg">
            <MoonStar size={34} className="text-white" />
          </div>
          <p className="text-green-700 font-bold tracking-[0.25em] mt-3 text-xl">
            Tawfiq
          </p>
          <h1 className="text-4xl font-black mt-3 tracking-tight">
            Create Account
          </h1>
          <p className="text-muted-foreground mt-3">
            Begin your Islamic journey today.
          </p>
        </div>

        {/* Register Card */}
        <div className="rounded-3xl hover:shadow-green-200 border bg-white/70 backdrop-blur-xl border-white/40 shadow-[0_20px_60px_rgba(16,185,129,0.15)] p-8 space-y-6">
          {/* Name */}
          <div>
            <label className="text-sm font-semibold mb-2 block">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                <User size={18} className="text-green-700" />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full rounded-2xl border border-slate-200 hover:border-green-300 focus:border-green-500 placeholder:text-slate-400 pl-20 pr-4 h-14 outline-none focus:ring-2 focus:ring-green-500 transition-all"
              />
            </div>
          </div>

          {/* Email */}
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
                className="w-full rounded-2xl border border-slate-200 hover:border-green-300 focus:border-green-500 placeholder:text-slate-400 pl-20 pr-4 h-14 outline-none focus:ring-2 focus:ring-green-500 transition-all"
              />
            </div>
          </div>

          {/* Password */}
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
                placeholder="Create a password"
                className="w-full rounded-2xl border border-slate-200 hover:border-green-300 focus:border-green-500 placeholder:text-slate-400 pl-20 pr-12 h-14 outline-none focus:ring-2 focus:ring-green-500 transition-all"
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

          {/* Confirm Password */}
          <div>
            <label className="text-sm font-semibold mb-2 block">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                <Lock size={18} className="text-green-700" />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className="w-full rounded-2xl border border-slate-200 hover:border-green-300 focus:border-green-500 placeholder:text-slate-400 pl-20 pr-12 h-14 outline-none focus:ring-2 focus:ring-green-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {password && confirmPassword && password !== confirmPassword && (
              <p className="mt-2 text-sm text-red-500">
                Passwords do not match.
              </p>
            )}
          </div>
        </div>

        {/* Register Button */}
        <button
          onClick={handleRegister}
          disabled={
            loading ||
            !name.trim() ||
            !email.trim() ||
            !password.trim() ||
            password !== confirmPassword
          }
          className="w-full mt-6 rounded-3xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-4 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Creating Account...
            </>
          ) : (
            <>
              <UserPlus size={18} />
              Sign Up
            </>
          )}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-green-200" />
          <span className="text-xs uppercase tracking-widest text-slate-400">
            or sign up with
          </span>
          <div className="flex-1 h-px bg-green-200" />
        </div>

        {/* Google Sign Up */}
        <button className="w-full rounded-3xl bg-white/70 backdrop-blur-xl border border-white/40 shadow-sm hover:shadow-lg hover:border-green-300 transition-all duration-300 py-4 flex items-center justify-center gap-3 hover:-translate-y-1">
          <Chrome size={20} className="text-slate-700" />
          <span className="font-semibold text-slate-700">
            Sign Up with Google
          </span>
        </button>

        {/* Login Link */}
        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            Already have an account?
            <Link
              to="/login"
              className="ml-2 font-semibold text-green-700 hover:underline"
            >
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
