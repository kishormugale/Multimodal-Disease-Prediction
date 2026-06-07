const API_URL = '/api';

export const api = {
  async getPatients() {
    const res = await fetch(`${API_URL}/patients`);
    if (!res.ok) throw new Error('Failed to fetch patients');
    return res.json();
  },

  async createPatient(patientData) {
    const res = await fetch(`${API_URL}/patients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patientData),
    });
    if (!res.ok) throw new Error('Failed to create patient');
    return res.json();
  },

  /**
   * Run a disease prediction.
   * - For image diseases: pass the File object as `file`
   * - For tabular diseases: pass the params dict, leave `file` null
   */
  async predictDisease(diseaseId, params, file = null) {
    if (file) {
      // Image-based: send multipart/form-data
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_URL}/predict/${diseaseId}`, {
        method: 'POST',
        body: formData, // browser sets Content-Type automatically
      });
      if (!res.ok) throw new Error('Prediction failed');
      return res.json();
    }

    // Tabular: send JSON
    const res = await fetch(`${API_URL}/predict/${diseaseId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params || {}),
    });
    if (!res.ok) throw new Error('Prediction failed');
    return res.json();
  },

  async getReports() {
    const res = await fetch(`${API_URL}/reports`);
    if (!res.ok) throw new Error('Failed to fetch reports');
    return res.json();
  },

  async downloadReportPDF(reportId) {
    const res = await fetch(`${API_URL}/reports/${reportId}/pdf`);
    if (!res.ok) throw new Error('Failed to download PDF');
    const blob = await res.blob();
    
    // Trigger download
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KDM_Care_Report_${reportId}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  async forgotPassword(email) {
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(errorData.detail || 'Failed to send reset email');
      }
      
      return res.json();
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  },

  async resetPassword(token, newPassword) {
    const res = await fetch(`${API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, new_password: newPassword }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Failed to reset password');
    }
    return res.json();
  },

  async verifyResetToken(token) {
    const res = await fetch(`${API_URL}/auth/verify-reset-token/${token}`);
    if (!res.ok) throw new Error('Failed to verify token');
    return res.json();
  },
};
