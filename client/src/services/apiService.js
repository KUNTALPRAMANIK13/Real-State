class ApiService {
  constructor() {
    this.baseURL = import.meta.env.VITE_backend_url || "http://localhost:3000";
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include", // Include cookies
      ...options,
    };

    if (options.body && typeof options.body === "object") {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Authentication endpoints
  async authenticateWithFirebase(idToken) {
    return this.request("/api/auth/firebase", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });
  }

  async traditionalSignIn(email, password) {
    return this.request("/api/auth/signin", {
      method: "POST",
      body: { email, password },
    });
  }

  async traditionalSignUp(username, email, password) {
    return this.request("/api/auth/signup", {
      method: "POST",
      body: { username, email, password },
    });
  }

  async googleAuth(userData) {
    return this.request("/api/auth/google", {
      method: "POST",
      body: userData,
    });
  }

  async signOut() {
    return this.request("/api/auth/signout", {
      method: "GET",
    });
  }

  // User endpoints
  async updateUser(userId, userData) {
    return this.request(`/api/user/update/${userId}`, {
      method: "POST",
      body: userData,
    });
  }

  async deleteUser(userId) {
    return this.request(`/api/user/delete/${userId}`, {
      method: "DELETE",
    });
  }

  async getUserListings(userId) {
    return this.request(`/api/user/listings/${userId}`);
  }

  // Listing endpoints
  async createListing(listingData) {
    return this.request("/api/listing/create", {
      method: "POST",
      body: listingData,
    });
  }

  async updateListing(listingId, listingData) {
    return this.request(`/api/listing/update/${listingId}`, {
      method: "POST",
      body: listingData,
    });
  }

  async deleteListing(listingId) {
    return this.request(`/api/listing/delete/${listingId}`, {
      method: "DELETE",
    });
  }

  async getListing(listingId) {
    return this.request(`/api/listing/get/${listingId}`);
  }

  async getListings(searchParams = {}) {
    const params = new URLSearchParams(searchParams);
    return this.request(`/api/listing/get?${params}`);
  }
}

const apiService = new ApiService();
export default apiService;
