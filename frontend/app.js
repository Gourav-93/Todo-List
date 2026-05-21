// ==========================================
// STATE MANAGEMENT & STATE
// ==========================================
let tasksState = [];
let currentFilter = 'all';
const API_BASE_URL = 'http://localhost:8080/api/tasks';

// ==========================================
// DOM ELEMENTS
// ==========================================
const taskList = document.getElementById('taskList');
const btnNewTask = document.getElementById('btnNewTask');
const btnCancelModal = document.getElementById('btnCancelModal');
const btnSecondaryModal = document.getElementById('btnSecondaryModal');
const btnSubmitModal = document.getElementById('btnSubmitModal');
const taskModal = document.getElementById('taskModal');
const taskForm = document.getElementById('taskForm');
const modalTitle = document.getElementById('modalTitle');
const themeToggle = document.getElementById('themeToggle');

// Form Inputs
const taskIdInput = document.getElementById('taskId');
const titleInput = document.getElementById('titleInput');
const descInput = document.getElementById('descInput');
const titleError = document.getElementById('titleError');
const descError = document.getElementById('descError');
const taskSearch = document.getElementById('taskSearch');

// Statistics
const statAllValue = document.querySelector('#statAll .stat-value');
const statPendingValue = document.querySelector('#statPending .stat-value');
const statCompletedValue = document.querySelector('#statCompleted .stat-value');

// ==========================================
// APP INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    fetchTasks();
    setupEventListeners();
});

// ==========================================
// THEME MANAGEMENT
// ==========================================
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
    showToast(`Switched to ${newTheme} theme`, 'info');
}

function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    if (theme === 'dark') {
        icon.className = 'fa-solid fa-sun';
        themeToggle.title = 'Switch to Light Mode';
    } else {
        icon.className = 'fa-solid fa-moon';
        themeToggle.title = 'Switch to Dark Mode';
    }
}

// ==========================================
// EVENT LISTENERS Setup
// ==========================================
function setupEventListeners() {
    // Theme
    themeToggle.addEventListener('click', toggleTheme);

    // Modal Control
    btnNewTask.addEventListener('click', () => openModal(false));
    btnCancelModal.addEventListener('click', closeModal);
    btnSecondaryModal.addEventListener('click', closeModal);
    
    // Close modal on overlay click
    taskModal.addEventListener('click', (e) => {
        if (e.target === taskModal) closeModal();
    });

    // Form Submit
    taskForm.addEventListener('submit', handleFormSubmit);

    // Filter Tabs
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            fetchTasks();
        });
    });

    // Live Search
    taskSearch.addEventListener('input', handleSearch);
}

// ==========================================
// REST API INTEGRATION (CRUD Operations)
// ==========================================

