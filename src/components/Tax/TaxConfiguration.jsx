import React, { useState, useEffect } from 'react';
import taxService from '../../services/taxService';

const TaxConfiguration = () => {
  const [configurations, setConfigurations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    establishmentId: '',
    name: '',
    rate: '',
    type: 'percentage',
    applicableTo: [],
    active: true
  });

  useEffect(() => {
    loadConfigurations();
  }, []);

  const loadConfigurations = async () => {
    try {
      const data = await taxService.getTaxConfigurations();
      setConfigurations(data.data || []);
    } catch (error) {
      setError('Failed to load tax configurations');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await taxService.createTaxConfiguration(formData);
      setShowForm(false);
      setFormData({
        establishmentId: '',
        name: '',
        rate: '',
        type: 'percentage',
        applicableTo: [],
        active: true
      });
      loadConfigurations();
    } catch (error) {
      setError('Failed to create tax configuration');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="tax-configuration">
      <div className="header">
        <h2>Tax Configurations</h2>
        <button onClick={() => setShowForm(true)}>Add New Configuration</button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <div className="modal">
          <form onSubmit={handleSubmit} className="tax-form">
            <h3>New Tax Configuration</h3>
            
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Rate:</label>
              <input
                type="number"
                step="0.01"
                value={formData.rate}
                onChange={(e) => setFormData({...formData, rate: e.target.value})}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Type:</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                <option value="percentage">Percentage</option>
                <option value="fixed_per_night">Fixed per Night</option>
                <option value="fixed_amount">Fixed Amount</option>
              </select>
            </div>
            
            <div className="form-actions">
              <button type="submit">Save</button>
              <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="configurations-list">
        {configurations.map(config => (
          <div key={config.id} className="configuration-item">
            <h4>{config.name}</h4>
            <p>Rate: {config.rate}% ({config.type})</p>
            <p>Status: {config.active ? 'Active' : 'Inactive'}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaxConfiguration;