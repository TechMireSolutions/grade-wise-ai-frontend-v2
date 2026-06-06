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

export const listAiKeys = async (purpose, provider) => {
  const response = await apiClient.get(`/config/ai-keys?purpose=${encodeURIComponent(purpose)}&provider=${encodeURIComponent(provider)}`);
  return response.data;
};

export const getAiSummary = async () => {
  const response = await apiClient.get("/config/ai-summary");
  return response.data;
};

export const addAiKeys = async (purpose, provider, keys, model) => {
  const response = await apiClient.post("/config/ai-keys/add", { purpose, provider, keys, model });
  return response.data;
};

export const setProviderModel = async (purpose, provider, model) => {
  const response = await apiClient.post("/config/ai-keys/model", { purpose, provider, model });
  return response.data;
};

export const deleteAiKey = async (purpose, provider, index) => {
  const response = await apiClient.delete("/config/ai-keys", { data: { purpose, provider, index } });
  return response.data;
};

export const testStoredAiKey = async (purpose, provider, index) => {
  const response = await apiClient.post("/config/ai-keys/test", { purpose, provider, index });
  return response.data;
};

export const testInlineAiKey = async (provider, model, key) => {
  const response = await apiClient.post("/config/ai-keys/test-inline", { provider, model, key });
  return response.data;
};