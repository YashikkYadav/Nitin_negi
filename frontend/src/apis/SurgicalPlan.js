import axiosAuthenticator from "@/plugins/axios";

// Create a new surgical plan
export const createSurgicalPlan = async (data) =>
  await new axiosAuthenticator().post('/surgical-plan', data);

// Get surgical plan by IPD record ID
export const getSurgicalPlanByIpdId = async (ipdRecordId) =>
  await new axiosAuthenticator().get(`/surgical-plan/${ipdRecordId}`);

// Get all surgical plans
export const getAllSurgicalPlans = async () =>
  await new axiosAuthenticator().get('/surgical-plan');
