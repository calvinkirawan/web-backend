import axios from 'axios';

// We create an "instance" so we don't have to 
// type 'http://localhost:3000' in every single file.
const api = axios.create({
    baseURL: 'http://localhost:3000',
});

export default api;