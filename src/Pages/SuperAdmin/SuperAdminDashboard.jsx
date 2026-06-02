import { useState, useEffect } from "react";
import useAuthStore from "../../store/authStore.js";
import { Card, CardHeader, CardContent } from "../../components/ui/Card.jsx";
import LoadingSpinner from "../../components/ui/LoadingSpinner.jsx";
import Modal from "../../components/ui/Modal.jsx";
import { getAllConfigs, bulkUpdateConfigs } from "../../api/config.api.js";
import {
  FaUser,
  FaUsers,  
  FaCheckCircle,
  FaClock,
  FaArrowUp,
  FaArrowDown,
  FaTrash,
  FaCrown,
  FaUserShield,
  FaChalkboardTeacher,
  FaUserGraduate,
  FaSync,
  FaCalendarAlt,
  FaShieldAlt,
  FaKey,
  FaCog,
  FaRocket,
  FaPlus,
  FaSave,
} from "react-icons/fa";

function SuperAdminDashboard() {
  const { user, getUsers, changeUserRole, deleteUser } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("users");
  const [modal, setModal] = useState({ isOpen: false, type: "info", title: "", message: "" });
  const [actionLoading, setActionLoading] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  // Config State
  const [configs, setConfigs] = useState({
    AI_PROVIDER: "gemini",
    AI_KEYS: "",
    AI_MODEL: "gemini-1.5-flash",
  });

  const modelOptions = {
    gemini: [
      { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
      { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash" },
      { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
      { value: "gemini-pro", label: "Gemini Pro" },
    ],
    groq: [
      { value: "llama3-8b-8192", label: "Llama 3 8B" },
      { value: "llama3-70b-8192", label: "Llama 3 70B" },
      { value: "mixtral-8x7b-32768", label: "Mixtral 8x7B" },
      { value: "gemma-7b-it", label: "Gemma 7B" },
    ],
    openai: [
      { value: "gpt-4o", label: "GPT-4o" },
      { value: "gpt-4o-mini", label: "GPT-4o Mini" },
      { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
      { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
    ],
    claude: [
      { value: "claude-3-5-sonnet-20240620", label: "Claude 3.5 Sonnet" },
      { value: "claude-3-opus-20240229", label: "Claude 3 Opus" },
      { value: "claude-3-sonnet-20240229", label: "Claude 3 Sonnet" },
      { value: "claude-3-haiku-20240307", label: "Claude 3 Haiku" },
    ]
  };

  const detectProvider = (key) => {
    const k = key.split(',')[0].trim();
    if (!k) return null;
    if (k.startsWith("gsk_")) return "groq";
    if (k.startsWith("sk-ant-")) return "claude";
    if (k.startsWith("sk-")) return "openai";
    if (k.startsWith("AIza") || k.startsWith("AQ.")) return "gemini";
    return null;
  };
  const [configLoading, setConfigLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchConfigs();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getUsers();
      setUsers(response.users);
    } catch (error) {
      showModal("error", "Error", "Failed to fetch users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchConfigs = async () => {
    try {
      const response = await getAllConfigs();
      if (response.success) {
        setConfigs({
          AI_PROVIDER: response.configs.AI_PROVIDER || "gemini",
          AI_KEYS: response.configs.AI_KEYS || "",
          AI_MODEL: response.configs.AI_MODEL || "gemini-1.5-flash",
        });
      }
    } catch (error) {
      console.error("Failed to fetch configs:", error);
    }
  };

  const handleConfigChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "AI_KEYS") {
      const detected = detectProvider(value);
      if (detected) {
        setConfigs(prev => ({
          ...prev,
          AI_KEYS: value,
          AI_PROVIDER: detected,
          AI_MODEL: modelOptions[detected][0].value
        }));
        return;
      }
    }

    setConfigs(prev => {
      const newConfigs = { ...prev, [name]: value };
      if (name === "AI_PROVIDER") {
        newConfigs.AI_MODEL = modelOptions[value][0].value;
      }
      return newConfigs;
    });
  };

  const handleSaveConfigs = async () => {
    try {
      setConfigLoading(true);
      await bulkUpdateConfigs(configs);
      showModal("success", "Settings Saved", "System configurations have been updated successfully.");
    } catch (error) {
      showModal("error", "Error", "Failed to save settings. Please try again.");
    } finally {
      setConfigLoading(false);
    }
  };

  const showModal = (type, title, message) => {
    setModal({ isOpen: true, type, title, message });
  };

  const handleRoleChange = async (userId, newRole, userName, userEmail) => {
    try {
      setActionLoading(`role-${userId}`);
      await changeUserRole({ userId, newRole, userEmail });
      await fetchUsers();
      showModal("success", "Success", `Successfully changed ${userName}'s role to ${newRole}.`);
    } catch (error) {
      showModal("error", "Error", `Failed to change user role. ${error.response?.data?.message || "Please try again."}`);
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

  const getUserStats = () => {
    return users.reduce(
      (acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        acc.verified += user.verified ? 1 : 0;
        return acc;
      },
      { admin: 0, instructor: 0, student: 0, verified: 0 }
    );
  };

  const stats = getUserStats();

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "super_admin": return "bg-purple-100 text-purple-800 border-purple-200";
      case "admin": return "bg-red-100 text-red-800 border-red-200";
      case "instructor": return "bg-blue-100 text-blue-800 border-blue-200";
      case "student": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const filteredUsers = users.filter((u) => u.role !== "super_admin");

  const statsData = [
    { value: filteredUsers.length, label: "Total Users", icon: <FaUsers className="w-6 h-6 sm:w-7 sm:h-7" />, color: "text-purple-600", bgColor: "bg-purple-50", borderColor: "border-purple-200" },
    { value: stats.admin, label: "Admins", icon: <FaUserShield className="w-6 h-6 sm:w-7 sm:h-7" />, color: "text-red-600", bgColor: "bg-red-50", borderColor: "border-red-200" },
    { value: stats.instructor, label: "Instructors", icon: <FaChalkboardTeacher className="w-6 h-6 sm:w-7 sm:h-7" />, color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
    { value: stats.student, label: "Students", icon: <FaUserGraduate className="w-6 h-6 sm:w-7 sm:h-7" />, color: "text-green-600", bgColor: "bg-green-50", borderColor: "border-green-200" },
    { value: stats.verified, label: "Verified", icon: <FaCheckCircle className="w-6 h-6 sm:w-7 sm:h-7" />, color: "text-emerald-600", bgColor: "bg-emerald-50", borderColor: "border-emerald-200" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-blue-50/30">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        <div className="mb-8 sm:mb-10">
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl text-white">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 flex items-center gap-3">
                  <FaCrown className="text-yellow-300 animate-pulse" />
                  Super Admin Dashboard
                </h1>
                <p className="text-purple-100 text-sm sm:text-base lg:text-lg mb-4">Welcome back, {user?.name}!</p>
                <div className="bg-yellow-500/20 backdrop-blur-sm border border-yellow-400/30 rounded-xl p-3 sm:p-4">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <FaShieldAlt className="text-yellow-300 text-lg sm:text-xl flex-shrink-0 mt-0.5" />
                    <div className="text-xs sm:text-sm">
                      <strong className="block mb-1">Role Permissions:</strong>
                      <span className="text-yellow-100">Manage users, promote/demote roles, and configure system API keys.</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="hidden sm:block">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 lg:p-6 text-center">
                  <FaCog className="w-10 h-10 lg:w-12 lg:h-12 mx-auto mb-2 animate-spin-slow" />
                  <p className="text-xs lg:text-sm font-semibold">System Control</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-8">
          <button onClick={() => setActiveTab("users")} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-md ${activeTab === "users" ? "bg-purple-600 text-white translate-y-[-2px] shadow-purple-200" : "bg-white text-gray-600 hover:bg-gray-50"}`}>
            <FaUsers /> Users Management
          </button>
          <button onClick={() => setActiveTab("config")} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-md ${activeTab === "config" ? "bg-pink-600 text-white translate-y-[-2px] shadow-pink-200" : "bg-white text-gray-600 hover:bg-gray-50"}`}>
            <FaKey /> API Configuration
          </button>
        </div>

        {activeTab === "users" ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-8 sm:mb-10">
              {statsData.map((stat, index) => (
                <Card key={index} className={`border-2 ${stat.borderColor} hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col items-center text-center">
                      <div className={`${stat.bgColor} ${stat.color} p-3 sm:p-4 rounded-2xl mb-3 sm:mb-4`}>{stat.icon}</div>
                      <div className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${stat.color} mb-1 sm:mb-2`}>{stat.value}</div>
                      <div className="text-gray-600 text-xs sm:text-sm font-medium">{stat.label}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="shadow-2xl border-2 border-gray-200 rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white border-b-2 border-purple-700">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold flex items-center gap-2"><FaUsers className="text-xl sm:text-2xl" /> Platform Users Management</h2>
                  <button onClick={fetchUsers} className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl transition-all duration-300 font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl">
                    <FaSync className="animate-spin-on-hover" /> Refresh
                  </button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="text-center py-16 sm:py-20">
                    <LoadingSpinner size="lg" type="bars" color="purple" />
                    <p className="text-gray-600 mt-4 text-sm sm:text-base">Loading users...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full divide-y-2 divide-gray-200">
                      <thead className="bg-gradient-to-r from-gray-100 to-purple-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-800 uppercase">User</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-800 uppercase">Role</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-800 uppercase">Status</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-800 uppercase">Joined</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-800 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredUsers.map((userData) => (
                          <tr key={userData.id} className="hover:bg-purple-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${getRoleBadgeColor(userData.role)}`}>{userData.name.charAt(0).toUpperCase()}</div>
                                <div><div className="text-sm font-semibold">{userData.name}</div><div className="text-xs text-gray-500">{userData.email}</div></div>
                              </div>
                            </td>
                            <td className="px-6 py-4"><span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full border ${getRoleBadgeColor(userData.role)}`}>{userData.role}</span></td>
                            <td className="px-6 py-4"><span className={`px-3 py-1.5 text-xs font-semibold rounded-full ${userData.verified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>{userData.verified ? "Verified" : "Pending"}</span></td>
                            <td className="px-6 py-4 text-sm text-gray-600">{new Date(userData.created_at).toLocaleDateString()}</td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <button onClick={() => handleDeleteUser(userData.id, userData.name)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><FaTrash /></button>
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
          </>
        ) : (
          <Card className="shadow-2xl border-2 border-gray-200 rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-pink-600 to-purple-600 text-white border-b-2 border-pink-700">
              <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2"><FaKey className="text-2xl" /> System API Key Management</h2>
            </CardHeader>
            <CardContent className="p-6 sm:p-8 lg:p-10">
              <div className="max-w-4xl space-y-8">
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-xl">
                  <div className="flex items-center gap-3">
                    <FaCog className="text-blue-500 animate-spin-slow" />
                    <div><h4 className="font-bold text-blue-800">API Key Configuration</h4><p className="text-sm text-blue-700">Add multiple keys separated by commas for load balancing and redundancy.</p></div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">Select AI Provider</label>
                      <select name="AI_PROVIDER" value={configs.AI_PROVIDER} onChange={handleConfigChange} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none text-sm font-semibold">
                        <option value="gemini">Google Gemini</option>
                        <option value="groq">Groq AI</option>
                        <option value="openai">OpenAI</option>
                        <option value="claude">Anthropic Claude</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">Select AI Model</label>
                      <select name="AI_MODEL" value={configs.AI_MODEL} onChange={handleConfigChange} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none text-sm font-semibold">
                        {(modelOptions[configs.AI_PROVIDER] || []).map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">Enter API Keys (separated by commas)</label>
                    <textarea name="AI_KEYS" value={configs.AI_KEYS} onChange={handleConfigChange} rows="4" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none text-sm font-mono" placeholder="key1, key2..." />
                  </div>
                  <button onClick={handleSaveConfigs} disabled={configLoading} className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:scale-[1.02] disabled:opacity-50">
                    {configLoading ? <LoadingSpinner size="sm" /> : <><FaSave /> Save System Configuration</>}
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      <Modal isOpen={modal.isOpen} onClose={() => { setModal({ ...modal, isOpen: false }); setPendingDelete(null); }} onConfirm={pendingDelete ? confirmDeleteUser : undefined} type={modal.type} title={modal.title} loading={pendingDelete && actionLoading === `delete-${pendingDelete.userId}`} confirmText="Delete User">
        {modal.message}
      </Modal>
    </div>
  );
}

export default SuperAdminDashboard;
