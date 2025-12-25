// API configuration for HostelGo backend
// Uses environment variable for deployment flexibility
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://hostelgo.up.railway.app";

// Log API configuration on module load
console.log("🔧 API Configuration:", {
  VITE_API_URL: import.meta.env.VITE_API_URL || "not set",
  API_BASE_URL: API_BASE_URL,
  NODE_ENV: import.meta.env.MODE
});

if (!import.meta.env.VITE_API_URL) {
  console.warn("⚠️ VITE_API_URL is not defined, using default Railway URL:", API_BASE_URL);
}

// Types
export interface User {
  id: number;
  name: string;
  email: string;
  role: "student" | "owner" | "admin";
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
  owner_name?: string;
  owner_email?: string;
  owner_contact_number?: string;
  contact_number?: string;
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
  const user = localStorage.getItem("hostelgo_user");
  if (!user) return null;
  const parsed = JSON.parse(user);
  return {
    email: parsed.email,
    password: localStorage.getItem("hostelgo_password") || "",
  };
};

// Helper to add auth headers
const getAuthHeaders = (): HeadersInit => {
  const creds = getCredentials();
  if (!creds || !creds.email || !creds.password) {
    console.warn("No credentials found for API request");
    return { "Content-Type": "application/json" };
  }
  return {
    "Content-Type": "application/json",
    "X-User-Email": creds.email,
    "X-User-Password": creds.password,
  };
};

// Auth API
export const authApi = {
  signup: async (
    name: string,
    email: string,
    password: string,
    role: string
  ): Promise<{ user: User }> => {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Signup failed");
    }
    return response.json();
  },

  login: async (email: string, password: string): Promise<{ user: User }> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Login failed");
    }
    return response.json();
  },
};

// Hostel API
export const hostelApi = {
  // Public endpoint - no authentication required (for landing page)
  getPublic: async (): Promise<Hostel[]> => {
    const url = `${API_BASE_URL}/hostels/public`;
    console.log("🌐 Fetching public hostels from:", url);
    
    try {
      const response = await fetch(url, {
        headers: { "Content-Type": "application/json" },
      });
      
      console.log("📡 Response status:", response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Error response:", errorText);
        let error;
        try {
          error = JSON.parse(errorText);
        } catch {
          error = { error: errorText || `Failed to fetch hostels (${response.status})` };
        }
        throw new Error(error.error || `Failed to fetch hostels (${response.status})`);
      }
      
      const data = await response.json();
      console.log("✅ Received", Array.isArray(data) ? data.length : 0, "hostels");
      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      console.error("❌ Fetch error in getPublic:", error);
      // Return empty array instead of throwing to prevent UI breakage
      console.warn("⚠️ Returning empty array due to fetch error");
      return [];
    }
  },

  // Authenticated endpoint - requires login
  getAll: async (): Promise<Hostel[]> => {
    const response = await fetch(`${API_BASE_URL}/hostels`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Failed to fetch hostels" }));
      throw new Error(
        error.error || `Failed to fetch hostels (${response.status})`
      );
    }
    return response.json();
  },

  search: async (params: {
    city?: string;
    maxRent?: number;
    facility?: string;
  }): Promise<Hostel[]> => {
    const searchParams = new URLSearchParams();
    if (params.city) searchParams.append("city", params.city);
    if (params.maxRent)
      searchParams.append("maxRent", params.maxRent.toString());
    if (params.facility) searchParams.append("facility", params.facility);

    const response = await fetch(
      `${API_BASE_URL}/hostels/search?${searchParams}`,
      {
        headers: getAuthHeaders(),
      }
    );
    if (!response.ok) throw new Error("Failed to search hostels");
    return response.json();
  },

  getById: async (id: number): Promise<Hostel> => {
    const url = `${API_BASE_URL}/hostels/${id}`;
    console.log("🌐 Fetching hostel by ID:", id, "from:", url);
    
    try {
      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });
      
      console.log("📡 Response status:", response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Error response:", errorText);
        let error;
        try {
          error = JSON.parse(errorText);
        } catch {
          error = { error: errorText || `Failed to fetch hostel (${response.status})` };
        }
        throw new Error(error.error || `Failed to fetch hostel (${response.status})`);
      }
      
      const data = await response.json();
      console.log("✅ Received hostel data:", data.name || data.id);
      return data;
    } catch (error: any) {
      console.error("❌ Fetch error in getById:", error);
      throw error;
    }
  },

  create: async (
    hostel: Omit<Hostel, "id" | "owner_id" | "is_verified">
  ): Promise<{ hostel: Hostel }> => {
    const creds = getCredentials();
    const response = await fetch(`${API_BASE_URL}/hostels`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        ...hostel,
        email: creds?.email,
        password: creds?.password,
      }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create hostel");
    }
    return response.json();
  },

  update: async (
    id: number,
    hostel: Partial<Hostel>
  ): Promise<{ hostel: Hostel }> => {
    const creds = getCredentials();
    const response = await fetch(`${API_BASE_URL}/hostels/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        ...hostel,
        email: creds?.email,
        password: creds?.password,
      }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update hostel");
    }
    return response.json();
  },

  delete: async (id: number): Promise<void> => {
    const creds = getCredentials();
    const response = await fetch(`${API_BASE_URL}/hostels/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
      body: JSON.stringify({ email: creds?.email, password: creds?.password }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete hostel");
    }
  },
};

