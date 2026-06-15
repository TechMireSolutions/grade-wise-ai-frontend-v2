import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore.js";
import { Card, CardHeader, CardContent } from "../components/ui/Card.jsx";
import {
  FaUser,
  FaEnvelope,
  FaShieldAlt,
  FaCheckCircle,
  FaTachometerAlt,
  FaKey,
  FaCrown,
  FaChalkboardTeacher,
  FaGraduationCap,
  FaUserShield,
} from "react-icons/fa";

const ROLE_THEME = {
  super_admin: {
    gradient:     "from-violet-600 via-violet-600 to-indigo-700",
    darkGradient: "dark:from-violet-700 dark:via-violet-700 dark:to-indigo-800",
    badge:        "bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-700",
    label:        "Super Admin",
    Icon:         FaCrown,
  },
  admin: {
    gradient:     "from-rose-500 via-rose-500 to-violet-600",
    darkGradient: "dark:from-rose-600 dark:via-rose-700 dark:to-violet-800",
    badge:        "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-700",
    label:        "Admin",
    Icon:         FaUserShield,
  },
  instructor: {
    gradient:     "from-indigo-500 via-indigo-600 to-violet-600",
    darkGradient: "dark:from-indigo-600 dark:via-indigo-700 dark:to-violet-800",
    badge:        "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700",
    label:        "Instructor",
    Icon:         FaChalkboardTeacher,
  },
  student: {
    gradient:     "from-emerald-500 via-emerald-500 to-indigo-600",
    darkGradient: "dark:from-emerald-600 dark:via-emerald-700 dark:to-indigo-800",
    badge:        "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700",
    label:        "Student",
    Icon:         FaGraduationCap,
  },
};

const DEFAULT_THEME = {
  gradient:     "from-slate-500 to-slate-600",
  darkGradient: "dark:from-slate-600 dark:to-slate-700",
  badge:        "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-700/50 dark:text-slate-300 dark:border-slate-600",
  label:        "User",
  Icon:         FaUser,
};

const DASHBOARD_MAP = {
  super_admin: "/super-admin/dashboard",
  admin:       "/admin/dashboard",
  instructor:  "/instructor/dashboard",
  student:     "/student/dashboard",
};

