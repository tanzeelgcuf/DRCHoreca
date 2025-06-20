import httpClient from './httpClient';

class TaxService {
  // Tax Configurations
  async getTaxConfigurations(params = {}) {
    const response = await httpClient.get('/taxes/configurations', { params });
    return response.data;
  }

  async createTaxConfiguration(data) {
    const response = await httpClient.post('/taxes/configurations', data);
    return response.data;
  }

  async updateTaxConfiguration(id, data) {
    const response = await httpClient.put(`/taxes/configurations/${id}`, data);
    return response.data;
  }

  async deleteTaxConfiguration(id) {
    const response = await httpClient.delete(`/taxes/configurations/${id}`);
    return response.data;
  }

  // Tax Exemptions
  async getTaxExemptions(params = {}) {
    const response = await httpClient.get('/taxes/exemptions', { params });
    return response.data;
  }

  async createTaxExemption(data) {
    const response = await httpClient.post('/taxes/exemptions', data);
    return response.data;
  }

  // Tax Calculations
  async calculateTax(data) {
    const response = await httpClient.post('/taxes/calculate', data);
    return response.data;
  }

  // Tax Reports
  async getTaxReport(params = {}) {
    const response = await httpClient.get('/taxes/report', { params });
    return response.data;
  }

  // Admin Tax Rates (for admin users)
  async getAdminTaxRates() {
    const response = await httpClient.get('/admin/taxes/rates');
    return response.data;
  }

  async createAdminTaxRate(data) {
    const response = await httpClient.post('/admin/taxes/rates', data);
    return response.data;
  }
}

export default new TaxService();