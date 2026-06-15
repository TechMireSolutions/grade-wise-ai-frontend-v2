import useAuthStore from "../store/authStore.js";
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaEnvelope,
  FaHeart,
  FaCheckCircle,
  FaBook,
  FaCrown,
  FaUserShield,
  FaChalkboardTeacher,
  FaGraduationCap,
  FaUser,
} from "react-icons/fa";

const ROLE_LABELS = {
  super_admin: "Super Admin",
  admin: "Admin",
  instructor: "Instructor",
  student: "Student",
};

const ROLE_ICON_MAP = {
  super_admin: FaCrown,
  admin: FaUserShield,
  instructor: FaChalkboardTeacher,
  student: FaGraduationCap,
};

function Footer() {
  const { user } = useAuthStore();
  const currentYear = new Date().getFullYear();

  const UserRoleIcon = user ? (ROLE_ICON_MAP[user.role] ?? FaUser) : FaUser;

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-white relative overflow-hidden">
      {/* Decorative overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 via-indigo-600/10 to-violet-600/10 pointer-events-none" />

      <div className="relative w-full px-3 sm:px-4 lg:px-6 xl:px-7 2xl:px-8 py-8 sm:py-10 lg:py-12">
        <div className="mx-auto">

          {/* Brand + Social */}
          <div className="text-center md:text-left mb-7 lg:mb-9">
            <div className="flex items-center justify-center md:justify-start space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md">
                <FaBook className="text-white text-base" />
              </div>
              <span className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-violet-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
                Gradewise AI
              </span>
            </div>

            <p className="text-slate-300 dark:text-slate-400 mb-4 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto md:mx-0">
              Empowering educators with intelligent grading solutions. Transform your teaching experience with
              AI-powered assessment tools that save time and enhance learning outcomes.
            </p>

            {/* Social icons */}
            <div className="flex justify-center md:justify-start space-x-4 sm:space-x-6">
              <a
                href="#"
                className="w-11 h-11 sm:w-12 sm:h-12 bg-slate-800 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-gradient-to-br hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 ease-out shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
                aria-label="Facebook"
              >
                <FaFacebookF className="text-lg sm:text-xl" />
              </a>
              <a
                href="#"
                className="w-11 h-11 sm:w-12 sm:h-12 bg-slate-800 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-gradient-to-br hover:from-violet-600 hover:to-violet-700 transition-all duration-200 ease-out shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
                aria-label="Twitter"
              >
                <FaTwitter className="text-lg sm:text-xl" />
              </a>
              <a
                href="#"
                className="w-11 h-11 sm:w-12 sm:h-12 bg-slate-800 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-gradient-to-br hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 ease-out shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
                aria-label="LinkedIn"
              >
                <FaLinkedinIn className="text-lg sm:text-xl" />
              </a>
              <a
                href="mailto:support@gradewiseai.com"
                className="w-11 h-11 sm:w-12 sm:h-12 bg-slate-800 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-gradient-to-br hover:from-rose-600 hover:to-rose-700 transition-all duration-200 ease-out shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
                aria-label="Email"
              >
                <FaEnvelope className="text-lg sm:text-xl" />
              </a>
            </div>
          </div>

          {/* Logged-in user card */}
          {user && (
            <div className="border-t-2 border-slate-700/50 dark:border-slate-800 mt-7 sm:mt-4 pt-5 sm:pt-6">
              <div className="bg-gradient-to-br from-slate-800 via-slate-800/90 to-slate-700 dark:from-slate-900 dark:to-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 max-w-4xl mx-auto shadow-2xl border border-slate-700/50 dark:border-slate-700">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 text-center sm:text-left">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="text-2xl text-violet-400 bg-gradient-to-br from-violet-600/20 to-indigo-600/20 p-3 sm:p-4 rounded-2xl shadow-lg border border-violet-700/30">
                      <UserRoleIcon />
                    </div>
                    <div>
                      <div className="font-bold text-white text-base sm:text-lg lg:text-xl">
                        {user.name}
                      </div>
                      <div className="text-xs sm:text-sm text-slate-300 dark:text-slate-400 mt-1">
                        Logged in as{" "}
                        <span className="text-violet-400 font-semibold">
                          {ROLE_LABELS[user.role] ?? user.role}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/30">
                    <div className="relative flex items-center justify-center">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50" />
                    </div>
                    <span className="text-slate-200 font-semibold text-xs sm:text-sm">
                      Online · Active Now
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bottom bar */}
          <div className="border-t-2 border-slate-700/50 dark:border-slate-800 mt-7 sm:mt-9 lg:mt-12 pt-7 sm:pt-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between text-center md:text-left gap-3 mb-4 sm:mb-6">
              <div className="text-sm sm:text-base text-slate-400 font-medium">
                © {currentYear} Gradewise AI. All rights reserved.
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-xs sm:text-sm text-slate-400 justify-center">
                <span className="flex items-center gap-2 font-medium">
                  Made with <FaHeart className="text-rose-500 animate-pulse" /> for educators
                </span>
                <span className="hidden sm:inline text-slate-600">•</span>
                <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/30">
                  <FaCheckCircle className="text-emerald-500" />
                  <span className="font-semibold text-emerald-400">All systems operational</span>
                </div>
              </div>
            </div>

            {/* reCAPTCHA notice */}
            <div className="bg-slate-800/50 dark:bg-slate-900/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-700/50 dark:border-slate-700 max-w-4xl mx-auto">
              <p className="text-xs sm:text-sm text-slate-400 text-center leading-relaxed">
                This site is protected by reCAPTCHA and the Google{" "}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-400 underline hover:text-violet-300 transition-colors duration-200 font-medium"
                >
                  Privacy Policy
                </a>{" "}
                and{" "}
                <a
                  href="https://policies.google.com/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-400 underline hover:text-violet-300 transition-colors duration-200 font-medium"
                >
                  Terms of Service
                </a>{" "}
                apply.
              </p>
            </div>

            <div className="text-center mt-4 sm:mt-5">
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-600 italic">
                Revolutionizing education, one assessment at a time.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="h-1 bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600" />
    </footer>
  );
}

export default Footer;
