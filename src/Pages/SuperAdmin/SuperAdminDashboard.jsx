import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useAuthStore from "../../store/authStore.js";
import { Card, CardHeader, CardContent } from "../../components/ui/Card.jsx";
import LoadingSpinner from "../../components/ui/LoadingSpinner.jsx";
import Modal from "../../components/ui/Modal.jsx";
import {
  getAllConfigs,
  bulkUpdateConfigs,
  listAiKeys,
  getAiSummary,
  addAiKeys as apiAddAiKeys,
  setProviderModel as apiSetProviderModel,
  deleteAiKey as apiDeleteAiKey,
  testStoredAiKey,
  testInlineAiKey,
} from "../../api/config.api.js";
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

// Tiny pill showing the outcome of an API-key test.
function TestResultPill({ r }) {
  if (!r) return null;
  if (r.state === "testing") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
        <span className="inline-block w-2 h-2 rounded-full bg-gray-400 animate-pulse" />
        Testing…
      </span>
    );
  }
  if (r.state === "ok") {
    return (
      <div className="flex flex-col gap-1">
        <span
          title={r.message}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold w-fit"
        >
          ✓ OK
          {typeof r.latencyMs === "number" && <span className="font-mono opacity-70">{r.latencyMs}ms</span>}
        </span>
        {r.autoSwitchedModelFrom && (
          <span className="text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            🔧 Model auto-switched: <code>{r.autoSwitchedModelFrom}</code> → <code>{r.modelUsed}</code> (saved).
          </span>
        )}
        {r.providerOverridden && (
          <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            ⚠ Key is actually a <strong>{r.providerDetected}</strong> key — move it to the right provider pool.
          </span>
        )}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-1">
      <span
        title={r.message}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold max-w-xs truncate w-fit"
      >
        ✗ {(r.message || "Failed").substring(0, 60)}
      </span>
      {r.providerOverridden && (
        <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
          ⚠ Key prefix suggests <strong>{r.providerDetected}</strong>, not your saved provider.
        </span>
      )}
    </div>
  );
}

