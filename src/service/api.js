import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api', 
});

export default {

  async getItems() {
    const response = await api.get('/medidas');
    return response.data;
  },

  async addItem(item) {
    const response = await api.post('/medidas', item);
    return response.data;
  },


  async updateItem(id, item) {
    const response = await api.put(`/medidas/${id}`, item);
    return response.data;
  },


  async deleteItem(id) {
    await api.delete(`/medidas/${id}`);
  },
};