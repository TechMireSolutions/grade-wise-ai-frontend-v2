import apiClient from "../lib/apiClient.js";

export const getAllConfigs = async () => {
  const response = await apiClient.get("/config");
  return response.data;
};

export const updateConfig = async (configData) => {
  const response = await apiClient.post("/config/update", configData);
  return response.data;
};

export const bulkUpdateConfigs = async (configs) => {
  const response = await apiClient.post("/config/bulk-update", { configs });
  return response.data;
};

export const listAiKeys = async (purpose) => {
  const response = await apiClient.get(`/config/ai-keys?purpose=${encodeURIComponent(purpose)}`);
  return response.data;
};

export const addAiKeys = async (purpose, keys) => {
  const response = await apiClient.post("/config/ai-keys/add", { purpose, keys });
  return response.data;
};

export const deleteAiKey = async (purpose, index) => {
  const response = await apiClient.delete("/config/ai-keys", { data: { purpose, index } });
  return response.data;
};

export const testStoredAiKey = async (purpose, index) => {
  const response = await apiClient.post("/config/ai-keys/test", { purpose, index });
  return response.data;
};

export const testInlineAiKey = async (provider, model, key) => {
  const response = await apiClient.post("/config/ai-keys/test-inline", { provider, model, key });
  return response.data;
};