function SuperAdminDashboard() {
  const { user, getUsers, changeUserRole, deleteUser } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("users");
  const [modal, setModal] = useState({ isOpen: false, type: "info", title: "", message: "" });
  const [actionLoading, setActionLoading] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  // ── AI Configuration State — per (purpose × provider) ──────────────────
  // Six providers per purpose, each with its OWN model + keys + table.
  const ALL_PROVIDERS = ["gemini", "groq", "openai", "claude", "mistral", "deepseek"];
  const defaultModelMap = {
    gemini:   "gemini-2.0-flash",
    groq:     "llama-3.3-70b-versatile",
    openai:   "gpt-4o-mini",
    claude:   "claude-3-5-sonnet-20241022",
    mistral:  "mistral-large-latest",
    deepseek: "deepseek-chat",
  };
  const buildInitialState = () => {
    const perProvider = () => Object.fromEntries(
      ALL_PROVIDERS.map(p => [p, {
        model: defaultModelMap[p],
        newKeys: "",
        keysDirty: false,
        list: [],         // [{ index, snippet }]
        testStatus: {},   // { [index]: {state, message, latencyMs} }
      }])
    );
    return { pdf: perProvider(), text: perProvider() };
  };
  const [aiState, setAiState] = useState(buildInitialState);
  const [configSubTab, setConfigSubTab] = useState("pdf"); // "pdf" | "text"
  const [activeProvider, setActiveProvider] = useState({ pdf: "gemini", text: "gemini" });
  const [pendingKeyDelete, setPendingKeyDelete] = useState(null); // { purpose, provider, index, snippet }
  const [inlineTestStatus, setInlineTestStatus] = useState({}); // { 'pdf-gemini': {...} }

  // Comprehensive model catalog. Keep newest at the top of each list so the
  // default (first item) is always the current flagship.
  const providerLabels = {
    gemini: "Google Gemini",
    groq:   "Groq AI",
    openai: "OpenAI",
    claude: "Anthropic Claude",
    mistral:"Mistral AI",
    deepseek:"DeepSeek",
  };
  const modelOptions = {
    gemini: [
      { value: "gemini-2.5-pro",        label: "Gemini 2.5 Pro" },
      { value: "gemini-2.5-flash",      label: "Gemini 2.5 Flash" },
      { value: "gemini-2.0-flash",      label: "Gemini 2.0 Flash" },
      { value: "gemini-2.0-flash-lite", label: "Gemini 2.0 Flash-Lite" },
      { value: "gemini-1.5-pro",        label: "Gemini 1.5 Pro" },
      { value: "gemini-1.5-flash",      label: "Gemini 1.5 Flash" },
      { value: "gemini-1.5-flash-8b",   label: "Gemini 1.5 Flash 8B" },
      { value: "gemini-pro",            label: "Gemini Pro (legacy)" },
    ],
    groq: [
      { value: "llama-3.3-70b-versatile",        label: "Llama 3.3 70B Versatile" },
      { value: "llama-3.1-70b-versatile",        label: "Llama 3.1 70B Versatile" },
      { value: "llama-3.1-8b-instant",           label: "Llama 3.1 8B Instant" },
      { value: "llama3-70b-8192",                label: "Llama 3 70B (8K ctx)" },
      { value: "llama3-8b-8192",                 label: "Llama 3 8B (8K ctx)" },
      { value: "mixtral-8x7b-32768",             label: "Mixtral 8x7B" },
      { value: "gemma2-9b-it",                   label: "Gemma 2 9B IT" },
      { value: "gemma-7b-it",                    label: "Gemma 7B IT" },
      { value: "deepseek-r1-distill-llama-70b",  label: "DeepSeek R1 Distill Llama 70B" },
    ],
    openai: [
      { value: "gpt-5",            label: "GPT-5" },
      { value: "gpt-5-mini",       label: "GPT-5 Mini" },
      { value: "o3",               label: "o3" },
      { value: "o3-mini",          label: "o3-mini" },
      { value: "o1",               label: "o1" },
      { value: "o1-mini",          label: "o1-mini" },
      { value: "o1-preview",       label: "o1-preview" },
      { value: "gpt-4o",           label: "GPT-4o" },
      { value: "gpt-4o-mini",      label: "GPT-4o Mini" },
      { value: "gpt-4-turbo",      label: "GPT-4 Turbo" },
      { value: "gpt-4",            label: "GPT-4" },
      { value: "gpt-3.5-turbo",    label: "GPT-3.5 Turbo" },
    ],
    claude: [
      { value: "claude-opus-4-5",              label: "Claude 4.5 Opus" },
      { value: "claude-sonnet-4-5",            label: "Claude 4.5 Sonnet" },
      { value: "claude-opus-4-1",              label: "Claude 4.1 Opus" },
      { value: "claude-sonnet-4",              label: "Claude 4 Sonnet" },
      { value: "claude-3-7-sonnet-20250219",   label: "Claude 3.7 Sonnet" },
      { value: "claude-3-5-sonnet-20241022",   label: "Claude 3.5 Sonnet (v2)" },
      { value: "claude-3-5-sonnet-20240620",   label: "Claude 3.5 Sonnet (v1)" },
      { value: "claude-3-5-haiku-20241022",    label: "Claude 3.5 Haiku" },
      { value: "claude-3-opus-20240229",       label: "Claude 3 Opus" },
      { value: "claude-3-sonnet-20240229",     label: "Claude 3 Sonnet" },
      { value: "claude-3-haiku-20240307",      label: "Claude 3 Haiku" },
    ],
    mistral: [
      { value: "mistral-large-latest",       label: "Mistral Large" },
      { value: "mistral-medium-latest",      label: "Mistral Medium" },
      { value: "mistral-small-latest",       label: "Mistral Small" },
      { value: "open-mistral-nemo",          label: "Mistral Nemo" },
      { value: "codestral-latest",           label: "Codestral" },
    ],
    deepseek: [
      { value: "deepseek-chat",      label: "DeepSeek Chat (V3)" },
      { value: "deepseek-reasoner",  label: "DeepSeek Reasoner (R1)" },
      { value: "deepseek-coder",     label: "DeepSeek Coder" },
    ],
  };

  // Auto-detect provider from the first API key in the textarea.
  // Returns provider id or null. Patterns are based on official key prefixes.
  const detectProvider = (text) => {
    if (!text) return null;
    const k = text.split(",")[0].trim();
    if (!k) return null;
    if (k.startsWith("sk-ant-"))                 return "claude";
    if (k.startsWith("gsk_"))                    return "groq";
    if (k.startsWith("sk-proj-") || k.startsWith("sk-svcacct-") || k.startsWith("sk-")) return "openai";
    if (k.startsWith("AIza") || k.startsWith("AQ.")) return "gemini";
    // Mistral keys are 32-char hex (no prefix). DeepSeek keys start with sk- too,
    // but those collide with OpenAI — we keep OpenAI as the default for sk-*.
    if (/^[a-zA-Z0-9]{32}$/.test(k))             return "mistral";
    return null;
  };
  const [configLoading, setConfigLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchConfigs();
    refreshAllKeyLists();
  }, []);

  // Helper: immutably patch aiState[purpose][provider]
  const patchPP = (purpose, provider, patch) =>
    setAiState(prev => ({
      ...prev,
      [purpose]: {
        ...prev[purpose],
        [provider]: { ...prev[purpose][provider], ...patch },
      },
    }));

  const refreshAllKeyLists = async () => {
    try {
      const summary = await getAiSummary();
      if (!summary.success) return;
      const promises = [];
      for (const purpose of ["pdf", "text"]) {
        for (const provider of ALL_PROVIDERS) {
          const s = summary.summary[purpose]?.[provider];
          if (!s) continue;
          // store model from summary; load keys list only if there are any
          patchPP(purpose, provider, { model: s.model || defaultModelMap[provider] });
          if (s.count > 0) {
            promises.push(refreshKeyList(purpose, provider));
          }
        }
      }
      await Promise.all(promises);
    } catch (e) {
      console.error("Failed to load AI summary:", e);
    }
  };

  const refreshKeyList = async (purpose, provider) => {
    try {
      const r = await listAiKeys(purpose, provider);
      if (r.success) {
        patchPP(purpose, provider, { list: r.keys || [], model: r.model || defaultModelMap[provider] });
      }
    } catch (e) {
      console.error(`Failed to load ${purpose}/${provider} keys:`, e);
    }
  };

  // Field updates inside the active provider card
  const updateActiveCard = (field, value) => {
    const purpose = configSubTab;
    const provider = activeProvider[purpose];
    const patch = { [field]: value };
    if (field === "model") {
      patch.modelManuallyChanged = true;
    }
    if (field === "newKeys") {
      patch.keysDirty = true;
      // Auto-detect: if pasted key belongs to a different provider, swap the chip
      const detected = detectProvider(value);
      if (detected && detected !== provider) {
        setActiveProvider(prev => ({ ...prev, [purpose]: detected }));
        // Move the typed value to the detected provider's card so user keeps typing there
        patchPP(purpose, detected, { newKeys: value, keysDirty: true });
        // Clear the current provider's textarea since we redirected the input
        patchPP(purpose, provider, { newKeys: "", keysDirty: false });
        return;
      }
    }
    patchPP(purpose, provider, patch);
  };

  const handleSaveCard = async () => {
    const purpose = configSubTab;
    const provider = activeProvider[purpose];
    const card = aiState[purpose][provider];
    try {
      setConfigLoading(true);
      let added = 0;
      let autoPickedModel = null;
      let autoPickedSource = null;
      if (card.keysDirty && card.newKeys.trim()) {
        // Add the key WITHOUT a model override — let backend auto-discover the
        // best model this key has access to. If user manually changed the model
        // dropdown, send that as an override instead.
        const explicitModel = card.modelManuallyChanged ? card.model : undefined;
        const r = await apiAddAiKeys(purpose, provider, card.newKeys, explicitModel);
        added = r.added || 0;
        autoPickedModel = r.autoPickedModel;
        autoPickedSource = r.autoPickedSource;
      } else {
        // No new key — just persist the model dropdown choice
        await apiSetProviderModel(purpose, provider, card.model);
      }
      patchPP(purpose, provider, { newKeys: "", keysDirty: false, modelManuallyChanged: false });
      await refreshKeyList(purpose, provider);
      const purposeLabel = purpose === "pdf" ? "PDF Reading" : "Text Generation";
      const providerLabel = providerLabels[provider];
      let msg;
      if (card.keysDirty) {
        msg = `${added} key${added === 1 ? "" : "s"} added to ${providerLabel} (${purposeLabel}).`;
        if (autoPickedModel && autoPickedSource && autoPickedSource !== "default") {
          msg += ` Model auto-selected: ${autoPickedModel} (${autoPickedSource === "listed" ? "discovered from key's available models" : "verified via probe"}).`;
        }
        msg += " Form cleared — ready for the next key.";
      } else {
        msg = `${providerLabel} model saved for ${purposeLabel}.`;
      }
      showModal("success", "Saved", msg);
    } catch (error) {
      const msg = error?.response?.data?.message || "Failed to save settings. Please try again.";
      showModal("error", "Save Rejected", msg);
    } finally {
      setConfigLoading(false);
    }
  };

  const handleTestStoredKey = async (purpose, provider, index) => {
    const card = aiState[purpose][provider];
    patchPP(purpose, provider, { testStatus: { ...card.testStatus, [index]: { state: "testing" } } });
    try {
      const r = await testStoredAiKey(purpose, provider, index);
      const status = {
        state: r.success ? "ok" : "fail",
        message: r.message,
        latencyMs: r.latencyMs,
        modelUsed: r.modelUsed,
        autoSwitchedModelFrom: r.autoSwitchedModelFrom,
      };
      patchPP(purpose, provider, {
        testStatus: { ...aiState[purpose][provider].testStatus, [index]: status },
      });
      // If the backend auto-fixed a dead model, refresh so the new model
      // shows in the dropdown and table.
      if (r.autoSwitchedModelFrom) {
        await refreshKeyList(purpose, provider);
      }
    } catch (e) {
      patchPP(purpose, provider, {
        testStatus: { ...aiState[purpose][provider].testStatus, [index]: { state: "fail", message: e?.response?.data?.message || e.message } },
      });
    }
  };

  const handleDeleteStoredKey = (purpose, provider, index, snippet) => {
    setPendingKeyDelete({ purpose, provider, index, snippet });
    showModal(
      "warning",
      "Delete API Key?",
      `This will permanently remove key #${index + 1} (${snippet}) from the ${providerLabels[provider]} pool under ${purpose === "pdf" ? "PDF Reading" : "Text Generation"}. This cannot be undone.`
    );
  };

  const confirmDeleteKey = async () => {
    if (!pendingKeyDelete) return;
    const { purpose, provider, index } = pendingKeyDelete;
    try {
      setActionLoading(`delete-key-${purpose}-${provider}-${index}`);
      await apiDeleteAiKey(purpose, provider, index);
      await refreshKeyList(purpose, provider);
      showModal("success", "Key Deleted", "API key removed from the pool.");
    } catch (e) {
      showModal("error", "Error", "Failed to delete key. Please try again.");
    } finally {
      setActionLoading(null);
      setPendingKeyDelete(null);
    }
  };

  const handleTestInlineKey = async () => {
    const purpose = configSubTab;
    const provider = activeProvider[purpose];
    const card = aiState[purpose][provider];
    const firstKey = (card.newKeys || "").split(",")[0]?.trim();
    if (!firstKey) {
      showModal("warning", "No new key", "Type a key in the textarea first.");
      return;
    }
    const id = `${purpose}-${provider}`;
    setInlineTestStatus(s => ({ ...s, [id]: { state: "testing" } }));
    try {
      const r = await testInlineAiKey(provider, card.model, firstKey);
      setInlineTestStatus(s => ({
        ...s,
        [id]: { state: r.success ? "ok" : "fail", message: r.message, latencyMs: r.latencyMs },
      }));
    } catch (e) {
      setInlineTestStatus(s => ({ ...s, [id]: { state: "fail", message: e?.response?.data?.message || e.message } }));
    }
  };

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
    // Per-provider models/keys come via refreshAllKeyLists (uses /ai-summary).
    // This keeps the configs endpoint live for future non-AI settings.
    try { await getAllConfigs(); } catch (e) { console.error("fetchConfigs:", e); }
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
                  <div className="flex flex-wrap gap-2">
                    <Link to="/instructor/students" className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl transition-all duration-300 font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl">
                      <FaPlus /> Add User
                    </Link>
                    <button onClick={fetchUsers} className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl transition-all duration-300 font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl">
                      <FaSync className="animate-spin-on-hover" /> Refresh
                    </button>
                  </div>
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
                              <div className="flex flex-wrap gap-2">
                                {userData.role !== "admin" && (
                                  <button
                                    onClick={() => handleRoleChange(userData.id, "admin", userData.name, userData.email)}
                                    disabled={actionLoading === `role-${userData.id}`}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-[10px] font-bold transition-colors disabled:opacity-50"
                                  >
                                    {actionLoading === `role-${userData.id}` ? "..." : "→ Admin"}
                                  </button>
                                )}
                                {userData.role !== "instructor" && (
                                  <button
                                    onClick={() => handleRoleChange(userData.id, "instructor", userData.name, userData.email)}
                                    disabled={actionLoading === `role-${userData.id}`}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-[10px] font-bold transition-colors disabled:opacity-50"
                                  >
                                    {actionLoading === `role-${userData.id}` ? "..." : "→ Inst."}
                                  </button>
                                )}
                                {userData.role !== "student" && (
                                  <button
                                    onClick={() => handleRoleChange(userData.id, "student", userData.name, userData.email)}
                                    disabled={actionLoading === `role-${userData.id}`}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg text-[10px] font-bold transition-colors disabled:opacity-50"
                                  >
                                    {actionLoading === `role-${userData.id}` ? "..." : "→ Stud."}
                                  </button>
                                )}
                                <button 
                                  onClick={() => handleDeleteUser(userData.id, userData.name)} 
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete User"
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
          </>
        ) : (
          <Card className="shadow-2xl border-2 border-gray-200 rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-pink-600 to-purple-600 text-white border-b-2 border-pink-700">
              <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2"><FaKey className="text-2xl" /> System API Key Management</h2>
            </CardHeader>
            <CardContent className="p-6 sm:p-8 lg:p-10">
              <div className="max-w-4xl space-y-8">
                {/* Sub-tab switcher */}
                <div className="flex flex-wrap gap-3 border-b border-gray-200 pb-3">
                  <button
                    onClick={() => setConfigSubTab("pdf")}
                    className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${configSubTab === "pdf" ? "bg-purple-600 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                  >
                    📄 PDF Reading
                  </button>
                  <button
                    onClick={() => setConfigSubTab("text")}
                    className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${configSubTab === "text" ? "bg-pink-600 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                  >
                    ✍️ Text Generation
                  </button>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-xl">
                  <div className="flex items-start gap-3">
                    <FaCog className="text-blue-500 animate-spin-slow mt-0.5" />
                    <div>
                      <h4 className="font-bold text-blue-800">
                        {configSubTab === "pdf" ? "PDF Reading — API Keys" : "Text Generation — API Keys"}
                      </h4>
                      <p className="text-sm text-blue-700">
                        {configSubTab === "pdf"
                          ? "Used when the system extracts content from uploaded PDFs."
                          : "Used when the system generates questions, feedback, and answers."}
                        {" Multiple keys (comma-separated) are load-balanced automatically. Keys are stored encrypted in the database — never shown again after save."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Provider chip strip */}
                {(() => {
                  const purpose = configSubTab;
                  const provider = activeProvider[purpose];
                  const card = aiState[purpose][provider];
                  const accent = purpose === "pdf" ? "from-purple-600 to-pink-600" : "from-pink-600 to-purple-600";
                  const chipColors = {
                    gemini:   { active: "bg-blue-600 text-white",     idle: "bg-blue-50 text-blue-700 hover:bg-blue-100" },
                    groq:     { active: "bg-orange-600 text-white",   idle: "bg-orange-50 text-orange-700 hover:bg-orange-100" },
                    openai:   { active: "bg-emerald-600 text-white",  idle: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" },
                    claude:   { active: "bg-amber-600 text-white",    idle: "bg-amber-50 text-amber-700 hover:bg-amber-100" },
                    mistral:  { active: "bg-rose-600 text-white",     idle: "bg-rose-50 text-rose-700 hover:bg-rose-100" },
                    deepseek: { active: "bg-indigo-600 text-white",   idle: "bg-indigo-50 text-indigo-700 hover:bg-indigo-100" },
                  };
                  return (
                    <>
                      <div className="flex flex-wrap gap-2">
                        {ALL_PROVIDERS.map(p => {
                          const isActive = p === provider;
                          const count = aiState[purpose][p].list.length;
                          const c = chipColors[p];
                          return (
                            <button
                              key={p}
                              onClick={() => setActiveProvider(prev => ({ ...prev, [purpose]: p }))}
                              className={`px-4 py-2 rounded-lg font-bold text-xs transition-all ${isActive ? c.active + " shadow-md" : c.idle}`}
                            >
                              {providerLabels[p]}
                              {count > 0 && (
                                <span className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] ${isActive ? "bg-white/20" : "bg-white"}`}>
                                  {count}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      <div className="space-y-6 mt-2">
                        {/* Model dropdown for the active (purpose × provider) */}
                        <div>
                          <label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                            Model for {providerLabels[provider]}
                          </label>
                          <select
                            value={card.model}
                            onChange={(e) => updateActiveCard("model", e.target.value)}
                            className="w-full md:w-1/2 px-4 py-3 border-2 border-gray-200 rounded-xl outline-none text-sm font-semibold"
                          >
                            {(modelOptions[provider] || []).map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>

                        {/* Add-key textarea */}
                        <div>
                          <label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                            Add New {providerLabels[provider]} API Key{" "}
                            <span className="font-normal text-gray-500">(comma-separated for bulk add)</span>
                          </label>
                          <textarea
                            value={card.newKeys}
                            onChange={(e) => updateActiveCard("newKeys", e.target.value)}
                            rows="3"
                            className={`w-full px-4 py-3 border-2 rounded-xl outline-none text-sm font-mono ${card.keysDirty ? "border-purple-300 bg-purple-50/30" : "border-gray-200"}`}
                            placeholder={`Paste your ${providerLabels[provider]} key here — pasting a different provider's key auto-switches the chip above`}
                          />
                          <p className="text-xs text-gray-500 mt-2">
                            {card.keysDirty
                              ? `Will be added to the ${providerLabels[provider]} pool when you save. Form clears after.`
                              : `Type or paste a key. Auto-detects and switches provider if the prefix doesn't match.`}
                          </p>
                        </div>

                        {/* Inline test + Save */}
                        <div className="flex flex-wrap items-center gap-3">
                          {card.keysDirty && (
                            <>
                              <button
                                type="button"
                                onClick={handleTestInlineKey}
                                className="px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-xs font-bold transition-colors"
                              >
                                🔍 Test Before Saving
                              </button>
                              {inlineTestStatus[`${purpose}-${provider}`] && (
                                <TestResultPill r={inlineTestStatus[`${purpose}-${provider}`]} />
                              )}
                            </>
                          )}
                          <button
                            onClick={handleSaveCard}
                            disabled={configLoading}
                            className={`flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r ${accent} text-white rounded-xl font-bold shadow-lg hover:scale-[1.02] disabled:opacity-50`}
                          >
                            {configLoading ? <LoadingSpinner size="sm" /> : (
                              <><FaSave /> {card.keysDirty ? `Add Key & Save (${providerLabels[provider]})` : `Save ${providerLabels[provider]} Model`}</>
                            )}
                          </button>
                        </div>

                        {/* Stored keys table — ONLY this (purpose, provider) */}
                        <div className="mt-6">
                          <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                            🔑 {providerLabels[provider]} Keys
                            <span className="text-xs font-normal text-gray-500">({card.list.length} stored · {purpose === "pdf" ? "PDF Reading" : "Text Generation"})</span>
                          </h4>
                          {card.list.length === 0 ? (
                            <div className="text-sm text-gray-500 italic px-4 py-6 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-center">
                              No {providerLabels[provider]} keys stored yet. Add one above.
                            </div>
                          ) : (
                            <div className="overflow-x-auto rounded-xl border-2 border-gray-200">
                              <table className="w-full text-sm">
                                <thead className="bg-gradient-to-r from-gray-100 to-purple-50">
                                  <tr className="text-left">
                                    <th className="px-4 py-3 text-xs font-bold text-gray-700 uppercase">#</th>
                                    <th className="px-4 py-3 text-xs font-bold text-gray-700 uppercase">Masked Key</th>
                                    <th className="px-4 py-3 text-xs font-bold text-gray-700 uppercase">Model</th>
                                    <th className="px-4 py-3 text-xs font-bold text-gray-700 uppercase">Status</th>
                                    <th className="px-4 py-3 text-xs font-bold text-gray-700 uppercase">Actions</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                  {card.list.map((k) => {
                                    const status = card.testStatus[k.index];
                                    const delLoading = actionLoading === `delete-key-${purpose}-${provider}-${k.index}`;
                                    return (
                                      <tr key={k.index} className="hover:bg-purple-50/40">
                                        <td className="px-4 py-3 text-gray-600 font-mono">{k.index + 1}</td>
                                        <td className="px-4 py-3 font-mono text-gray-800">{k.snippet}</td>
                                        <td className="px-4 py-3 text-xs text-gray-600 font-mono">{card.model}</td>
                                        <td className="px-4 py-3">
                                          {status ? <TestResultPill r={status} /> : <span className="text-xs text-gray-400">Not tested</span>}
                                        </td>
                                        <td className="px-4 py-3">
                                          <div className="flex gap-2">
                                            <button
                                              onClick={() => handleTestStoredKey(purpose, provider, k.index)}
                                              disabled={status?.state === "testing"}
                                              className="px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md text-xs font-bold transition-colors disabled:opacity-50"
                                            >
                                              {status?.state === "testing" ? "Testing…" : "Test"}
                                            </button>
                                            <button
                                              onClick={() => handleDeleteStoredKey(purpose, provider, k.index, k.snippet)}
                                              disabled={delLoading}
                                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-md text-xs font-bold transition-colors disabled:opacity-50"
                                              title="Remove this key from the pool"
                                            >
                                              <FaTrash />
                                              {delLoading ? "Deleting…" : "Delete"}
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      <Modal
        isOpen={modal.isOpen}
        onClose={() => { setModal({ ...modal, isOpen: false }); setPendingDelete(null); setPendingKeyDelete(null); }}
        onConfirm={pendingDelete ? confirmDeleteUser : (pendingKeyDelete ? confirmDeleteKey : undefined)}
        type={modal.type}
        title={modal.title}
        loading={
          (pendingDelete && actionLoading === `delete-${pendingDelete.userId}`) ||
          (pendingKeyDelete && actionLoading === `delete-key-${pendingKeyDelete.purpose}-${pendingKeyDelete.provider}-${pendingKeyDelete.index}`)
        }
        confirmText={pendingKeyDelete ? "Delete Key" : "Delete User"}
      >
        {modal.message}
      </Modal>
    </div>
  );
}

export default SuperAdminDashboard;
