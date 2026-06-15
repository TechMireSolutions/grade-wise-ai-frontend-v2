import { Link } from "react-router-dom"
import useAuthStore from "../store/authStore.js"
import { Card, CardContent } from "../components/ui/Card.jsx"
import {
  FaRocket,
  FaChartLine,
  FaUsers,
  FaShieldAlt,
  FaArrowRight,
  FaStar,
  FaCheckCircle,
  FaBolt,
  FaTachometerAlt,
  FaUserCircle,
  FaCrown,
  FaUserShield,
  FaChalkboardTeacher,
  FaGraduationCap,
  FaBook,
} from "react-icons/fa"

const ROLE_LABELS = {
  super_admin: "Super Admin",
  admin:       "Admin",
  instructor:  "Instructor",
  student:     "Student",
}

const ROLE_ICON_MAP = {
  super_admin: FaCrown,
  admin:       FaUserShield,
  instructor:  FaChalkboardTeacher,
  student:     FaGraduationCap,
}

const DASHBOARD_MAP = {
  super_admin: "/super-admin/dashboard",
  admin:       "/admin/dashboard",
  instructor:  "/instructor/dashboard",
  student:     "/student/dashboard",
}

const FEATURES = [
  {
    Icon:        FaBolt,
    title:       "AI-Powered Grading",
    description: "Intelligent automated grading system that understands context and provides detailed feedback.",
    iconBg:      "from-violet-500 to-indigo-500",
    bgColor:     "bg-violet-50 dark:bg-violet-950/30",
    borderColor: "border-violet-200 dark:border-violet-800",
  },
  {
    Icon:        FaChartLine,
    title:       "Analytics Dashboard",
    description: "Comprehensive insights into student performance and learning patterns.",
    iconBg:      "from-indigo-500 to-violet-600",
    bgColor:     "bg-indigo-50 dark:bg-indigo-950/30",
    borderColor: "border-indigo-200 dark:border-indigo-800",
  },
  {
    Icon:        FaUsers,
    title:       "Multi-Role Support",
    description: "Seamless experience for administrators, instructors, and students.",
    iconBg:      "from-emerald-500 to-indigo-500",
    bgColor:     "bg-emerald-50 dark:bg-emerald-950/30",
    borderColor: "border-emerald-200 dark:border-emerald-800",
  },
  {
    Icon:        FaShieldAlt,
    title:       "Secure & Reliable",
    description: "Enterprise-grade security with role-based access control.",
    iconBg:      "from-rose-500 to-violet-600",
    bgColor:     "bg-rose-50 dark:bg-rose-950/30",
    borderColor: "border-rose-200 dark:border-rose-800",
  },
]

const BENEFITS = [
  "Save 10+ hours per week on grading",
  "Instant feedback for students",
  "Detailed analytics and insights",
  "Easy to use interface",
]