function Profile() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const theme    = user ? (ROLE_THEME[user.role] ?? DEFAULT_THEME) : DEFAULT_THEME;
  const RoleIcon = theme.Icon;

  const getDashboardLink = () => (user ? (DASHBOARD_MAP[user.role] ?? "/") : "/");

  const handleChangePassword = () => {
    if (user) navigate("/forgot-password");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/20 to-indigo-50/30 dark:from-slate-950 dark:via-violet-950/10 dark:to-slate-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

        {user ? (
          <>
            {/* ── Hero ────────────────────────────────────────── */}
            <div className="mb-8 sm:mb-10">
              <div className={`bg-gradient-to-r ${theme.gradient} ${theme.darkGradient} rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl text-white`}>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1.5 flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                    <RoleIcon className="text-lg" />
                  </span>
                  My Profile
                </h1>
                <p className="text-white/70 text-sm sm:text-base">
                  Manage your account information and settings.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">

              {/* ── Profile card ─────────────────────────────── */}
              <div className="lg:col-span-1">
                <Card className="shadow-2xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden dark:bg-slate-800">

                  {/* Avatar gradient area */}
                  <div className={`bg-gradient-to-br ${theme.gradient} ${theme.darkGradient} p-6 sm:p-8 text-center`}>
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <RoleIcon className="text-4xl text-white" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 leading-tight">
                      {user.name}
                    </h2>
                    <p className="text-white/70 text-sm break-all leading-relaxed">
                      {user.email}
                    </p>
                  </div>

                  <CardContent className="p-6 sm:p-8">
                    <div className="flex flex-col items-center gap-4">

                      {/* Role badge */}
                      <span className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-full border-2 ${theme.badge}`}>
                        <RoleIcon className="text-xs" />
                        {theme.label}
                      </span>

                      {/* Verified indicator */}
                      <div className="w-full pt-4 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl px-4 py-3">
                          <FaCheckCircle className="text-emerald-500 dark:text-emerald-400 text-base flex-shrink-0" />
                          <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                            Email Verified
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* ── Details card ─────────────────────────────── */}
              <div className="lg:col-span-2">
                <Card className="shadow-2xl border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-800">
                  <CardHeader className="bg-gradient-to-r from-slate-50 to-violet-50 dark:from-slate-700/50 dark:to-violet-950/30 border-b-2 border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <FaUser className="text-violet-600 dark:text-violet-400" />
                      Account Information
                    </h3>
                  </CardHeader>

                  <CardContent className="p-6 sm:p-8">
                    <div className="space-y-6">

                      {/* Info fields grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">

                        {/* Full Name */}
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            <span className="flex items-center gap-2">
                              <FaUser className="text-slate-400 dark:text-slate-500 text-xs" />
                              Full Name
                            </span>
                          </label>
                          <div className="bg-slate-50 dark:bg-slate-700/50 px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600">
                            <p className="text-slate-900 dark:text-slate-100 font-semibold">
                              {user.name}
                            </p>
                          </div>
                        </div>

                        {/* Email */}
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            <span className="flex items-center gap-2">
                              <FaEnvelope className="text-slate-400 dark:text-slate-500 text-xs" />
                              Email Address
                            </span>
                          </label>
                          <div className="bg-slate-50 dark:bg-slate-700/50 px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 break-all">
                            <p className="text-slate-900 dark:text-slate-100 font-semibold text-sm">
                              {user.email}
                            </p>
                          </div>
                        </div>

                        {/* Role */}
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            <span className="flex items-center gap-2">
                              <FaShieldAlt className="text-slate-400 dark:text-slate-500 text-xs" />
                              Role
                            </span>
                          </label>
                          <div className="bg-slate-50 dark:bg-slate-700/50 px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full border ${theme.badge}`}>
                              <RoleIcon className="text-xs" />
                              {theme.label}
                            </span>
                          </div>
                        </div>

                        {/* Account Status */}
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            <span className="flex items-center gap-2">
                              <FaCheckCircle className="text-slate-400 dark:text-slate-500 text-xs" />
                              Account Status
                            </span>
                          </label>
                          <div className="bg-slate-50 dark:bg-slate-700/50 px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse flex-shrink-0" />
                              Active
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* ── Quick Actions ─────────────────────── */}
                      <div className="pt-6 border-t-2 border-slate-200 dark:border-slate-700">
                        <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                          <FaTachometerAlt className="text-violet-600 dark:text-violet-400" />
                          Quick Actions
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <Link
                            to={getDashboardLink()}
                            className={`flex items-center justify-center gap-2 bg-gradient-to-r ${theme.gradient} ${theme.darkGradient} text-white px-6 py-3 rounded-xl font-bold shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 min-h-[44px]`}
                          >
                            <FaTachometerAlt />
                            <span>Go to Dashboard</span>
                          </Link>
                          <button
                            onClick={handleChangePassword}
                            className="flex items-center justify-center gap-2 bg-white dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-6 py-3 rounded-xl font-bold shadow-md hover:shadow-lg hover:bg-slate-50 dark:hover:bg-slate-600 hover:border-slate-400 dark:hover:border-slate-500 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 min-h-[44px] cursor-pointer"
                          >
                            <FaKey />
                            <span>Change Password</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  </CardContent>
                </Card>
              </div>

            </div>
          </>
        ) : (
          /* ── Access Denied ──────────────────────────────────── */
          <Card className="shadow-2xl border-2 border-slate-200 dark:border-slate-700 max-w-2xl mx-auto dark:bg-slate-800">
            <CardContent className="text-center py-16 sm:py-20 px-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mx-auto mb-6">
                <FaShieldAlt className="text-4xl sm:text-5xl text-rose-600 dark:text-rose-400" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                Access Denied
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-8 text-sm sm:text-base">
                Please log in to view your profile.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-700 to-indigo-700 dark:from-violet-700 dark:to-indigo-800 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 min-h-[44px]"
              >
                <FaUser />
                <span>Go to Login</span>
              </Link>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}

export default Profile;
