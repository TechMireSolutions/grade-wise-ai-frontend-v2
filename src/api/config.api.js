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