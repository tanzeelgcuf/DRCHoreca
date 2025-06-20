import httpClient from './httpClient';

class EstablishmentService {
  async getAllEstablishments(params = {}) {
    const response = await httpClient.get('/establishments', { params });
    return response.data;
  }

  async getEstablishment(id) {
    const response = await httpClient.get(`/establishments/${id}`);
    return response.data;
  }

  async createEstablishment(data) {
    const response = await httpClient.post('/establishments', data);
    return response.data;
  }

  async updateEstablishment(id, data) {
    const response = await httpClient.put(`/establishments/${id}`, data);
    return response.data;
  }

  async registerDRCHotel(data) {
    const response = await httpClient.post('/establishments/register-drc-hotel', data);
    return response.data;
  }

  async getEstablishmentStats(id, params = {}) {
    const response = await httpClient.get(`/establishments/${id}/stats`, { params });
    return response.data;
  }
}

export default new EstablishmentService();