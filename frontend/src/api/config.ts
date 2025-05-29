import axios from 'axios'
import Cookies from 'js-cookie';


const backendBaseURL = 'http://localhost:8080/api/'
// const geoserverBaseURL = 'http://localhost:8080'

const api = axios.create({ baseURL: backendBaseURL });

api.interceptors.request.use((config) => {
const token = Cookies.get('admin-jwt')
if (token) {
config.headers.Authorization = `Bearer ${token}`
}
return config
})

export default api
 