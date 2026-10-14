import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { authApi } from "../../api/authApi";
import {
  Factory,
  ArrowRight,
  Lock,
  Mail,
  AlertCircle,
  ChevronLeft,
  ChevronDown,
} from "lucide-react";

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showDemo, setShowDemo] = useState<boolean>(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await authApi.login(email.trim(), password);
      login(response.access_token, response.user);

      // Redirect directly to role-specific authorized workspace
      const landingPath =
        response.user.role === "ADMIN"
          ? "/admin"
          : response.user.role === "MAINTENANCE_ENGINEER"
          ? "/maintenance-engineer"
          : response.user.role === "PRODUCTION_MANAGER"
          ? "/production-manager"
          : "/plant-manager";
      navigate(landingPath);
    } catch (err: any) {

      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Invalid email or password. Please verify your credentials.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fillPrototypeCreds = (credEmail: string) => {
    setEmail(credEmail);
    setPassword("12345");
  };

  return (
    <div className="h-screen w-screen flex flex-col md:flex-row bg-[#FFFFFF] text-[#1F2933] font-sans selection:bg-[#FFF3C4] overflow-hidden">
      {/* LEFT 50%: Full Background Image + Industrial Editorial Branding */}
      <div className="w-full md:w-[45%] lg:w-1/2 relative h-64 sm:h-80 md:h-full flex flex-col justify-between p-6 sm:p-10 lg:p-14 overflow-hidden shrink-0">
        {/* Full-bleed Textile Background Image */}
        <img
          src="https://images.stockcake.com/public/c/c/7/cc7b2ac6-138b-4b99-a675-9411f07254ac/crafting-with-care-stockcake.jpg"
          alt="FFIS Manufacturing Craft"
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
        />

        {/* Subtle Dark Gradient Overlay (Textile details remain clearly visible) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, rgba(15, 23, 42, 0.08) 0%, rgba(15, 23, 42, 0.18) 40%, rgba(15, 23, 42, 0.68) 100%)",
          }}
        />

        {/* TOP: FFIS Brand Logo & Identity */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#F4B400] flex items-center justify-center text-[#1F2933] shadow-md shadow-[#F4B400]/20 transition-transform group-hover:scale-105">
              <Factory className="w-5 h-5 text-[#1F2933]" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-wider text-[#FFFFFF] font-mono leading-none block">
                FFIS
              </span>
              <span className="text-[11px] text-white/90 uppercase tracking-widest font-mono mt-0.5 block">
                Factory Foresight Intelligence
              </span>
            </div>
          </Link>
        </div>

        {/* BOTTOM: Main Left-Side Product Message */}
        <div className="relative z-10 mt-auto pt-6 space-y-2 sm:space-y-3">
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-[#FFFFFF] tracking-tight leading-[0.98] uppercase"
            style={{
              fontFamily: "'Oswald', 'Archivo Narrow', 'Roboto Condensed', sans-serif",
            }}
          >
            FROM SIGNALS
            <br />
            TO SMARTER <span className="text-[#F4B400]">ACTION.</span>
          </h1>
          <p className="text-sm sm:text-base font-semibold tracking-wider text-[#FFF3C4]">
            Predict. Assess. Act.
          </p>
        </div>
      </div>

      {/* RIGHT 50%: Clean Modern Enterprise Login Panel */}
      <div className="w-full md:w-[55%] lg:w-1/2 relative bg-[#FFFFFF] flex flex-col justify-between p-6 sm:p-10 lg:p-14 overflow-y-auto">
        {/* Subtle Back to Home Link at the top right */}
        <div className="w-full flex justify-end">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#667085] hover:text-[#D99A00] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Vertically Centered Login Container */}
        <div className="my-auto w-full max-w-[420px] mx-auto py-4 space-y-6">
          {/* Header */}
          <div className="text-left space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1F2933] tracking-tight">
              Sign In to FFIS
            </h2>
            <p className="text-xs sm:text-sm text-[#667085] leading-relaxed">
              Enter your enterprise credentials to access real-time factory intelligence.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#1F2933] uppercase tracking-wider mb-2 font-mono">
                EMAIL ADDRESS
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#667085]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@plant.ffis.internal"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FFFDF5] border border-[#E5E7EB] focus:border-[#F4B400] focus:ring-2 focus:ring-[#FFF3C4] rounded-lg text-sm text-[#1F2933] placeholder-[#667085] transition-colors outline-none font-sans"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1F2933] uppercase tracking-wider mb-2 font-mono">
                PASSWORD
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#667085]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FFFDF5] border border-[#E5E7EB] focus:border-[#F4B400] focus:ring-2 focus:ring-[#FFF3C4] rounded-lg text-sm text-[#1F2933] placeholder-[#667085] transition-colors outline-none font-sans"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#F4B400] hover:bg-[#D99A00] text-[#1F2933] font-bold text-sm tracking-wide shadow-md shadow-[#F4B400]/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <span>Authenticating with FFIS...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Compact Expandable Demo Access Section */}
          <div className="pt-2 border-t border-[#E5E7EB]">
            <button
              type="button"
              onClick={() => setShowDemo(!showDemo)}
              className="w-full flex items-center justify-between text-xs font-semibold text-[#667085] hover:text-[#1F2933] py-2 transition-colors cursor-pointer group"
            >
              <span className="flex items-center gap-1.5">
                <span>Demo access</span>
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  showDemo ? "rotate-180 text-[#D99A00]" : ""
                }`}
              />
            </button>

            {showDemo && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 transition-all">
                {[
                  {
                    role: "Plant Manager",
                    email: "manager@gmail.com",
                    pass: "12345",
                  },
                  {
                    role: "Maintenance Engineer",
                    email: "engineer@gmail.com",
                    pass: "12345",
                  },
                  {
                    role: "Production Manager",
                    email: "production@gmail.com",
                    pass: "12345",
                  },
                  {
                    role: "Administrator",
                    email: "admin@gmail.com",
                    pass: "12345",
                  },
                ].map((account) => (
                  <button
                    key={account.email}
                    type="button"
                    onClick={() => fillPrototypeCreds(account.email)}
                    className="p-2.5 rounded-lg bg-[#FFFDF5] hover:bg-[#FFF3C4]/60 border border-[#E5E7EB] hover:border-[#F4B400] text-left transition-all cursor-pointer group"
                  >
                    <div className="text-[11px] font-bold text-[#1F2933] group-hover:text-[#1F2933]">
                      {account.role}
                    </div>
                    <div className="text-[10px] text-[#667085] truncate font-mono">
                      {account.email}
                    </div>
                    <div className="text-[10px] font-mono text-[#667085]/80 mt-0.5">
                      Password: {account.pass}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom subtle branding text */}
        <div className="text-center text-[11px] text-[#667085]/70 py-1">
          &copy; {new Date().getFullYear()} FFIS — Factory Foresight Intelligence System
        </div>
      </div>
    </div>
  );
};

