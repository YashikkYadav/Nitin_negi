import axiosAuthenticator from "@/plugins/axios";

export const getAllIPD = async (search = "", page = 1, limit = 25) => {
  let url = `/ipd?page=${page}&limit=${limit}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  return (await new axiosAuthenticator().get(url)).ipds;
};
export const getIPDDashboard = async (period = 'daily') => await new axiosAuthenticator().get(`/ipd/dashboard?period=${period}`);
export const createIPD = async (data) => await new axiosAuthenticator().post('/ipd', data);
export const updateIPD = async (id, data) => await new axiosAuthenticator().put(`/ipd/${id}`, data);
export const deleteIPD = async (id) => await new axiosAuthenticator().delete(`/ipd/${id}`);