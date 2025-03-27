// API Configuration
const API_BASE_URL = 'YOUR_GOOGLE_APPS_SCRIPT_DEPLOYMENT_URL';
const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID';

// API Endpoints
const ENDPOINTS = {
    courses: '/courses',
    users: '/users',
    enrollments: '/enrollments',
    auth: '/auth'
};

// Authentication state
let currentUser = null;
let authToken = null;

// API Helper Functions
const api = {
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
            ...options.headers
        };

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // Course-related API calls
    async getCourses() {
        return this.request(ENDPOINTS.courses);
    },

    async enrollInCourse(courseId) {
        return this.request(`${ENDPOINTS.enrollments}/${courseId}`, {
            method: 'POST'
        });
    },

    // Authentication API calls
    async login(email, password) {
        const response = await this.request(ENDPOINTS.auth + '/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        if (response.token) {
            authToken = response.token;
            currentUser = response.user;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('user', JSON.stringify(currentUser));
        }
        
        return response;
    },

    async signup(userData) {
        return this.request(ENDPOINTS.auth + '/signup', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    },

    async logout() {
        authToken = null;
        currentUser = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
    },

    // Check if user is authenticated
    isAuthenticated() {
        return !!authToken;
    }
};

// UI Functions
function showLoginModal() {
    document.getElementById('loginModal').style.display = 'block';
}

function closeLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
}

function showSignupModal() {
    document.getElementById('signupModal').style.display = 'block';
}

function closeSignupModal() {
    document.getElementById('signupModal').style.display = 'none';
}

function scrollToCourses() {
    document.getElementById('courses').scrollIntoView({ behavior: 'smooth' });
}

// Event Handlers
async function handleLogin(event) {
    event.preventDefault();
    const form = event.target;
    const email = form.querySelector('input[type="email"]').value;
    const password = form.querySelector('input[type="password"]').value;

    try {
        await api.login(email, password);
        closeLoginModal();
        updateUIForLoggedInUser();
    } catch (error) {
        alert('Login failed: ' + error.message);
    }
}

async function handleSignup(event) {
    event.preventDefault();
    const form = event.target;
    const userData = {
        name: form.querySelector('input[type="text"]').value,
        email: form.querySelector('input[type="email"]').value,
        password: form.querySelector('input[type="password"]').value
    };

    try {
        await api.signup(userData);
        closeSignupModal();
        alert('Signup successful! Please login.');
        showLoginModal();
    } catch (error) {
        alert('Signup failed: ' + error.message);
    }
}

// Course Display Functions
async function loadCourses() {
    try {
        const courses = await api.getCourses();
        const courseGrid = document.getElementById('courseGrid');
        courseGrid.innerHTML = courses.map(course => `
            <div class="course-card">
                <img src="${course.image}" alt="${course.title}">
                <h3>${course.title}</h3>
                <p>${course.description}</p>
                <button class="enroll-btn" onclick="enrollInCourse('${course.id}')">
                    ${api.isAuthenticated() ? 'Enroll Now' : 'Login to Enroll'}
                </button>
            </div>
        `).join('');
    } catch (error) {
        console.error('Failed to load courses:', error);
    }
}

async function enrollInCourse(courseId) {
    if (!api.isAuthenticated()) {
        showLoginModal();
        return;
    }

    try {
        await api.enrollInCourse(courseId);
        alert('Successfully enrolled in the course!');
    } catch (error) {
        alert('Failed to enroll: ' + error.message);
    }
}

// UI Update Functions
function updateUIForLoggedInUser() {
    const authButtons = document.querySelector('.auth-buttons');
    if (api.isAuthenticated()) {
        authButtons.innerHTML = `
            <span>Welcome, ${currentUser.name}</span>
            <button class="login-btn" onclick="api.logout()">Logout</button>
        `;
    } else {
        authButtons.innerHTML = `
            <button class="login-btn" onclick="showLoginModal()">Login</button>
            <button class="signup-btn" onclick="showSignupModal()">Sign Up</button>
        `;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Check for stored authentication
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
        authToken = storedToken;
        currentUser = JSON.parse(storedUser);
        updateUIForLoggedInUser();
    }

    // Load courses
    loadCourses();
}); 