function Home() {
  const { user } = useAuthStore()

  const UserIcon    = user ? (ROLE_ICON_MAP[user.role] ?? FaUserCircle) : FaUserCircle
  const dashboardLink = user ? (DASHBOARD_MAP[user.role] ?? "/") : "/login"

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/20 to-indigo-50/30 dark:from-slate-950 dark:via-violet-950/10 dark:to-slate-950 overflow-hidden transition-colors duration-200">

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden">

        {/* Animated blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-violet-400 dark:bg-violet-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 animate-blob" />
          <div className="absolute top-40 right-10 w-72 h-72 bg-indigo-400 dark:bg-indigo-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
          <div className="absolute -bottom-20 left-40 w-72 h-72 bg-violet-400 dark:bg-violet-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
        </div>

        {/* Floating decorative icons */}
        <div className="absolute top-10 sm:top-20 right-4 sm:right-10 opacity-10 dark:opacity-5 animate-float pointer-events-none">
          <FaGraduationCap className="text-6xl sm:text-8xl lg:text-9xl text-violet-400 dark:text-violet-600" />
        </div>
        <div className="absolute bottom-10 sm:bottom-20 left-4 sm:left-10 opacity-10 dark:opacity-5 animate-float animation-delay-2000 pointer-events-none">
          <FaBook className="text-6xl sm:text-8xl lg:text-9xl text-indigo-400 dark:text-indigo-600" />
        </div>

        <div className="relative w-full mx-auto px-3 sm:px-4 lg:px-7 py-11 sm:py-12 lg:py-16">
          <div className="text-center">

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-slate-900 dark:text-slate-100 mb-4 sm:mb-6 leading-tight px-2">
              Welcome to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 animate-gradient">
                Gradewise AI
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-600 dark:text-slate-400 mb-6 sm:mb-8 lg:mb-10 max-w-4xl mx-auto leading-relaxed px-4">
              Your intelligent grading assistant that revolutionizes the way educators assess and provide feedback to
              students with{" "}
              <span className="font-bold text-violet-600 dark:text-violet-400">AI-powered precision</span>.
            </p>

            {/* Benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-2xl mx-auto mb-8 sm:mb-10 px-4">
              {BENEFITS.map((text, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-4 py-3 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
                >
                  <FaCheckCircle className="text-emerald-500 dark:text-emerald-400 text-xl sm:text-2xl flex-shrink-0" />
                  <span className="text-sm sm:text-base text-slate-700 dark:text-slate-300 font-medium text-left">{text}</span>
                </div>
              ))}
            </div>

            {user ? (
              /* ── Logged-in card ── */
              <div className="space-y-4 sm:space-y-6 animate-fade-in">
                <Card className="max-w-xl mx-auto shadow-2xl border-2 border-violet-200 dark:border-violet-800 dark:bg-slate-800">
                  <CardContent className="text-center p-6 sm:p-8 lg:p-10">
                    <div className="bg-gradient-to-br from-violet-600 to-indigo-700 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
                      <UserIcon className="text-3xl sm:text-4xl text-white" />
                    </div>
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2 sm:mb-3">
                      Hello, {user.name}!
                    </h3>
                    <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-400 mb-6 sm:mb-8">
                      You are logged in as{" "}
                      <span className="font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                        {ROLE_LABELS[user.role] ?? user.role}
                      </span>
                    </p>
                    <div className="space-y-3 sm:space-y-4">
                      <Link
                        to={dashboardLink}
                        className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-3 sm:py-4 px-6 sm:px-8 rounded-xl hover:from-violet-700 hover:to-indigo-700 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 font-bold text-base sm:text-lg shadow-lg min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2"
                      >
                        <FaTachometerAlt />
                        Go to Dashboard
                        <FaArrowRight />
                      </Link>
                      <Link
                        to="/profile"
                        className="flex items-center justify-center gap-2 w-full bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 py-3 sm:py-4 px-6 sm:px-8 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-600 hover:shadow-lg transition-all duration-200 font-semibold text-base sm:text-lg shadow-md border-2 border-slate-200 dark:border-slate-600 hover:scale-[1.01] active:scale-[0.99] min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2"
                      >
                        <FaUserCircle />
                        View Profile
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              /* ── Guest CTAs ── */
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4 animate-fade-in">
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 sm:px-10 py-3 sm:py-5 rounded-xl hover:from-violet-700 hover:to-indigo-700 hover:shadow-violet-500/30 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.99] transition-all duration-200 font-bold text-base sm:text-lg lg:text-xl shadow-2xl w-full sm:w-auto min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2"
                >
                  <FaRocket />
                  Get Started
                  <FaArrowRight />
                </Link>
                <Link
                  to="/signup"
                  className="flex items-center justify-center gap-2 bg-white dark:bg-slate-800 text-violet-600 dark:text-violet-400 px-6 sm:px-10 py-3 sm:py-5 rounded-xl border-2 border-violet-500 dark:border-violet-600 hover:bg-violet-50 dark:hover:bg-violet-950/30 hover:shadow-xl hover:scale-[1.02] active:scale-[0.99] transition-all duration-200 font-bold text-base sm:text-lg lg:text-xl shadow-xl w-full sm:w-auto min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2"
                >
                  <FaUsers />
                  Sign Up Free
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Features Section ──────────────────────────────────────── */}
      <div className="py-16 sm:py-20 lg:py-28 bg-white dark:bg-slate-900 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-100 to-indigo-100 dark:from-violet-950/50 dark:to-indigo-950/50 border border-violet-200 dark:border-violet-800 px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-semibold text-violet-700 dark:text-violet-300 mb-4 sm:mb-6">
              <FaStar className="text-amber-500" />
              Features That Matter
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4 sm:mb-6 px-4">
              Why Choose Gradewise AI?
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto px-4">
              Discover the features that make Gradewise AI the perfect solution for modern education.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {FEATURES.map((feature, index) => {
              const Icon = feature.Icon
              return (
                <Card
                  key={index}
                  className={`text-center group hover:shadow-2xl transition-all duration-200 hover:-translate-y-2 border-2 ${feature.borderColor} ${feature.bgColor}`}
                >
                  <CardContent className="p-6 sm:p-8">
                    <div className={`bg-gradient-to-br ${feature.iconBg} w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-xl group-hover:scale-110 transition-transform duration-200`}>
                      <Icon className="text-3xl sm:text-4xl text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mb-3 sm:mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── CTA Section ───────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-slate-900 via-violet-900 to-indigo-900 dark:from-slate-950 dark:via-violet-950 dark:to-indigo-950 py-16 sm:py-20 lg:py-24 relative overflow-hidden transition-colors duration-200">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40 pointer-events-none" />
        <div className="relative max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-semibold text-white mb-6 sm:mb-8">
            <FaBolt className="text-amber-300" />
            Start Your Journey Today
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4 sm:mb-6 leading-tight px-4">
            Ready to Transform Your Grading Experience?
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-violet-200 mb-8 sm:mb-10 lg:mb-12 max-w-3xl mx-auto leading-relaxed px-4">
            Join thousands of educators who are already using Gradewise AI to enhance their teaching and save valuable time.
          </p>
          {!user && (
            <Link
              to="/signup"
              className="inline-flex items-center justify-center gap-3 bg-white text-violet-700 px-8 sm:px-12 py-4 sm:py-5 rounded-xl hover:bg-slate-100 hover:shadow-white/20 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.99] transition-all duration-200 font-bold text-base sm:text-lg lg:text-xl shadow-2xl min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-violet-900"
            >
              <FaRocket />
              Start Your Free Trial
              <FaArrowRight />
            </Link>
          )}
        </div>
      </div>

    </div>
  )
}

export default Home
