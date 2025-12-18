// API configuration for HostelGo backend
const API_BASE_URL = 'http://localhost:5000';

// Types
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'owner' | 'admin';
}

export interface Hostel {
  id: number;
  name: string;
  address: string;
  city: string;
  rent: number;
  facilities: string;
  owner_id: number;
  is_verified: number;
}

export interface Review {
  id: number;
  rating: number;
  comment: string;
  hostel_id: number;
  student_id: number;
  student_name?: string;
}

// Get stored credentials
const getCredentials = () => {
  const user = localStorage.getItem('hostelgo_user');
  if (!user) return null;
  const parsed = JSON.parse(user);
  return {
    email: parsed.email,
    password: localStorage.getItem('hostelgo_password') || ''
  };
};

// Helper to add auth headers
const getAuthHeaders = (): HeadersInit => {
  const creds = getCredentials();
  if (!creds) return { 'Content-Type': 'application/json' };
  return {
    'Content-Type': 'application/json',
    'X-User-Email': creds.email,
    'X-User-Password': creds.password
  };
};

// Auth API
export const authApi = {
  signup: async (name: string, email: string, password: string, role: string): Promise<{ user: User }> => {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Signup failed');
    }
    return response.json();
  },

  login: async (email: string, password: string): Promise<{ user: User }> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }
    return response.json();
  }
};

// Hostel API
export const hostelApi = {
  getAll: async (): Promise<Hostel[]> => {
    const response = await fetch(`${API_BASE_URL}/hostels`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch hostels');
    return response.json();
  },

  search: async (params: { city?: string; maxRent?: number; facility?: string }): Promise<Hostel[]> => {
    const searchParams = new URLSearchParams();
    if (params.city) searchParams.append('city', params.city);
    if (params.maxRent) searchParams.append('maxRent', params.maxRent.toString());
    if (params.facility) searchParams.append('facility', params.facility);
    
    const response = await fetch(`${API_BASE_URL}/hostels/search?${searchParams}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to search hostels');
    return response.json();
  },

  getById: async (id: number): Promise<Hostel> => {
    const response = await fetch(`${API_BASE_URL}/hostels/${id}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Hostel not found');
    return response.json();
  },

  create: async (hostel: Omit<Hostel, 'id' | 'owner_id' | 'is_verified'>): Promise<{ hostel: Hostel }> => {
    const creds = getCredentials();
    const response = await fetch(`${API_BASE_URL}/hostels`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ ...hostel, email: creds?.email, password: creds?.password })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create hostel');
    }
    return response.json();
  },

  update: async (id: number, hostel: Partial<Hostel>): Promise<{ hostel: Hostel }> => {
    const creds = getCredentials();
    const response = await fetch(`${API_BASE_URL}/hostels/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ ...hostel, email: creds?.email, password: creds?.password })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update hostel');
    }
    return response.json();
  },

  delete: async (id: number): Promise<void> => {
    const creds = getCredentials();
    const response = await fetch(`${API_BASE_URL}/hostels/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      body: JSON.stringify({ email: creds?.email, password: creds?.password })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete hostel');
    }
  }
};

// Admin API
export const adminApi = {
  getAllHostels: async (): Promise<Hostel[]> => {
    const creds = getCredentials();
    const response = await fetch(`${API_BASE_URL}/admin/hostels`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch hostels');
    return response.json();
  },

  verifyHostel: async (id: number): Promise<{ hostel: Hostel }> => {
    const creds = getCredentials();
    const response = await fetch(`${API_BASE_URL}/admin/verify-hostel/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ email: creds?.email, password: creds?.password })
    });
    if (!response.ok) throw new Error('Failed to verify hostel');
    return response.json();
  },

  unverifyHostel: async (id: number): Promise<{ hostel: Hostel }> => {
    const creds = getCredentials();
    const response = await fetch(`${API_BASE_URL}/admin/unverify-hostel/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ email: creds?.email, password: creds?.password })
    });
    if (!response.ok) throw new Error('Failed to unverify hostel');
    return response.json();
  }
};

// Review API
export const reviewApi = {
  create: async (hostelId: number, rating: number, comment: string): Promise<{ review: Review }> => {
    const creds = getCredentials();
    const response = await fetch(`${API_BASE_URL}/reviews`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        email: creds?.email,
        password: creds?.password,
        hostel_id: hostelId,
        rating,
        comment
      })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create review');
    }
    return response.json();
  },

  getByHostel: async (hostelId: number): Promise<Review[]> => {
    const response = await fetch(`${API_BASE_URL}/reviews/hostel/${hostelId}`);
    if (!response.ok) throw new Error('Failed to fetch reviews');
    return response.json();
  }
};
