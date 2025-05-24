import axios from 'axios'

const backendBaseURL = 'http://localhost:8080/api/'
// const geoserverBaseURL = 'http://localhost:8080'

const api = axios.create({ baseURL: backendBaseURL })

api.interceptors.response.use(
  (response) => {
    if (response?.config?.url?.endsWith('/auth/login') && response.data.token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api
