const API_URL = process.env.NODE_ENV === 'production'

class API {
    constructor() {
        this.token = localStorage.getItem('token');
    }

    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }

    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        return headers;
    }

    async request(endpoint, options = {}) {
        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                ...options,
                headers: {
                    ...this.getHeaders(),
                    ...options.headers
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Une erreur est survenue');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Auth
    async register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async login(credentials) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    }

    async logout() {
        return this.request('/auth/logout', {
            method: 'POST'
        });
    }

    async getMe() {
        return this.request('/auth/me');
    }

    // Members
    async getMembers(filters = {}) {
        const params = new URLSearchParams(filters);
        return this.request(`/members?${params.toString()}`);
    }

    async getMember(id) {
        return this.request(`/members/${id}`);
    }

    async createMember(memberData) {
        return this.request('/members', {
            method: 'POST',
            body: JSON.stringify(memberData)
        });
    }

    async updateMember(id, memberData) {
        return this.request(`/members/${id}`, {
            method: 'PUT',
            body: JSON.stringify(memberData)
        });
    }

    async deleteMember(id) {
        return this.request(`/members/${id}`, {
            method: 'DELETE'
        });
    }

    async getCategories() {
        return this.request('/members/filters/categories');
    }

    async getCities() {
        return this.request('/members/filters/cities');
    }

    // Access Requests
    async requestAccess(memberId) {
        return this.request(`/requests/${memberId}`, {
            method: 'POST'
        });
    }

    async getMyRequests() {
        return this.request('/requests/my/requests');
    }

    // Admin
    async getUsers() {
        return this.request('/users');
    }

    async deleteUser(id) {
        return this.request(`/users/${id}`, {
            method: 'DELETE'
        });
    }

    async getPendingRequests() {
        return this.request('/requests/admin/pending');
    }

    async approveRequest(requestId) {
        return this.request(`/requests/admin/${requestId}/approve`, {
            method: 'PUT'
        });
    }

    async rejectRequest(requestId) {
        return this.request(`/requests/admin/${requestId}/reject`, {
            method: 'PUT'
        });
    }
}

const api = new API();