import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useAuthStore from "../../store/authStore.js";
import { Card, CardHeader, CardContent } from "../../components/ui/Card.jsx";
import LoadingSpinner from "../../components/ui/LoadingSpinner.jsx";
import Modal from "../../components/ui/Modal.jsx";
import {
  FaUsers,
  FaCheckCircle,
  FaTrash,
  FaCrown,
  FaUserShield,
  FaChalkboardTeacher,
  FaUserGraduate,
  FaSync,
  FaShieldAlt,
  FaKey,
  FaArrowRight,
} from "react-icons/fa";

function SuperAdminDashboard() {
  const { user, getUsers, changeUserRole, deleteUser } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ isOpen: false, type: "info", title: "", message: "" });
  const [actionLoading, setActionLoading] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const showModal = (type, title, message) =>
    setModal({ isOpen: true, type, title, message });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getUsers();
      setUsers(response.users);
    } catch {
      showModal("error", "Error", "Failed to fetch users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole, userName, userEmail) => {
    try {
      setActionLoading(`role-${userId}`);
      await changeUserRole({ userId, newRole, userEmail });
      await fetchUsers();
      showModal("success", "Success", `Successfully changed ${userName}'s role to ${newRole}.`);
    } catch (error) {
      showModal(
        "error",
        "Error",
        `Failed to change user role. ${error.response?.data?.message || "Please try again."}`
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = (userId, userName) => {
    setPendingDelete({ userId, userName });
    showModal(
      "warning",
      "Confirm Deletion",
      `Are you sure you want to delete ${userName}? This action cannot be undone.`
    );
  };

  const confirmDeleteUser = async () => {
    if (!pendingDelete) return;
    try {
      setActionLoading(`delete-${pendingDelete.userId}`);
      await deleteUser(pendingDelete.userId);
      await fetchUsers();
      showModal("success", "User Deleted", `${pendingDelete.userName} has been deleted successfully.`);
    } catch (error) {
      showModal("error", "Error", error.response?.data?.message || "Failed to delete user.");
    } finally {
      setActionLoading(null);
      setPendingDelete(null);
    }
  };

  const filteredUsers = users.filter(u => u.role !== "super_admin");

  const getUserStats = () =>
    filteredUsers.reduce(
      (acc, u) => {
        acc[u.role] = (acc[u.role] || 0) + 1;
        acc.verified += u.verified ? 1 : 0;
        return acc;
      },
      { admin: 0, instructor: 0, student: 0, verified: 0 }
    );

  const stats = getUserStats();

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "super_admin": return "bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-700";
      case "admin":       return "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-700";
      case "instructor":  return "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700";
      case "student":     return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700";
      default:            return "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-700/50 dark:text-slate-300 dark:border-slate-600";
    }
  };

  const getRoleAvatarBg = (role) => {
    switch (role) {
      case "super_admin": return "bg-violet-600";
      case "admin":       return "bg-rose-600";
      case "instructor":  return "bg-indigo-600";
      case "student":     return "bg-emerald-600";
      default:            return "bg-slate-500";
    }
  };

  const formatRole = (role) => {
    switch (role) {
      case "super_admin": return "Super Admin";
      case "admin":       return "Admin";
      case "instructor":  return "Instructor";
      case "student":     return "Student";
      default:            return role;
    }
  };

  const statsData = [
    { value: filteredUsers.length, label: "Total Users",  icon: <FaUsers className="w-6 h-6 sm:w-7 sm:h-7" />,            color: "text-violet-600 dark:text-violet-400",  bgColor: "bg-violet-50 dark:bg-violet-900/30",  borderColor: "border-violet-200 dark:border-violet-700" },
    { value: stats.admin,          label: "Admins",        icon: <FaUserShield className="w-6 h-6 sm:w-7 sm:h-7" />,        color: "text-rose-600 dark:text-rose-400",      bgColor: "bg-rose-50 dark:bg-rose-900/30",      borderColor: "border-rose-200 dark:border-rose-700" },
    { value: stats.instructor,     label: "Instructors",   icon: <FaChalkboardTeacher className="w-6 h-6 sm:w-7 sm:h-7" />, color: "text-indigo-600 dark:text-indigo-400",  bgColor: "bg-indigo-50 dark:bg-indigo-900/30",  borderColor: "border-indigo-200 dark:border-indigo-700" },
    { value: stats.student,        label: "Students",      icon: <FaUserGraduate className="w-6 h-6 sm:w-7 sm:h-7" />,      color: "text-slate-600 dark:text-slate-400",    bgColor: "bg-slate-100 dark:bg-slate-700/40",   borderColor: "border-slate-200 dark:border-slate-600" },
    { value: stats.verified,       label: "Verified",      icon: <FaCheckCircle className="w-6 h-6 sm:w-7 sm:h-7" />,       color: "text-emerald-600 dark:text-emerald-400",bgColor: "bg-emerald-50 dark:bg-emerald-900/30", borderColor: "border-emerald-200 dark:border-emerald-700" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-indigo-50/30 dark:from-slate-950 dark:via-violet-950/20 dark:to-slate-950">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">

        {/* ── Hero Header ─────────────────────────────────────────────────── */}
        <div className="mb-8 sm:mb-10">
          <div className="bg-gradient-to-r from-violet-700 via-violet-700 to-violet-700 dark:from-violet-800 dark:via-violet-900 dark:to-violet-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl text-white">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 flex items-center gap-3">
                  <FaCrown className="text-yellow-300" />
                  Super Admin Dashboard
                </h1>
                <p className="text-violet-100 text-sm sm:text-base lg:text-lg mb-4">
                  Welcome back, {user?.name}!
                </p>
                <div className="bg-yellow-500/20 backdrop-blur-sm border border-yellow-400/30 rounded-xl p-3 sm:p-4">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <FaShieldAlt className="text-yellow-300 text-lg sm:text-xl flex-shrink-0 mt-0.5" />
                    <div className="text-xs sm:text-sm">
                      <strong className="block mb-1">Role Permissions:</strong>
                      <span className="text-yellow-100">
                        Manage users, promote/demote roles, and configure system API keys.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick-access cards */}
              <div className="flex flex-row sm:flex-col gap-3 flex-shrink-0">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center min-w-[80px]">
                  <FaUsers className="w-8 h-8 mx-auto mb-1" />
                  <p className="text-2xl font-bold leading-none mb-0.5">{filteredUsers.length}</p>
                  <p className="text-xs font-semibold">Users</p>
                </div>
                <Link
                  to="/super-admin/api-config"
                  className="inline-flex flex-col items-center gap-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-2xl p-4 text-center transition-all duration-200 ease-out group min-w-[80px]"
                >
                  <FaKey className="w-8 h-8 group-hover:scale-110 transition-transform duration-150" />
                  <span className="text-xs font-semibold whitespace-nowrap">API Keys</span>
                  <FaArrowRight className="w-3 h-3 opacity-60" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats ───────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-8 sm:mb-10">
          {statsData.map((stat, index) => (
            <Card
              key={index}
              className={`border-2 ${stat.borderColor} hover:shadow-xl transition-all duration-200 ease-out transform hover:-translate-y-1 dark:bg-slate-800`}
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col items-center text-center">
                  <div className={`${stat.bgColor} ${stat.color} p-3 sm:p-4 rounded-2xl mb-3 sm:mb-4`}>
                    {stat.icon}
                  </div>
                  <div className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${stat.color} mb-1 sm:mb-2`}>
                    {stat.value}
                  </div>
                  <div className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-medium">
                    {stat.label}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Users table ─────────────────────────────────────────────────── */}
        <Card className="shadow-2xl border-2 border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden dark:bg-slate-800">
          <CardHeader className="bg-gradient-to-r from-violet-700 via-violet-700 to-violet-700 text-white border-b-2 border-violet-800">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold flex items-center gap-2">
                <FaUsers className="text-xl sm:text-2xl" /> Platform Users Management
              </h2>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={fetchUsers}
                  className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl transition-all duration-200 ease-out font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl min-h-[44px]"
                >
                  <FaSync className={loading ? "animate-spin" : ""} /> Refresh
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="text-center py-16 sm:py-20">
                <LoadingSpinner size="lg" type="bars" color="purple" />
                <p className="text-slate-600 dark:text-slate-400 mt-4 text-sm sm:text-base">
                  Loading users…
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full divide-y-2 divide-slate-200 dark:divide-slate-700">
                  <thead className="bg-gradient-to-r from-slate-100 to-violet-50 dark:from-slate-700 dark:to-violet-950/30">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">User</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Joined</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-16 text-center">
                          <FaUsers className="w-10 h-10 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                          <p className="text-base font-medium text-slate-500 dark:text-slate-400">No users found</p>
                        </td>
                      </tr>
                    )}
                    {filteredUsers.map(userData => (
                      <tr
                        key={userData.id}
                        className="hover:bg-violet-50/50 dark:hover:bg-violet-900/10 transition-colors duration-150"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${getRoleAvatarBg(userData.role)}`}
                            >
                              {userData.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                                {userData.name}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                {userData.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full border ${getRoleBadgeColor(userData.role)}`}>
                            {formatRole(userData.role)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1.5 text-xs font-semibold rounded-full ${
                            userData.verified
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                          }`}>
                            {userData.verified ? "Verified" : "Pending"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                          {new Date(userData.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            {userData.role !== "admin" && (
                              <button
                                onClick={() => handleRoleChange(userData.id, "admin", userData.name, userData.email)}
                                disabled={actionLoading === `role-${userData.id}`}
                                className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:hover:bg-rose-900/50 rounded-lg text-xs font-bold transition-colors duration-150 ease-out disabled:opacity-50 min-h-[44px]"
                              >
                                {actionLoading === `role-${userData.id}` ? "…" : "→ Admin"}
                              </button>
                            )}
                            {userData.role !== "instructor" && (
                              <button
                                onClick={() => handleRoleChange(userData.id, "instructor", userData.name, userData.email)}
                                disabled={actionLoading === `role-${userData.id}`}
                                className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50 rounded-lg text-xs font-bold transition-colors duration-150 ease-out disabled:opacity-50 min-h-[44px]"
                              >
                                {actionLoading === `role-${userData.id}` ? "…" : "→ Instructor"}
                              </button>
                            )}
                            {userData.role !== "student" && (
                              <button
                                onClick={() => handleRoleChange(userData.id, "student", userData.name, userData.email)}
                                disabled={actionLoading === `role-${userData.id}`}
                                className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/50 rounded-lg text-xs font-bold transition-colors duration-150 ease-out disabled:opacity-50 min-h-[44px]"
                              >
                                {actionLoading === `role-${userData.id}` ? "…" : "→ Student"}
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteUser(userData.id, userData.name)}
                              aria-label={`Delete user ${userData.name}`}
                              className="inline-flex items-center justify-center p-2.5 text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/20 rounded-lg transition-colors duration-150 ease-out min-w-[44px] min-h-[44px]"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal
        isOpen={modal.isOpen}
        onClose={() => {
          setModal({ ...modal, isOpen: false });
          setPendingDelete(null);
        }}
        onConfirm={pendingDelete ? confirmDeleteUser : undefined}
        type={modal.type}
        title={modal.title}
        loading={pendingDelete && actionLoading === `delete-${pendingDelete.userId}`}
        confirmText="Delete User"
      >
        {modal.message}
      </Modal>
    </div>
  );
}

export default SuperAdminDashboard;
