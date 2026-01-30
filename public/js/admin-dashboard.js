// DOM Elements
const loginForm = document.getElementById('login-form');
const dashboard = document.getElementById('dashboard');
const logoutBtn = document.getElementById('logout-btn');
const saveBtn = document.getElementById('save-btn');
const profileForm = document.getElementById('profile-form');
const skillsList = document.getElementById('skills-list');
const addSkillBtn = document.getElementById('add-skill');
const certificatesList = document.getElementById('certificates-list');
const addCertificateBtn = document.getElementById('add-certificate');
const projectsList = document.getElementById('projects-list');
const addProjectBtn = document.getElementById('add-project');
const achievementsList = document.getElementById('achievements-list');
const addAchievementBtn = document.getElementById('add-achievement');
const profilePhotoInput = document.getElementById('profile-photo');
const resumeInput = document.getElementById('resume');
const cvInput = document.getElementById('cv');
const profilePhotoPreview = document.getElementById('profile-photo-preview');
const resumeLink = document.getElementById('resume-link');
const cvLink = document.getElementById('cv-link');

// State
let portfolioData = {
    profile: {
        name: '',
        title: '',
        email: '',
        phone: '',
        location: '',
        about: '',
        social: {
            linkedin: '',
            github: '',
            twitter: ''
        }
    },
    documents: {
        profilePhoto: '',
        resume: '',
        cv: ''
    },
    skills: [],
    certificates: [],
    projects: [],
    achievements: []
};

// API Base URL
const API_BASE_URL = '/api';
const AUTH_TOKEN_KEY = 'admin_token';

// Check if user is logged in
function checkAuth() {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
        loadPortfolioData();
        showDashboard();
    } else {
        showLogin();
    }
}

// Show login form
function showLogin() {
    loginForm.style.display = 'block';
    dashboard.style.display = 'none';
}

// Show dashboard
function showDashboard() {
    loginForm.style.display = 'none';
    dashboard.style.display = 'block';
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch(`${API_BASE_URL}/admin/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        if (response.ok) {
            const data = await response.json();
            localStorage.setItem(AUTH_TOKEN_KEY, data.token);
            await loadPortfolioData();
            showDashboard();
            showAlert('Login successful!', 'success');
        } else {
            throw new Error('Invalid credentials');
        }
    } catch (error) {
        showAlert('Login failed. Please check your credentials.', 'danger');
        console.error('Login error:', error);
    }
}

// Handle logout
function handleLogout() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    showLogin();
}

// Load portfolio data
async function loadPortfolioData() {
    try {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        const response = await fetch(`${API_BASE_URL}/admin/portfolio`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            portfolioData = data;
            renderPortfolioData();
        } else {
            throw new Error('Failed to load portfolio data');
        }
    } catch (error) {
        showAlert('Failed to load portfolio data', 'danger');
        console.error('Error loading portfolio data:', error);
    }
}

// Save portfolio data
async function savePortfolioData() {
    try {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        const response = await fetch(`${API_BASE_URL}/admin/portfolio`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(portfolioData)
        });
        
        if (response.ok) {
            showAlert('Portfolio updated successfully!', 'success');
        } else {
            throw new Error('Failed to update portfolio');
        }
    } catch (error) {
        showAlert('Failed to update portfolio', 'danger');
        console.error('Error saving portfolio data:', error);
    }
}

// Upload file
async function uploadFile(file, type) {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        const response = await fetch(`${API_BASE_URL}/admin/upload/${type}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        if (response.ok) {
            const data = await response.json();
            return data.url;
        } else {
            throw new Error(`Failed to upload ${type}`);
        }
    } catch (error) {
        showAlert(`Failed to upload ${type}`, 'danger');
        console.error(`Error uploading ${type}:`, error);
        return null;
    }
}