// Fetch tasks based on active category
async function fetchTasks() {
    try {
        let endpoint = API_BASE_URL;
        if (currentFilter === 'completed') {
            endpoint = `${API_BASE_URL}/completed`;
        } else if (currentFilter === 'pending') {
            endpoint = `${API_BASE_URL}/pending`;
        }

        const response = await fetch(endpoint);
        if (!response.ok) throw new Error('Could not fetch tasks');
        
        tasksState = await response.json();
        renderTasks(tasksState);
        updateStats();
    } catch (error) {
        console.error(error);
        taskList.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-triangle-exclamation empty-state-icon" style="color: var(--danger);"></i>
                <h4>Connection Error</h4>
                <p>Failed to sync with the backend REST API server at <code>${API_BASE_URL}</code>.</p>
                <p style="margin-top: 10px; font-size: 11px; color: var(--text-secondary);">Please verify the Spring Boot application is running and CORS is configured properly.</p>
            </div>
        `;
    }
}

// Update the global quick stats bar by fetching all tasks
async function updateStats() {
    try {
        // Fetch all tasks directly for precise dashboard statistics computation
        const response = await fetch(API_BASE_URL);
        if (!response.ok) return;
        const allTasks = await response.json();
        
        const total = allTasks.length;
        const completed = allTasks.filter(t => t.completed).length;
        const pending = total - completed;

        statAllValue.textContent = total;
        statPendingValue.textContent = pending;
        statCompletedValue.textContent = completed;
    } catch (error) {
        console.error('Failed to update stats:', error);
    }
}

// Form Submission (Create or Update)
async function handleFormSubmit(e) {
    e.preventDefault();
    clearErrors();

    const taskId = taskIdInput.value;
    const title = titleInput.value.trim();
    const description = descInput.value.trim();

    // Client-side quick check
    let hasError = false;
    if (!title) {
        showInputError(titleInput, titleError, 'Title is required');
        hasError = true;
    }
    if (!description) {
        showInputError(descInput, descError, 'Description is required');
        hasError = true;
    }
    if (hasError) return;

    const taskPayload = { title, description };
    const isEditMode = !!taskId;

    try {
        let response;
        if (isEditMode) {
            response = await fetch(`${API_BASE_URL}/${taskId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(taskPayload)
            });
        } else {
            response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(taskPayload)
            });
        }

        if (response.ok) {
            closeModal();
            fetchTasks();
            showToast(
                isEditMode ? 'Task updated successfully' : 'Task created successfully',
                'success'
            );
        } else {
            const errorData = await response.json();
            if (errorData.details && Array.isArray(errorData.details)) {
                // Display validation errors returned by global exception handler
                errorData.details.forEach(err => {
                    if (err.toLowerCase().includes('title')) {
                        showInputError(titleInput, titleError, err);
                    } else if (err.toLowerCase().includes('description')) {
                        showInputError(descInput, descError, err);
                    }
                });
            } else {
                showToast(errorData.message || 'Operation failed', 'danger');
            }
        }
    } catch (error) {
        console.error(error);
        showToast('Server communication failure', 'danger');
    }
}

