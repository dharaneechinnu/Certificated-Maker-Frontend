import axios from 'axios'

const Api = axios.create({
    baseURL: 'https://certificated-maker.onrender.com',
})

export default Api;