// Render portfolio data to the form
function renderPortfolioData() {
    // Profile
    const { profile } = portfolioData;
    document.getElementById('name').value = profile.name || '';
    document.getElementById('title').value = profile.title || '';
    document.getElementById('email').value = profile.email || '';
    document.getElementById('phone').value = profile.phone || '';
    document.getElementById('location').value = profile.location || '';
    document.getElementById('about').value = profile.about || '';
    document.getElementById('linkedin').value = profile.social?.linkedin || '';
    document.getElementById('github').value = profile.social?.github || '';
    document.getElementById('twitter').value = profile.social?.twitter || '';
    
    // Profile photo
    if (portfolioData.documents?.profilePhoto) {
        profilePhotoPreview.src = portfolioData.documents.profilePhoto;
        profilePhotoPreview.style.display = 'block';
    }
    
    // Documents
    if (portfolioData.documents?.resume) {
        resumeLink.href = portfolioData.documents.resume;
        resumeLink.style.display = 'inline-block';
    }
    
    if (portfolioData.documents?.cv) {
        cvLink.href = portfolioData.documents.cv;
        cvLink.style.display = 'inline-block';
    }
    
    // Skills
    renderList('skills', portfolioData.skills || []);
    
    // Certificates
    renderList('certificates', portfolioData.certificates || []);
    
    // Projects
    renderList('projects', portfolioData.projects || []);
    
    // Achievements
    renderList('achievements', portfolioData.achievements || []);
}

// Render list items (skills, certificates, projects, achievements)
function renderList(type, items) {
    const list = document.getElementById(`${type}-list`);
    list.innerHTML = '';
    
    items.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        
        if (type === 'skills') {
            li.innerHTML = `
                <span>${item.name} (${item.level}%)</span>
                <div>
                    <button class="btn btn-sm btn-outline-primary edit-${type}" data-index="${index}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger remove-${type}" data-index="${index}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
        } else if (type === 'certificates') {
            li.innerHTML = `
                <div>
                    <h6 class="mb-1">${item.name}</h6>
                    <small class="text-muted">${item.issuer} - ${item.date}</small>
                </div>
                <div>
                    <a href="${item.url}" target="_blank" class="btn btn-sm btn-outline-info mr-1">
                        <i class="fas fa-external-link-alt"></i>
                    </a>
                    <button class="btn btn-sm btn-outline-primary edit-${type}" data-index="${index}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger remove-${type}" data-index="${index}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
        } else if (type === 'projects') {
            li.innerHTML = `
                <div class="w-100">
                    <div class="d-flex justify-content-between align-items-center">
                        <h6 class="mb-1">${item.title}</h6>
                        <div>
                            ${item.url ? `<a href="${item.url}" target="_blank" class="btn btn-sm btn-outline-info mr-1">
                                <i class="fas fa-external-link-alt"></i>
                            </a>` : ''}
                            <button class="btn btn-sm btn-outline-primary edit-${type}" data-index="${index}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger remove-${type}" data-index="${index}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <p class="mb-1">${item.description}</p>
                    <div class="d-flex flex-wrap">
                        ${item.technologies ? item.technologies.map(tech => 
                            `<span class="badge bg-secondary me-1 mb-1">${tech}</span>`
                        ).join('') : ''}
                    </div>
                </div>
            `;
        } else if (type === 'achievements') {
            li.innerHTML = `
                <div class="w-100">
                    <div class="d-flex justify-content-between align-items-center">
                        <h6 class="mb-1">${item.title}</h6>
                        <div>
                            <button class="btn btn-sm btn-outline-primary edit-${type}" data-index="${index}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger remove-${type}" data-index="${index}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <p class="mb-1">${item.description}</p>
                    <small class="text-muted">${item.date}</small>
                </div>
            `;
        }
        
        list.appendChild(li);
    });
    
    // Add event listeners for edit and remove buttons
    document.querySelectorAll(`.edit-${type}`).forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.closest('button').dataset.index);
            editItem(type, index);
        });
    });
    
    document.querySelectorAll(`.remove-${type}`).forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.closest('button').dataset.index);
            removeItem(type, index);
        });
    });
}

