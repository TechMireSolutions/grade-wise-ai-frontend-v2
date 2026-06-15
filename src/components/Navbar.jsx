import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore.js";
import useThemeStore from "../store/themeStore.js";
import {
  FaHome,
  FaUser,
  FaChartBar,
  FaClipboardList,
  FaPlus,
  FaUserGraduate,
  FaBook,
  FaTachometerAlt,
  FaUserShield,
  FaChalkboardTeacher,
  FaCrown,
  FaGraduationCap,
  FaMoon,
  FaSun,
  FaSignOutAlt,
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

function Navbar() {
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const UserRoleIcon = user ? (ROLE_ICON_MAP[user.role] ?? FaUser) : FaUser;

  const getNavLinks = () => {
    if (!user) {
      return [
        { name: "Home", href: "/", icon: <FaHome className="w-4 h-4" /> },
        { name: "Login", href: "/login", icon: <FaUser className="w-4 h-4" /> },
        { name: "Sign Up", href: "/signup", icon: <FaUserGraduate className="w-4 h-4" /> },
      ];
    }

    const profileLink = { name: "Profile", href: "/profile", icon: <FaUser className="w-4 h-4" /> };

    switch (user.role) {
      case "super_admin":
        return [
          { name: "Dashboard", href: "/super-admin/dashboard", icon: <FaTachometerAlt className="w-4 h-4" /> },
          profileLink,
        ];
      case "admin":
        return [
          { name: "Dashboard", href: "/admin/dashboard", icon: <FaTachometerAlt className="w-4 h-4" /> },
          profileLink,
        ];
      case "instructor":
        return [
          { name: "Dashboard", href: "/instructor/dashboard", icon: <FaTachometerAlt className="w-4 h-4" /> },
          { name: "My Assessments", href: "/instructor/assessments", icon: <FaClipboardList className="w-4 h-4" /> },
          { name: "Create Assessment", href: "/instructor/assessments/create", icon: <FaPlus className="w-4 h-4" /> },
          { name: "Manage Students", href: "/instructor/students", icon: <FaUserGraduate className="w-4 h-4" /> },
          { name: "Resources", href: "/instructor/resources", icon: <FaBook className="w-4 h-4" /> },
          profileLink,
        ];
      case "student":
        return [
          { name: "Dashboard", href: "/student/dashboard", icon: <FaTachometerAlt className="w-4 h-4" /> },
          { name: "Analytics", href: "/student/analytics", icon: <FaChartBar className="w-4 h-4" /> },
          profileLink,
        ];
      default:
        return [profileLink];
    }
  };

  const navLinks = getNavLinks();

  const isActiveLink = (href) => {
    const currentPath = location.pathname;
    if (currentPath === href) return true;
    if (href === "/instructor/assessments" && currentPath === "/instructor/assessments/create") return false;
    return currentPath.startsWith(href + "/");
  };

  const handleMobileMenuToggle = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleLogout = () => {
    logout();
    closeMobileMenu();
    navigate("/");
  };

  return (
    <nav className="shadow-xl border-b-2 border-slate-200 dark:border-slate-700 sticky top-0 z-50 backdrop-blur-sm bg-white/95 dark:bg-slate-900/95 transition-colors duration-200">
      <div className="w-full px-3 sm:px-4 lg:px-6">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link
              to="/"
              className="flex items-center space-x-2 group rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-1"
              onClick={closeMobileMenu}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center flex-shrink-0 transform group-hover:scale-110 transition-transform duration-300 shadow-md">
                <FaBook className="text-white text-sm" />
              </div>
              <span className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent whitespace-nowrap">
                Gradewise AI
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1 flex-1 justify-end">
            <div className="flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`flex items-center gap-1.5 px-2 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ease-out whitespace-nowrap min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-1 ${
                    isActiveLink(link.href)
                      ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg"
                      : "text-slate-700 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30"
                  }`}
                >
                  {link.icon}
                  <span className="hidden xl:inline">{link.name}</span>
                </Link>
              ))}
            </div>

            {/* Theme toggle + User info + Logout */}
            <div className="flex items-center space-x-1 pl-2 ml-1 border-l-2 border-slate-200 dark:border-slate-700">

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-1 cursor-pointer"
              >
                {isDark ? <FaSun className="text-base" /> : <FaMoon className="text-base" />}
              </button>

              {user && (
                <>
                  <div className="flex items-center space-x-1 bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-950/40 dark:to-indigo-950/40 px-2 py-1 rounded-lg border border-violet-200 dark:border-violet-800">
                    <div className="text-violet-600 dark:text-violet-400 text-base">
                      <UserRoleIcon />
                    </div>
                    <div className="hidden xl:block ml-1">
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">{user.name}</div>
                      <div className="text-xs text-violet-600 dark:text-violet-400 font-medium leading-tight">
                        {ROLE_LABELS[user.role] ?? user.role}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-rose-600 to-rose-700 text-white px-2 py-1.5 rounded-lg text-sm font-semibold hover:from-rose-700 hover:to-rose-800 transition-all duration-200 ease-out shadow-md hover:shadow-lg whitespace-nowrap min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-1 cursor-pointer"
                  >
                    <FaSignOutAlt />
                    <span className="hidden xl:inline">Logout</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Mobile: theme toggle + hamburger */}
          <div className="lg:hidden flex items-center gap-1">
            <button
              onClick={toggleTheme}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 cursor-pointer"
            >
              {isDark ? <FaSun className="text-base" /> : <FaMoon className="text-base" />}
            </button>
            <button
              onClick={handleMobileMenuToggle}
              aria-label="Toggle mobile menu"
              className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 cursor-pointer"
            >
              <span className="sr-only">Open menu</span>
              {isMobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t-2 border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50 to-violet-50/30 dark:from-slate-900 dark:to-violet-950/10 shadow-inner">
            <div className="px-2 pt-3 pb-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={closeMobileMenu}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold transition-all duration-200 ease-out min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
                    isActiveLink(link.href)
                      ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg"
                      : "text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md hover:text-violet-600 dark:hover:text-violet-400"
                  }`}
                >
                  <span className={isActiveLink(link.href) ? "text-white" : "text-violet-600 dark:text-violet-400"}>
                    {link.icon}
                  </span>
                  <span>{link.name}</span>
                </Link>
              ))}

              {user && (
                <>
                  <div className="border-t-2 border-slate-200 dark:border-slate-700 my-3" />
                  <div className="px-2">
                    <div className="bg-gradient-to-r from-violet-100 to-indigo-100 dark:from-violet-950/40 dark:to-indigo-950/40 rounded-2xl p-4 mb-3 border-2 border-violet-200 dark:border-violet-800 shadow-md">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl text-violet-600 dark:text-violet-400 bg-white dark:bg-slate-800 p-2.5 rounded-xl shadow-sm">
                          <UserRoleIcon />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-slate-100 text-base leading-tight">{user.name}</div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">{user.email}</div>
                          <div className="inline-flex items-center gap-1 text-xs text-white bg-violet-600 px-2 py-1 rounded-full mt-1 font-semibold">
                            {ROLE_LABELS[user.role] ?? user.role}
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-3 bg-gradient-to-r from-rose-600 to-rose-700 text-white rounded-xl font-bold hover:from-rose-700 hover:to-rose-800 transition-all duration-200 ease-out shadow-lg hover:shadow-xl flex items-center justify-center gap-2 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-1 cursor-pointer"
                    >
                      <FaSignOutAlt className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