// Admin API
export const adminApi = {
  getAllHostels: async (): Promise<Hostel[]> => {
    const creds = getCredentials();
    const response = await fetch(`${API_BASE_URL}/admin/hostels`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch hostels");
    return response.json();
  },

  verifyHostel: async (id: number): Promise<{ hostel: Hostel }> => {
    const creds = getCredentials();
    const response = await fetch(`${API_BASE_URL}/admin/verify-hostel/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ email: creds?.email, password: creds?.password }),
    });
    if (!response.ok) throw new Error("Failed to verify hostel");
    return response.json();
  },

  unverifyHostel: async (id: number): Promise<{ hostel: Hostel }> => {
    const creds = getCredentials();
    const response = await fetch(
      `${API_BASE_URL}/admin/unverify-hostel/${id}`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          email: creds?.email,
          password: creds?.password,
        }),
      }
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to unverify hostel");
    }
    return response.json();
  },
};

// Review API
export const reviewApi = {
  create: async (
    hostelId: number,
    rating: number,
    comment: string
  ): Promise<{ review: Review }> => {
    const creds = getCredentials();
    const response = await fetch(`${API_BASE_URL}/reviews`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        email: creds?.email,
        password: creds?.password,
        hostel_id: hostelId,
        rating,
        comment,
      }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create review");
    }
    return response.json();
  },

  getByHostel: async (hostelId: number): Promise<Review[]> => {
    const response = await fetch(`${API_BASE_URL}/reviews/hostel/${hostelId}`);
    if (!response.ok) throw new Error("Failed to fetch reviews");
    return response.json();
  },

  update: async (
    reviewId: number,
    rating?: number,
    comment?: string
  ): Promise<{ review: Review }> => {
    const creds = getCredentials();
    const body: any = {};
    if (rating !== undefined) body.rating = rating;
    if (comment !== undefined) body.comment = comment;

    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        email: creds?.email,
        password: creds?.password,
        ...body,
      }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update review");
    }
    return response.json();
  },

  delete: async (reviewId: number): Promise<void> => {
    const creds = getCredentials();
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        email: creds?.email,
        password: creds?.password,
      }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete review");
    }
  },
};

export interface Enquiry {
  id: number;
  hostel_id: number;
  student_id: number;
  type: "enquiry" | "schedule_visit";
  message?: string;
  scheduled_date?: string;
  reply?: string;
  status: "pending" | "responded";
  created_at?: string;
  replied_at?: string;
  student_name?: string;
  student_email?: string;
  hostel_name?: string;
  hostel_address?: string;
  hostel_city?: string;
  owner_name?: string;
  owner_email?: string;
}

// Enquiry API
export const enquiryApi = {
  create: async (
    hostelId: number,
    type: "enquiry" | "schedule_visit",
    message?: string,
    scheduledDate?: string
  ): Promise<{ enquiry: any }> => {
    const creds = getCredentials();
    const response = await fetch(`${API_BASE_URL}/enquiries`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        email: creds?.email,
        password: creds?.password,
        hostel_id: hostelId,
        type,
        message,
        scheduled_date: scheduledDate,
      }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to send enquiry");
    }
    return response.json();
  },

  getByOwner: async (): Promise<Enquiry[]> => {
    const creds = getCredentials();
    const response = await fetch(`${API_BASE_URL}/enquiries/owner`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch enquiries");
    }
    return response.json();
  },

  getByHostel: async (hostelId: number): Promise<Enquiry[]> => {
    const creds = getCredentials();
    const response = await fetch(
      `${API_BASE_URL}/enquiries/hostel/${hostelId}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch enquiries");
    }
    return response.json();
  },

  getByStudent: async (): Promise<Enquiry[]> => {
    const creds = getCredentials();
    const response = await fetch(`${API_BASE_URL}/enquiries/student`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch enquiries");
    }
    return response.json();
  },

  reply: async (
    enquiryId: number,
    reply: string
  ): Promise<{ message: string; enquiry: Enquiry }> => {
    const creds = getCredentials();
    const response = await fetch(
      `${API_BASE_URL}/enquiries/${enquiryId}/reply`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          email: creds?.email,
          password: creds?.password,
          reply,
        }),
      }
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to send reply");
    }
    return response.json();
  },
};