// Toggle Task Completed Status
async function toggleTask(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}/toggle`, {
            method: 'PATCH'
        });
        if (response.ok) {
            const updatedTask = await response.json();
            fetchTasks();
            showToast(
                updatedTask.completed ? 'Task marked as completed' : 'Task marked as pending',
                'success'
            );
        } else {
            showToast('Failed to toggle status', 'danger');
        }
    } catch (error) {
        console.error(error);
        showToast('Server communication failure', 'danger');
    }
}

// Delete Task
async function deleteTask(id) {
    if (!confirm('Are you sure you want to permanently delete this task?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'DELETE'
        });
        if (response.status === 204 || response.ok) {
            fetchTasks();
            showToast('Task deleted successfully', 'success');
        } else {
            showToast('Failed to delete task', 'danger');
        }
    } catch (error) {
        console.error(error);
        showToast('Server communication failure', 'danger');
    }
}

// ==========================================
// MODAL CONTROLS & RENDER UTILS
// ==========================================
function openModal(editMode = false, task = null) {
    clearErrors();
    taskForm.reset();
    
    if (editMode && task) {
        modalTitle.textContent = 'Edit Task';
        btnSubmitModal.textContent = 'Save Changes';
        taskIdInput.value = task.id;
        titleInput.value = task.title;
        descInput.value = task.description;
    } else {
        modalTitle.textContent = 'Create New Task';
        btnSubmitModal.textContent = 'Create Task';
        taskIdInput.value = '';
    }
    
    taskModal.classList.add('active');
    titleInput.focus();
}

// Close Modal
function closeModal() {
    taskModal.classList.remove('active');
}

function showInputError(inputEl, errorEl, message) {
    inputEl.style.borderColor = 'var(--danger)';
    errorEl.textContent = message;
    errorEl.style.display = 'block';
}

function clearErrors() {
    titleInput.style.borderColor = 'var(--border-color)';
    descInput.style.borderColor = 'var(--border-color)';
    titleError.style.display = 'none';
    descError.style.display = 'none';
}

// Format date nicely (Localised Date Time)
function formatCreatedAt(dateString) {
    if (!dateString) return 'Just now';
    try {
        const date = new Date(dateString);
        return date.toLocaleString(undefined, { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric',
            hour: '2-digit', 
            minute: '2-digit' 
        });
    } catch (e) {
        return dateString;
    }
}

// ==========================================
// LIVE SEARCH FILTER
// ==========================================
function handleSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    if (!query) {
        renderTasks(tasksState);
        return;
    }

    const filtered = tasksState.filter(task => 
        task.title.toLowerCase().includes(query) || 
        task.description.toLowerCase().includes(query)
    );
    renderTasks(filtered, true);
}

// ==========================================
// ELEMENT INJECTION & RENDER
// ==========================================
function renderTasks(tasks, isSearching = false) {
    taskList.innerHTML = '';

    if (tasks.length === 0) {
        let title = 'No tasks found';
        let sub = `Click "New Task" at the top right to start.`;
        if (isSearching) {
            title = 'No search results';
            sub = 'Try searching for different keywords.';
        } else if (currentFilter === 'completed') {
            title = 'No completed tasks';
            sub = 'Completed tasks will show up here.';
        } else if (currentFilter === 'pending') {
            title = 'All caught up!';
            sub = 'No pending tasks left to execute.';
        }

        taskList.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-list empty-state-icon"></i>
                <h4>${title}</h4>
                <p>${sub}</p>
            </div>
        `;
        return;
    }

    tasks.forEach(task => {
        const card = document.createElement('div');
        card.className = `task-card ${task.completed ? 'completed' : 'pending'}`;
        card.id = `task-card-${task.id}`;

        const formattedDate = formatCreatedAt(task.createdAt);

        card.innerHTML = `
            <div class="task-content">
                <div class="task-title-row">
                    <span class="task-title">${escapeHTML(task.title)}</span>
                    <span class="badge ${task.completed ? 'badge-completed' : 'badge-pending'}">
                        <i class="fa-solid ${task.completed ? 'fa-check-double' : 'fa-clock'}"></i>
                        ${task.completed ? 'Completed' : 'Pending'}
                    </span>
                </div>
                <p class="task-desc">${escapeHTML(task.description)}</p>
                <div class="task-meta">
                    <i class="fa-regular fa-calendar-plus"></i> Created: ${formattedDate}
                </div>
            </div>
            <div class="task-actions">
                <button class="btn-action toggle-btn" title="${task.completed ? 'Mark Pending' : 'Mark Completed'}" aria-label="Toggle Status">
                    <i class="fa-solid ${task.completed ? 'fa-rotate-left' : 'fa-check'}"></i>
                </button>
                <button class="btn-action edit-btn" title="Edit Task" aria-label="Edit Task">
                    <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button class="btn-action delete-btn" title="Delete Task" aria-label="Delete Task">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `;

        // Register Action Listeners
        card.querySelector('.toggle-btn').addEventListener('click', () => toggleTask(task.id));
        card.querySelector('.edit-btn').addEventListener('click', () => openModal(true, task));
        card.querySelector('.delete-btn').addEventListener('click', () => deleteTask(task.id));

        taskList.appendChild(card);
    });
}

// XSS Protection
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

// ==========================================
// TOAST NOTIFICATIONS ENGINE
// ==========================================
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconClass = 'fa-circle-info';
    if (type === 'success') iconClass = 'fa-circle-check';
    else if (type === 'danger') iconClass = 'fa-circle-exclamation';

    toast.innerHTML = `
        <i class="fa-solid ${iconClass}"></i>
        <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);

    // Auto remove toast after 3 seconds
    setTimeout(() => {
        toast.classList.add('removing');
        toast.addEventListener('transitionend', () => {
            toast.remove();
        });
    }, 3000);
}
