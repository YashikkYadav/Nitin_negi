import axiosAuthenticator from "@/plugins/axios";


export const getDoctorById = async (doctorId) => {
  try {
    return await new axiosAuthenticator().get(`/doctor/${doctorId}`);
    
  } catch (error) {
    console.error('Error fetching doctor by ID:', error);
    throw error;
  }
};