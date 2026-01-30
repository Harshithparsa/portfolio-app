class Dashboard {
  constructor() {
    this.apiBaseUrl = '/api/dashboard';
    this.token = localStorage.getItem('token');
    this.initializeEventListeners();
    this.loadDashboardData();
  }

  // Initialize all event listeners
  initializeEventListeners() {
    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menuToggle');

    const toggleSidebar = () => {
      sidebar.classList.toggle('active');
    };

    if (mobileMenuToggle) {
      mobileMenuToggle.addEventListener('click', toggleSidebar);
    }

    if (menuToggle) {
      menuToggle.addEventListener('click', toggleSidebar);
    }

    // Navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
        this.loadSection(item.getAttribute('data-section'));
      });
    });

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.handleLogout());
    }

    // File upload
    const fileUploadForm = document.getElementById('fileUploadForm');
    if (fileUploadForm) {
      fileUploadForm.addEventListener('submit', (e) => this.handleFileUpload(e));
    }

    // Initialize tooltips
    this.initializeTooltips();
  }

  // Initialize tooltips
  initializeTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });
  }

  // Load dashboard data
  async loadDashboardData() {
    try {
      console.log('Loading dashboard data...');
      const response = await this.fetchWithAuth(`${this.apiBaseUrl}/stats`);
      console.log('Dashboard data response:', response);
      
      // Check if response is an object and has the expected structure
      if (response && typeof response === 'object' && response.success !== undefined) {
        if (response.success) {
          this.updateDashboardUI(response.data || {});
        } else {
          this.showError(response.message || 'Failed to load dashboard data');
        }
      } else {
        // If we get here, the response doesn't match our expected format
        console.warn('Unexpected response format:', response);
        this.showError('Received unexpected response from server');
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      this.showError(error.message || 'Failed to load dashboard data');
    }
  }

  // Update UI with dashboard data
  updateDashboardUI(data) {
    try {
      if (!data) {
        console.warn('No data provided to updateDashboardUI');
        return;
      }

      // Safely update stats cards with null checks
      const updateStat = (selector, value) => {
        const element = document.querySelector(selector);
        if (element) {
          element.textContent = value !== undefined && value !== null 
            ? typeof value === 'number' ? value.toLocaleString() : value 
            : 'N/A';
        }
      };

      updateStat('.stat-value[data-stat="totalViews"]', data.totalViews);
      updateStat('.stat-value[data-stat="totalClicks"]', data.totalClicks);
      updateStat('.stat-value[data-stat="messages"]', data.messages);
      updateStat('.stat-value[data-stat="downloads"]', data.downloads);

      // Update recent activities
      const activitiesContainer = document.querySelector('.activity-list');
      if (activitiesContainer) {
        if (Array.isArray(data.recentActivities) && data.recentActivities.length > 0) {
          activitiesContainer.innerHTML = data.recentActivities
            .filter(activity => activity && activity.title) // Filter out invalid activities
            .map(activity => `
              <li class="activity-item">
                <div class="activity-icon">
                  <i class="fas fa-${activity.icon || 'bell'}"></i>
                </div>
                <div class="activity-content">
                  <h4 class="activity-title">${activity.title}</h4>
                  ${activity.description ? `<p class="activity-desc">${activity.description}</p>` : ''}
                  ${activity.time ? `<span class="activity-time">${activity.time}</span>` : ''}
                </div>
              </li>
            `)
            .join('');
        } else {
          // Show a message when no activities are available
          activitiesContainer.innerHTML = `
            <li class="activity-item">
              <div class="activity-icon">
                <i class="fas fa-info-circle"></i>
              </div>
              <div class="activity-content">
                <h4 class="activity-title">No recent activities</h4>
                <p class="activity-desc">Your recent activities will appear here</p>
              </div>
            </li>
          `;
        }
      }
  }

  // Handle file upload
  async handleFileUpload(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const fileInput = form.querySelector('input[type="file"]');
    
    if (!fileInput.files || fileInput.files.length === 0) {
      this.showError('Please select a file to upload');
      return;
    }

    const uploadButton = form.querySelector('button[type="submit"]');
    const originalButtonText = uploadButton.innerHTML;
    
    try {
      // Show loading state
      uploadButton.disabled = true;
      uploadButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Uploading...';
      
      const response = await fetch(`${this.apiBaseUrl}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`
        },
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success) {
        this.showSuccess('File uploaded successfully');
        // Reset form
        form.reset();
        // Refresh file list
        this.loadFileList();
      } else {
        throw new Error(result.message || 'Failed to upload file');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      this.showError(error.message || 'Failed to upload file');
    } finally {
      // Reset button state
      uploadButton.disabled = false;
      uploadButton.innerHTML = originalButtonText;
    }
  }

  // Load file list
  async loadFileList() {
    try {
      const response = await this.fetchWithAuth(`${this.apiBaseUrl}/files`);
      if (response.success) {
        this.updateFileListUI(response.data);
      } else {
        this.showError('Failed to load files');
      }
    } catch (error) {
      console.error('Error loading files:', error);
      this.showError('Failed to load files');
    }
  }

  // Update file list UI
  updateFileListUI(files) {
    const fileListContainer = document.getElementById('fileList');
    if (fileListContainer) {
      if (files && files.length > 0) {
        fileListContainer.innerHTML = files
          .map(file => `
            <div class="file-item">
              <div class="file-icon">
                <i class="fas ${this.getFileIcon(file.mimetype)}"></i>
              </div>
              <div class="file-details">
                <div class="file-name">${file.originalname}</div>
                <div class="file-meta">
                  <span>${this.formatFileSize(file.size)}</span>
                  <span>•</span>
                  <span>${new Date(file.uploadedAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div class="file-actions">
                <button class="btn btn-sm btn-outline" onclick="dashboard.downloadFile('${file.filename}', '${file.originalname}')">
                  <i class="fas fa-download"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="dashboard.deleteFile('${file._id}')">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          `)
          .join('');
      } else {
        fileListContainer.innerHTML = '<div class="text-center py-4 text-muted">No files uploaded yet</div>';
      }
    }
  }

  // Download file
  async downloadFile(filename, originalname) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/files/download/${filename}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to download file');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = originalname || filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      
      this.showSuccess('Download started');
    } catch (error) {
      console.error('Error downloading file:', error);
      this.showError('Failed to download file');
    }
  }

  // Delete file
  async deleteFile(fileId) {
    if (!confirm('Are you sure you want to delete this file?')) {
      return;
    }
    
    try {
      const response = await this.fetchWithAuth(
        `${this.apiBaseUrl}/files/${fileId}`,
        { method: 'DELETE' }
      );
      
      if (response.success) {
        this.showSuccess('File deleted successfully');
        this.loadFileList();
      } else {
        throw new Error(response.message || 'Failed to delete file');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      this.showError(error.message || 'Failed to delete file');
    }
  }

  // Load section content
  async loadSection(section) {
    // Show loading state
    const contentArea = document.querySelector('.content');
    if (contentArea) {
      contentArea.innerHTML = `
        <div class="d-flex justify-content-center align-items-center" style="height: 300px;">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      `;
    }

    try {
      // In a real app, you would fetch section content from the server
      // const response = await this.fetchWithAuth(`${this.apiBaseUrl}/sections/${section}`);
      // const html = response.html;
      
      // For now, we'll just show a simple message
      const sectionTitles = {
        'dashboard': 'Dashboard',
        'profile': 'Profile',
        'projects': 'Projects',
        'skills': 'Skills',
        'files': 'File Manager',
        'analytics': 'Analytics',
        'settings': 'Settings'
      };
      
      const sectionContent = `
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">${sectionTitles[section] || section.charAt(0).toUpperCase() + section.slice(1)}</h2>
          </div>
          <div class="card-body">
            <p>This is the ${section} section. Content will be loaded here.</p>
            ${section === 'files' ? this.getFileManagerHTML() : ''}
          </div>
        </div>
      `;
      
      if (contentArea) {
        contentArea.innerHTML = sectionContent;
        
        // Re-initialize event listeners for the new content
        if (section === 'files') {
          document.getElementById('fileUploadForm')
            .addEventListener('submit', (e) => this.handleFileUpload(e));
          this.loadFileList();
        }
      }
    } catch (error) {
      console.error(`Error loading section ${section}:`, error);
      this.showError(`Failed to load ${section} section`);
    }
  }

  // Get file manager HTML
  getFileManagerHTML() {
    return `
      <div class="file-manager">
        <div class="card mb-4">
          <div class="card-body">
            <h5 class="card-title mb-4">Upload Files</h5>
            <form id="fileUploadForm">
              <div class="mb-3">
                <div class="file-upload-area p-4 text-center border rounded">
                  <i class="fas fa-cloud-upload-alt fa-3x mb-3 text-muted"></i>
                  <h5>Drag & drop files here</h5>
                  <p class="text-muted mb-3">or</p>
                  <label class="btn btn-primary mb-0">
                    Browse Files
                    <input type="file" name="file" class="d-none" multiple>
                  </label>
                  <p class="small text-muted mt-2 mb-0">Supports: JPG, PNG, GIF, PDF, DOC, DOCX (Max 5MB)</p>
                </div>
              </div>
              <div class="d-flex justify-content-end">
                <button type="submit" class="btn btn-primary">
                  <i class="fas fa-upload me-2"></i> Upload Files
                </button>
              </div>
            </form>
          </div>
        </div>
        
        <div class="card">
          <div class="card-header">
            <h5 class="card-title mb-0">My Files</h5>
          </div>
          <div class="card-body p-0">
            <div id="fileList" class="file-list">
              <div class="text-center py-4 text-muted">
                <i class="fas fa-folder-open fa-3x mb-3"></i>
                <p>No files uploaded yet</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Show success message
  showSuccess(message) {
    this.showAlert(message, 'success');
  }

  // Show error message
  showError(message) {
    this.showAlert(message, 'danger');
  }

  // Show alert
  showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    const alertContainer = document.getElementById('alertContainer');
    if (alertContainer) {
      alertContainer.appendChild(alertDiv);
      
      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        const bsAlert = new bootstrap.Alert(alertDiv);
        bsAlert.close();
      }, 5000);
    }
  }

  // Handle logout
  handleLogout() {
    if (confirm('Are you sure you want to log out?')) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login.html';
    }
  }

  // Helper: Fetch with authentication
  async fetchWithAuth(url, options = {}) {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
        ...options.headers
      };

      // Don't override Content-Type for FormData
      if (options.body instanceof FormData) {
        delete headers['Content-Type'];
      }

      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'same-origin' // Include cookies for session handling
      });

      // Handle offline mode
      if (!navigator.onLine) {
        throw new Error('You are currently offline. Please check your internet connection.');
      }

      // If response is not ok, handle the error
      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid, redirect to login
          this.handleLogout();
          throw new Error('Session expired. Please login again.');
        }
        
        // Try to parse error response as JSON, fallback to status text
        let errorMessage = response.statusText;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If we can't parse JSON, use status text
          console.warn('Could not parse error response as JSON:', e);
        }
        
        throw new Error(errorMessage || 'Something went wrong');
      }

      // Check if response has content before trying to parse as JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return response.json();
      } else if (response.status === 204 || response.status === 205) {
        // No content responses
        return null;
      } else {
        // For non-JSON responses, return as text
        return response.text();
      }
    } catch (error) {
      console.error('Fetch error:', error);
      // If we're offline, show a more specific error message
      if (!navigator.onLine) {
        throw new Error('You are currently offline. Please check your internet connection and try again.');
      }
      throw error; // Re-throw the error for the caller to handle
    }
  }

  // Helper: Get file icon based on MIME type
  getFileIcon(mimeType) {
    if (!mimeType) return 'fa-file';
    
    if (mimeType.startsWith('image/')) return 'fa-file-image';
    if (mimeType === 'application/pdf') return 'fa-file-pdf';
    if (mimeType === 'application/msword' || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') 
      return 'fa-file-word';
    if (mimeType === 'application/vnd.ms-excel' || mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      return 'fa-file-excel';
    if (mimeType === 'application/zip' || mimeType === 'application/x-rar-compressed' || mimeType === 'application/x-7z-compressed')
      return 'fa-file-archive';
    
    return 'fa-file';
  }

  // Helper: Format file size
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Initialize dashboard when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.dashboard = new Dashboard();
});
