// Use relative URLs in development, absolute URLs in production
export const API_URL = import.meta.env.PROD
  ? 'https://api.cadremarkets.com/api'
  : '/api';

export const backOfficeApi = {
  login: async (credentials) => {
    const response = await fetch(`${API_URL}/backoffice/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to login');
    }

    return response.json();
  },

  logout: async () => {
    const response = await fetch(`${API_URL}/backoffice/logout`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to logout');
    }

    return response.json();
  }
};

export const projectsApi = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/projects`, {
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch projects');
    }

    return response.json();
  },

  getById: async (id) => {
    const response = await fetch(`${API_URL}/projects/${id}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch project');
    }

    return response.json();
  },

  create: async (formData) => {
    const response = await fetch(`${API_URL}/projects`, {
      method: 'POST',
      credentials: 'include',
      body: formData, // FormData for file uploads
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create project');
    }

    return response.json();
  },

  update: async (id, formData) => {
    const response = await fetch(`${API_URL}/projects/${id}`, {
      method: 'PUT',
      credentials: 'include',
      body: formData, // FormData for file uploads
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update project');
    }

    return response.json();
  },

  delete: async (id) => {
    const response = await fetch(`${API_URL}/projects/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete project');
    }

    return response.json();
  },

  updateStatus: async (id, status) => {
    const response = await fetch(`${API_URL}/projects/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update project status');
    }

    return response.json();
  },
}; 