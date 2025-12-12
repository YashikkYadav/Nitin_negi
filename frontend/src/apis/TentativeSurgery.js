import axiosAuthenticator from "@/plugins/axios";

// Create a new tentative surgery
export const createTentativeSurgery = async (data) =>
  await new axiosAuthenticator().post("/tentative-surgeries", data);

// Update tentative surgery by ID
export const updateTentativeSurgery = async (id, data) =>
  await new axiosAuthenticator().put(`/tentative-surgeries/${id}`, data);

// Get tentative surgery by ID
export const getTentativeSurgeryById = async (id) =>
  await new axiosAuthenticator().get(`/tentative-surgeries/${id}`);

// Get all tentative surgeries
export const getAllTentativeSurgeries = async () =>
  await new axiosAuthenticator().get("/tentative-surgeries");

// Get all tentative surgeries by patient ID
export const getTentativeSurgeriesByPatientId = async (patientId) =>
  await new axiosAuthenticator().get(
    `/tentative-surgeries/patient/${patientId}`
  );
