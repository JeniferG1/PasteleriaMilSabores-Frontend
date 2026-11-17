import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'http://3.81.23.100:8080', 
    headers: {
        'Content-Type': 'application/json'
    }
});

export default axiosClient;