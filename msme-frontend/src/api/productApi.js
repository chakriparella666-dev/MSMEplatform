import axios from 'axios'

const API = axios.create({
  baseURL: '/api',
  withCredentials: true,
})

export const getProducts        = ()      => API.get('/products').then(r => r.data)
export const getSellerProducts  = ()      => API.get('/products/seller/me').then(r => r.data)
export const addProduct         = (data)  => API.post('/products', data).then(r => r.data)
export const updateProduct      = (id, data) => API.put(`/products/${id}`, data).then(r => r.data)
export const deleteProduct      = (id)      => API.delete(`/products/${id}`).then(r => r.data)
export const updateProfile      = (data)  => API.put('/auth/update-profile', data).then(r => r.data) // Added for profile updates