// Add new item to a list
function addItem(type) {
    let item = {};
    let title = '';
    
    if (type === 'skills') {
        title = 'Add New Skill';
        const name = prompt('Enter skill name:');
        if (!name) return;
        
        const level = parseInt(prompt('Enter skill level (1-100):'));
        if (isNaN(level) || level < 1 || level > 100) {
            showAlert('Please enter a valid skill level between 1 and 100', 'warning');
            return;
        }
        
        item = { name, level };
    } else if (type === 'certificates') {
        title = 'Add New Certificate';
        const name = prompt('Certificate name:');
        if (!name) return;
        
        const issuer = prompt('Issuing organization:');
        if (!issuer) return;
        
        const date = prompt('Date (e.g., Jan 2023):');
        if (!date) return;
        
        const url = prompt('Certificate URL (optional):', 'https://');
        
        item = { name, issuer, date };
        if (url && url !== 'https://') item.url = url;
    } else if (type === 'projects') {
        title = 'Add New Project';
        const title = prompt('Project title:');
        if (!title) return;
        
        const description = prompt('Project description:');
        if (!description) return;
        
        const technologies = prompt('Technologies (comma-separated):');
        const url = prompt('Project URL (optional):', 'https://');
        
        item = { 
            title, 
            description,
            technologies: technologies ? technologies.split(',').map(t => t.trim()) : []
        };
        if (url && url !== 'https://') item.url = url;
    } else if (type === 'achievements') {
        title = 'Add New Achievement';
        const title = prompt('Achievement title:');
        if (!title) return;
        
        const description = prompt('Achievement description:');
        if (!description) return;
        
        const date = prompt('Date (e.g., Jan 2023):');
        if (!date) return;
        
        item = { title, description, date };
    }
    
    if (Object.keys(item).length > 0) {
        if (!portfolioData[type]) portfolioData[type] = [];
        portfolioData[type].push(item);
        renderList(type, portfolioData[type]);
        showAlert(`${title} added successfully!`, 'success');
    }
}

// Edit existing item in a list
function editItem(type, index) {
    if (!portfolioData[type] || !portfolioData[type][index]) return;
    
    const item = portfolioData[type][index];
    let updatedItem = { ...item };
    let isUpdated = false;
    
    if (type === 'skills') {
        const name = prompt('Skill name:', item.name);
        if (name === null) return;
        
        const level = parseInt(prompt('Skill level (1-100):', item.level));
        if (isNaN(level) || level < 1 || level > 100) {
            showAlert('Please enter a valid skill level between 1 and 100', 'warning');
            return;
        }
        
        updatedItem = { name, level };
        isUpdated = name !== item.name || level !== item.level;
    } else if (type === 'certificates') {
        const name = prompt('Certificate name:', item.name);
        if (name === null) return;
        
        const issuer = prompt('Issuing organization:', item.issuer);
        if (issuer === null) return;
        
        const date = prompt('Date (e.g., Jan 2023):', item.date);
        if (date === null) return;
        
        const url = prompt('Certificate URL (optional):', item.url || 'https://');
        
        updatedItem = { name, issuer, date };
        if (url && url !== 'https://') updatedItem.url = url;
        
        isUpdated = name !== item.name || issuer !== item.issuer || date !== item.date || 
                   (updatedItem.url || '') !== (item.url || '');
    } else if (type === 'projects') {
        const title = prompt('Project title:', item.title);
        if (title === null) return;
        
        const description = prompt('Project description:', item.description);
        if (description === null) return;
        
        const technologies = prompt('Technologies (comma-separated):', 
            item.technologies ? item.technologies.join(', ') : '');
            
        const url = prompt('Project URL (optional):', item.url || 'https://');
        
        updatedItem = { 
            title, 
            description,
            technologies: technologies ? technologies.split(',').map(t => t.trim()) : []
        };
        if (url && url !== 'https://') updatedItem.url = url;
        
        isUpdated = title !== item.title || description !== item.description || 
                   JSON.stringify(updatedItem.technologies) !== JSON.stringify(item.technologies || []) ||
                   (updatedItem.url || '') !== (item.url || '');
    } else if (type === 'achievements') {
        const title = prompt('Achievement title:', item.title);
        if (title === null) return;
        
        const description = prompt('Achievement description:', item.description);
        if (description === null) return;
        
        const date = prompt('Date (e.g., Jan 2023):', item.date);
        if (date === null) return;
        
        updatedItem = { title, description, date };
        
        isUpdated = title !== item.title || description !== item.description || date !== item.date;
    }
    
    if (isUpdated) {
        portfolioData[type][index] = updatedItem;
        renderList(type, portfolioData[type]);
        showAlert(`${type.slice(0, -1)} updated successfully!`, 'success');
    }
}

