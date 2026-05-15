import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore.js";
import { Card, CardHeader, CardContent } from "../components/ui/Card.jsx";
import LoadingSpinner from "../components/ui/LoadingSpinner.jsx";
import Modal from "../components/ui/Modal.jsx";
import axios from "axios";
import { getCaptchaToken } from "../config/captcha.js";
import { FaLock, FaSignInAlt, FaUserShield, FaArrowLeft } from "react-icons/fa";
import { redirectByRole } from "../utils/redirectByRole.js";
import useRecaptchaInit from "../hooks/useRecaptchaInit.js";
import { ZodError } from "zod";
import { loginSchema } from "../scheema/authSchemas.js";

function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, type: "info", title: "", message: "" });

  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
  useRecaptchaInit(siteKey);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const showModal = (type, title, message) => {
    setModal({ isOpen: true, type, title, message });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      loginSchema.parse(formData);
      const captchaToken = await getCaptchaToken(siteKey, "login");
      
      const response = await login({ ...formData, captchaToken });
      
      // RESTRICTIVE ROLE CHECK
      const allowedRoles = ["admin", "super_admin"];
      if (!allowedRoles.includes(response.role)) {
        // Clear tokens if role is unauthorized
        useAuthStore.getState().logout();
        showModal("error", "Access Denied", "Unauthorized: This portal is strictly for Administrators only.");
        return;
      }

      const token = useAuthStore.getState().token;
      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      
      showModal("success", "Admin Access Granted", `Welcome back, Administrator ${response.name}!`);

      setTimeout(() => {
        redirectByRole(response.role, navigate);
      }, 1500);
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors = {};
        error.errors.forEach((err) => { 
          fieldErrors[err.path[0]] = err.message;
        });
        setErrors(fieldErrors);
      } else {
        const errorMessage = error.response?.data?.message || "Login failed. Please try again.";
        showModal("error", "Login Failed", errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="w-full max-w-md z-10">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors group"
        >
          <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home Page</span>
        </Link>

        <Card className="shadow-2xl border-0 bg-slate-800 text-white rounded-3xl overflow-hidden ring-1 ring-slate-700">
          <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-700 p-8">
            <div className="text-center">
              <div className="bg-blue-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl rotate-3 transform hover:rotate-0 transition-transform duration-300">
                <FaUserShield className="text-4xl text-white" />
              </div>
              <h2 className="text-3xl font-black tracking-tight mb-2">Admin Portal</h2>
              <p className="text-slate-400 font-medium">Secure Administrative Access</p>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2 ml-1">
                  Admin Email
                </label>
                <div className="relative group">
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-5 py-4 bg-slate-900/50 border-2 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-4 transition-all duration-300 ${
                      errors.email 
                        ? "border-red-500 focus:ring-red-500/20" 
                        : "border-slate-700 focus:border-blue-500 focus:ring-blue-500/20"
                    }`}
                    placeholder="admin@gradewise.ai"
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-xs text-red-400 font-bold ml-1 uppercase tracking-wider italic">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2 ml-1">
                  Secure Password
                </label>
                <div className="relative group">
                  <input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-5 py-4 bg-slate-900/50 border-2 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-4 transition-all duration-300 ${
                      errors.password 
                        ? "border-red-500 focus:ring-red-500/20" 
                        : "border-slate-700 focus:border-blue-500 focus:ring-blue-500/20"
                    }`}
                    placeholder="••••••••••••"
                  />
                </div>
                {errors.password && (
                  <p className="mt-2 text-xs text-red-400 font-bold ml-1 uppercase tracking-wider italic">
                    {errors.password}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-4 border-0 rounded-2xl shadow-xl text-lg font-black text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-600/50 disabled:opacity-50 transition-all duration-300 transform active:scale-95"
              >
                {loading ? (
                  <LoadingSpinner size="sm" color="white" type="dots" />
                ) : (
                  <>
                    <FaSignInAlt />
                    <span>Authorize Access</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-700 text-center">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                System Security Level: High
              </p>
            </div>
          </CardContent>
        </Card>
        
        <p className="mt-8 text-center text-slate-500 text-sm font-medium">
          Gradewise AI Management Systems &copy; 2026
        </p>
      </div>

      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        type={modal.type}
        title={modal.title}
      >
        <div className="text-slate-200">{modal.message}</div>
      </Modal>
    </div>
  );
}

export default AdminLogin;
