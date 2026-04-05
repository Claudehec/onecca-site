// Gestion de l'authentification
const auth = {
    isAuthenticated() {
        return !!localStorage.getItem('token');
    },

    getUser() {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            return JSON.parse(userStr);
        }
        return null;
    },

    isAdmin() {
        const user = this.getUser();
        return user && user.role === 'admin';
    },

    async login(email, password) {
        try {
            const response = await api.login({ email, password });
            api.setToken(response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            return response;
        } catch (error) {
            throw error;
        }
    },

    async register(userData) {
        try {
            const response = await api.register(userData);
            api.setToken(response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            return response;
        } catch (error) {
            throw error;
        }
    },

    logout() {
        api.setToken(null);
        localStorage.removeItem('user');
        window.location.href = '/pages/login.html';
    },

    async checkAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = '/pages/login.html';
            return false;
        }
        
        try {
            const user = await api.getMe();
            localStorage.setItem('user', JSON.stringify(user));
            return true;
        } catch (error) {
            this.logout();
            return false;
        }
    }
};

// Initialisation de la navigation en fonction du rôle
function initNavigation() {
    const navLinks = document.getElementById('navLinks');
    if (!navLinks) return;

    const user = auth.getUser();
    
    if (auth.isAdmin()) {
        navLinks.innerHTML = `
            <a href="/pages/admin-dashboard.html">Dashboard Admin</a>
            <a href="/pages/admin-users.html">Utilisateurs</a>
            <a href="#" onclick="auth.logout()">Déconnexion</a>
        `;
    } else if (user) {
        navLinks.innerHTML = `
            <a href="/pages/user-dashboard.html">Dashboard</a>
            <a href="#" onclick="auth.logout()">Déconnexion</a>
        `;
    } else {
        navLinks.innerHTML = `
            <a href="/pages/login.html">Connexion</a>
            <a href="/pages/register.html">Inscription</a>
        `;
    }
}

// Vérification de la page actuelle
function getCurrentPage() {
    const path = window.location.pathname;
    if (path.includes('admin-dashboard')) return 'admin';
    if (path.includes('user-dashboard')) return 'user';
    if (path.includes('login') || path.includes('register')) return 'public';
    return 'public';
}