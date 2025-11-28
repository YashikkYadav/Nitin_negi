import axiosAuthenticator from "@/plugins/axios";

export const getAllProcedures = async (search = "") => (await new axiosAuthenticator().get(`/procedures${search ? `?search=${encodeURIComponent(search)}` : ''}`)).procedures;

export const createProcedure = async (data) => {
  const res = await new axiosAuthenticator().post('/procedures', data);
  return res.data;
};

export const updateProcedure = async (id, data) => {
  const res = await new axiosAuthenticator().put(`/procedures/${id}`, data);
  return res.data;
};

export const markStentRemoved = async (id) => {
  const res = await new axiosAuthenticator().patch(`/procedures/${id}/stent-removed`);
  return res.data;
};

export const getProcedureDashboard = async (period = 'daily') => {
  const res = await new axiosAuthenticator().get(`/procedures/dashboard?period=${period}`);
  return res;
}; 