// Remove item from a list
function removeItem(type, index) {
    if (!portfolioData[type] || !portfolioData[type][index]) return;
    
    if (confirm(`Are you sure you want to remove this ${type.slice(0, -1)}?`)) {
        portfolioData[type].splice(index, 1);
        renderList(type, portfolioData[type]);
        showAlert(`${type.slice(0, 1).toUpperCase() + type.slice(1, -1)} removed successfully!`, 'success');
    }
}

// Handle profile form submission
async function handleProfileSubmit(e) {
    e.preventDefault();
    
    // Update profile data
    portfolioData.profile = {
        name: document.getElementById('name').value,
        title: document.getElementById('title').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        location: document.getElementById('location').value,
        about: document.getElementById('about').value,
        social: {
            linkedin: document.getElementById('linkedin').value,
            github: document.getElementById('github').value,
            twitter: document.getElementById('twitter').value
        }
    };
    
    // Handle file uploads
    if (profilePhotoInput.files.length > 0) {
        const url = await uploadFile(profilePhotoInput.files[0], 'profile-photo');
        if (url) {
            portfolioData.documents.profilePhoto = url;
            profilePhotoPreview.src = url;
            profilePhotoPreview.style.display = 'block';
        }
    }
    
    if (resumeInput.files.length > 0) {
        const url = await uploadFile(resumeInput.files[0], 'resume');
        if (url) {
            portfolioData.documents.resume = url;
            resumeLink.href = url;
            resumeLink.style.display = 'inline-block';
        }
    }
    
    if (cvInput.files.length > 0) {
        const url = await uploadFile(cvInput.files[0], 'cv');
        if (url) {
            portfolioData.documents.cv = url;
            cvLink.href = url;
            cvLink.style.display = 'inline-block';
        }
    }
    
    // Save all changes
    await savePortfolioData();
}

// Show alert message
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    const alertsContainer = document.getElementById('alerts-container');
    alertsContainer.appendChild(alertDiv);
    
    // Auto-remove alert after 5 seconds
    setTimeout(() => {
        alertDiv.classList.remove('show');
        setTimeout(() => alertDiv.remove(), 150);
    }, 5000);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication status
    checkAuth();
    
    // Login form submission
    loginForm.addEventListener('submit', handleLogin);
    
    // Logout button
    logoutBtn.addEventListener('click', handleLogout);
    
    // Save button
    saveBtn.addEventListener('click', savePortfolioData);
    
    // Profile form submission
    profileForm.addEventListener('submit', handleProfileSubmit);
    
    // Add item buttons
    addSkillBtn.addEventListener('click', () => addItem('skills'));
    addCertificateBtn.addEventListener('click', () => addItem('certificates'));
    addProjectBtn.addEventListener('click', () => addItem('projects'));
    addAchievementBtn.addEventListener('click', () => addItem('achievements'));
    
    // File input change handlers
    profilePhotoInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                profilePhotoPreview.src = event.target.result;
                profilePhotoPreview.style.display = 'block';
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    });
    
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});
