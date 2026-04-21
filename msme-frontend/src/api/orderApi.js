import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://14.195.7.178:5000/api',
  withCredentials: true,
})

export const getOrders         = ()      => API.get('/orders').then(r => r.data)
export const updateOrderStatus = (id, status) => API.put(`/orders/${id}`, { status }).then(r => r.data)
