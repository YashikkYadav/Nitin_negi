import axiosAuthenticator from "@/plugins/axios";

// Login does not require authentication
export const loginUser = async (email, password) => {
  return await new axiosAuthenticator(false).post('/user/login', { email, password });
};

export const getUsers = async () => {
  return await new axiosAuthenticator().get('/user');
};

export const createUser = async (user) => {
  return await new axiosAuthenticator().post('/user', user);
};

export const updateUser = async (userId, user) => {
  return await new axiosAuthenticator().put(`/user/${userId}`, user);
};

export const deleteUser = async (userId) => {
  return await new axiosAuthenticator().delete(`/user/${userId}`);
};

export const getUserById = async (userId) => {
  return await new axiosAuthenticator().get(`/user/${userId}`);
};
