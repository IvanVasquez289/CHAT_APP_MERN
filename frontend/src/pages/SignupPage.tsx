import { useState } from "react";
import type { SignUpData } from "../types";
import { useAuthStore } from "../store/useAuthStore";
import { Mail, MessageSquare, User, EyeOff, Eye, Lock, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import AuthImagePattern from "../components/AuthImagePattern";
import toast from "react-hot-toast";

const SignupPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<SignUpData>({
    fullName: "",
    email: "",
    password: "",
  });

  const { isSigningUp, signup } = useAuthStore();

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(!formData.fullName.trim()) return toast.error("Full name is required")
    if(!emailRegex.test(formData.email)) return toast.error("Invalid email")
    if(!formData.password.trim()) return toast.error("Password is required")
    if(formData.password.length < 6) return toast.error("Password must be at least 6 characters long")

    return true
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const success = validateForm();

    if(success) {
      signup(formData);
    }
  };
  return (
    <div className=" min-h-screen grid lg:grid-cols-2">
      {/* Left side */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          {/*  Logo */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div
                className="size-12 rounded-xl bg-primary/10 flex items-center justify-center 
              group-hover:bg-primary/20 transition-colors"
              >
                <MessageSquare className="size-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mt-2">Create Account</h1>
              <p className="text-base-content/60">
                Get started with your free account
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="form-control space-y-1">
              <label className="label">
                <span className="label-text font-medium">Full Name</span>
              </label>
              <label className="input w-full">
                <User className="size-5 text-base-content/40" />
                <input 
                  type="text"
                  placeholder="John Doe" 
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </label>
            </div>

            <div className="form-control space-y-1">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <label className="input w-full">
                <Mail className="size-5 text-base-content/40" />
                <input 
                  type="email" 
                  placeholder="you@example.com" 
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </label>
            </div>

            <div className="form-control space-y-1">
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>
              <label className="input w-full">
                <Lock className="size-5 text-base-content/40" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={formData.password} 
                  placeholder="********" 
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                />
                {showPassword ? (
                  <Eye
                    className="size-5 text-base-content/40 cursor-pointer"
                    onClick={() => setShowPassword(false)}
                  />
                ) : (
                  <EyeOff
                    className="size-5 text-base-content/40 cursor-pointer"
                    onClick={() => setShowPassword(true)}
                  />
                )}
              </label>
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={isSigningUp}>
                {isSigningUp ? (
                  <>
                    <Loader2 className="size-5 animate-spin"/>
                    <span>Loading...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
            </button>
          </form>

          <div className="text-center">
              <p className="text-base-content/60">
                Already have an account? {" "}
                <Link to={"/login"} className="link link-primary">
                  Sign In
                </Link>
              </p>
          </div>
        </div>
      </div>

      {/* Right side */}
      <AuthImagePattern
        title="Join our community"
        subtitle="Connect with friends, share moments and stay in touch with your loved ones"
      />
    </div>
  );
};

export default SignupPage;
