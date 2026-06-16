import { useState, useEffect } from "react";
import useAuthStore from "../../store/authStore.js";
import { Card, CardHeader, CardContent } from "../../components/ui/Card.jsx";
import LoadingSpinner from "../../components/ui/LoadingSpinner.jsx";
import Modal from "../../components/ui/Modal.jsx";
import {
  FaUser,
  FaUsers,
  FaCheckCircle,
  FaClock,
  FaUserShield,
  FaChalkboardTeacher,
  FaUserGraduate,
  FaSync,
  FaCrown,
  FaCalendarAlt
} from "react-icons/fa";

function AdminDashboard() {
  const { user, getUsers, changeUserRole } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ isOpen: false, type: "info", title: "", message: "" });
  const [roleChangeLoading, setRoleChangeLoading] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

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

  const showModal = (type, title, message) => {
    setModal({ isOpen: true, type, title, message });
  };

  const handleRoleChange = async (userId, newRole, userName) => {
    try {
      setRoleChangeLoading(userId);
      await changeUserRole({ userId, newRole });
      await fetchUsers();
      showModal("success", "Success", `Successfully changed ${userName}'s role to ${newRole}.`);
    } catch (error) {
      showModal("error", "Error", error.response?.data?.message || "Failed to change role.");
    } finally {
      setRoleChangeLoading(null);
    }
  };

  const filteredUsers = users.filter(u => u.role !== "super_admin");

  const getUserStats = () => {
    return filteredUsers.reduce(
      (acc, u) => {
        acc[u.role] = (acc[u.role] || 0) + 1;
        u.verified ? acc.verified++ : acc.unverified++;
        return acc;
      },
      { admin: 0, instructor: 0, student: 0, verified: 0, unverified: 0 }
    );
  };

  const stats = getUserStats();

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin":       return "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-700";
      case "instructor":  return "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700";
      case "student":     return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700";
      default:            return "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-700/50 dark:text-slate-300 dark:border-slate-600";
    }
  };

  const statsData = [
    {
      value: filteredUsers.length,
      label: "Total Users",
      icon: <FaUsers className="w-6 h-6 sm:w-7 sm:h-7" />,
      color: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-50 dark:bg-indigo-900/30",
      borderColor: "border-indigo-200 dark:border-indigo-700",
    },
    {
      value: stats.admin,
      label: "Admins",
      icon: <FaUserShield className="w-6 h-6 sm:w-7 sm:h-7" />,
      color: "text-rose-600 dark:text-rose-400",
      bgColor: "bg-rose-50 dark:bg-rose-900/30",
      borderColor: "border-rose-200 dark:border-rose-700",
    },
    {
      value: stats.instructor,
      label: "Instructors",
      icon: <FaChalkboardTeacher className="w-6 h-6 sm:w-7 sm:h-7" />,
      color: "text-violet-600 dark:text-violet-400",
      bgColor: "bg-violet-50 dark:bg-violet-900/30",
      borderColor: "border-violet-200 dark:border-violet-700",
    },
    {
      value: stats.student,
      label: "Students",
      icon: <FaUserGraduate className="w-6 h-6 sm:w-7 sm:h-7" />,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/30",
      borderColor: "border-emerald-200 dark:border-emerald-700",
    },
    {
      value: stats.verified,
      label: "Verified",
      icon: <FaCheckCircle className="w-6 h-6 sm:w-7 sm:h-7" />,
      color: "text-slate-600 dark:text-slate-400",
      bgColor: "bg-slate-100 dark:bg-slate-700/40",
      borderColor: "border-slate-200 dark:border-slate-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/30 dark:from-slate-950 dark:via-indigo-950/20 dark:to-slate-950">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">

        {/* Welcome Section */}
        <div className="mb-8 sm:mb-10">
          <div className="bg-gradient-to-r from-indigo-700 to-violet-700 dark:from-indigo-800 dark:via-violet-900 dark:to-indigo-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl text-white">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 flex items-center gap-3">
                  <FaCrown className="text-yellow-300" />
                  Admin Dashboard
                </h1>
                <p className="text-indigo-100 text-sm sm:text-base lg:text-lg">
                  Welcome back, {user?.name}! Manage your platform and oversee all operations.
                </p>
              </div>
              <div className="hidden sm:block">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 lg:p-6">
                  <FaUsers className="w-10 h-10 lg:w-12 lg:h-12 mx-auto mb-2" />
                  <p className="text-xs lg:text-sm font-semibold text-center">
                    {filteredUsers.length} Total Users
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
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
                  <div className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-medium">{stat.label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Users List Card */}
        <Card className="shadow-2xl border-2 border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden dark:bg-slate-800">
          <CardHeader className="bg-gradient-to-r from-indigo-700 via-violet-700 to-indigo-700 text-white border-b-2 border-indigo-800">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold flex items-center gap-2">
                <FaUsers className="text-xl sm:text-2xl" />
                All Users Management
              </h2>
              <button
                onClick={fetchUsers}
                className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl transition-all duration-200 ease-out font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl min-h-[44px]"
              >
                <FaSync className={loading ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="text-center py-16 sm:py-20">
                <LoadingSpinner size="lg" type="bars" color="purple" />
                <p className="text-slate-600 dark:text-slate-400 mt-4 text-sm sm:text-base">Loading users...</p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="overflow-x-auto hidden lg:block">
                  <table className="min-w-full divide-y-2 divide-slate-200 dark:divide-slate-700">
                    <thead className="bg-gradient-to-r from-slate-100 to-indigo-50 dark:from-slate-700 dark:to-indigo-950/30">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <FaUser />
                            User
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <FaUserShield />
                            Role
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <FaCheckCircle />
                            Status
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <FaCalendarAlt />
                            Joined
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                          Actions
                        </th>
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
                      {filteredUsers.map((userData) => (
                        <tr key={userData.id} className="hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-colors duration-150 ease-out">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                                userData.role === "admin" ? "bg-gradient-to-br from-rose-500 to-rose-600" :
                                userData.role === "instructor" ? "bg-gradient-to-br from-indigo-500 to-indigo-600" :
                                "bg-gradient-to-br from-emerald-500 to-emerald-600"
                              }`}>
                                {userData.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{userData.name}</div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">{userData.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full border ${getRoleBadgeColor(userData.role)}`}>
                              {userData.role === "admin" && <FaCrown className="text-xs" />}
                              {userData.role === "instructor" && <FaChalkboardTeacher className="text-xs" />}
                              {userData.role === "student" && <FaUserGraduate className="text-xs" />}
                              {userData.role}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full ${
                              userData.verified
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300"
                                : "bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-300"
                            }`}>
                              {userData.verified ? <FaCheckCircle /> : <FaClock />}
                              {userData.verified ? "Verified" : "Pending"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                              <FaCalendarAlt className="text-slate-400 dark:text-slate-500" />
                              {new Date(userData.created_at).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {userData.id !== user?.id && (
                              <div className="flex flex-wrap gap-2">
                                {userData.role !== "admin" && (
                                  <button
                                    onClick={() => handleRoleChange(userData.id, "admin", userData.name)}
                                    disabled={roleChangeLoading === userData.id}
                                    className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:hover:bg-rose-900/50 rounded-lg text-xs font-bold transition-colors duration-150 ease-out disabled:opacity-50 min-h-[44px]"
                                  >
                                    {roleChangeLoading === userData.id ? "..." : "→ Admin"}
                                  </button>
                                )}
                                {userData.role !== "instructor" && (
                                  <button
                                    onClick={() => handleRoleChange(userData.id, "instructor", userData.name)}
                                    disabled={roleChangeLoading === userData.id}
                                    className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50 rounded-lg text-xs font-bold transition-colors duration-150 ease-out disabled:opacity-50 min-h-[44px]"
                                  >
                                    {roleChangeLoading === userData.id ? "..." : "→ Instructor"}
                                  </button>
                                )}
                                {userData.role !== "student" && (
                                  <button
                                    onClick={() => handleRoleChange(userData.id, "student", userData.name)}
                                    disabled={roleChangeLoading === userData.id}
                                    className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/50 rounded-lg text-xs font-bold transition-colors duration-150 ease-out disabled:opacity-50 min-h-[44px]"
                                  >
                                    {roleChangeLoading === userData.id ? "..." : "→ Student"}
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden">
                  {filteredUsers.length === 0 && (
                    <div className="px-6 py-16 text-center">
                      <FaUsers className="w-10 h-10 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                      <p className="text-base font-medium text-slate-500 dark:text-slate-400">No users found</p>
                    </div>
                  )}
                  {filteredUsers.map((userData) => (
                    <div
                      key={userData.id}
                      className="border-b-2 border-slate-200 dark:border-slate-700 p-4 sm:p-5 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-colors duration-150 ease-out"
                    >
                      <div className="flex items-start gap-3 mb-4">
                        <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg ${
                          userData.role === "admin" ? "bg-gradient-to-br from-rose-500 to-rose-600" :
                          userData.role === "instructor" ? "bg-gradient-to-br from-indigo-500 to-indigo-600" :
                          "bg-gradient-to-br from-emerald-500 to-emerald-600"
                        }`}>
                          {userData.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base sm:text-lg mb-1">{userData.name}</h3>
                          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate">{userData.email}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full border ${getRoleBadgeColor(userData.role)}`}>
                              {userData.role === "admin" && <FaCrown className="text-xs" />}
                              {userData.role === "instructor" && <FaChalkboardTeacher className="text-xs" />}
                              {userData.role === "student" && <FaUserGraduate className="text-xs" />}
                              {userData.role}
                            </span>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full ${
                              userData.verified
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300"
                                : "bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-300"
                            }`}>
                              {userData.verified ? <FaCheckCircle /> : <FaClock />}
                              {userData.verified ? "Verified" : "Pending"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-4 pl-16">
                        <FaCalendarAlt className="text-slate-400 dark:text-slate-500" />
                        <span>Joined: {new Date(userData.created_at).toLocaleDateString()}</span>
                      </div>

                      {userData.id !== user?.id && (
                        <div className="flex flex-wrap gap-2 pl-16">
                          {userData.role !== "admin" && (
                            <button
                              onClick={() => handleRoleChange(userData.id, "admin", userData.name)}
                              disabled={roleChangeLoading === userData.id}
                              className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:hover:bg-rose-900/50 rounded-lg text-xs font-bold transition-colors duration-150 ease-out disabled:opacity-50 min-h-[44px]"
                            >
                              {roleChangeLoading === userData.id ? "..." : "→ Admin"}
                            </button>
                          )}
                          {userData.role !== "instructor" && (
                            <button
                              onClick={() => handleRoleChange(userData.id, "instructor", userData.name)}
                              disabled={roleChangeLoading === userData.id}
                              className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50 rounded-lg text-xs font-bold transition-colors duration-150 ease-out disabled:opacity-50 min-h-[44px]"
                            >
                              {roleChangeLoading === userData.id ? "..." : "→ Instructor"}
                            </button>
                          )}
                          {userData.role !== "student" && (
                            <button
                              onClick={() => handleRoleChange(userData.id, "student", userData.name)}
                              disabled={roleChangeLoading === userData.id}
                              className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/50 rounded-lg text-xs font-bold transition-colors duration-150 ease-out disabled:opacity-50 min-h-[44px]"
                            >
                              {roleChangeLoading === userData.id ? "..." : "→ Student"}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        type={modal.type}
        title={modal.title}
      >
        {modal.message}
      </Modal>
    </div>
  );
}

export default AdminDashboard;
