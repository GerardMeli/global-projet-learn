document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    const logoutBtn = document.getElementById('logout-btn');
    const contentSections = document.querySelectorAll('.content-section');
    const navLinks = document.querySelectorAll('.nav-link');
    const electionsContainer = document.getElementById('electionsContainer');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const exportPdfBtn = document.getElementById('exportPdf');
    const exportCsvBtn = document.getElementById('exportCsv');
    const printResultsBtn = document.getElementById('printResults');
    const refreshElectionsBtn = document.getElementById('refreshElections');

    // Initialize
    setupSidebar();
    setupNavigation();
    setupLogout();
    setupResultsExport();
    
    // Only initialize elections if on elections page
    if (electionsContainer) {
        fetchElections();
        setupFilterButtons();
    }

    // Sidebar functionality
    function setupSidebar() {
        if (!sidebarToggle) return;
        
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
            this.setAttribute('aria-expanded', sidebar.classList.contains('collapsed') ? 'true' : 'false');
        });
    }

    // Navigation between sections
    function setupNavigation() {
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                // Handle external links (Voters, Candidates, Vote Office)
                const href = this.getAttribute('th:href') || this.getAttribute('href');
                if (href && (href.startsWith('/') || href.startsWith('#'))) {
                    // For hash links (internal navigation)
                    if (href.startsWith('#')) {
                        e.preventDefault();
                        const sectionId = href.substring(1);
                        showSection(sectionId);
                        
                        // Update active nav item
                        navLinks.forEach(nav => nav.classList.remove('active'));
                        this.classList.add('active');
                    }
                    // For regular links (/disp_voter, /disp_cand, etc.), let them work normally
                    return;
                }
                
                e.preventDefault();
                
                // Update active nav item
                navLinks.forEach(nav => nav.classList.remove('active'));
                this.classList.add('active');
                
                // Show corresponding section
                const sectionId = this.getAttribute('data-section') || this.getAttribute('href').substring(1);
                showSection(sectionId);
            });
        });

        // Show dashboard by default if no hash in URL
        if (!window.location.hash) {
            showSection('dashboard');
            document.querySelector('.nav-link[data-section="dashboard"]').classList.add('active');
        }
    }

    // Show specific content section and hide others
    function showSection(sectionId) {
        // Update URL hash
        window.location.hash = sectionId;
        
        contentSections.forEach(section => {
            if (section.id === `${sectionId}-content`) {
                section.classList.add('active');
                section.setAttribute('aria-hidden', 'false');
            } else {
                section.classList.remove('active');
                section.setAttribute('aria-hidden', 'true');
            }
        });
        
        // Special handling for certain sections
        if (sectionId === 'elections' && electionsContainer) {
            fetchElections(); // Refresh elections when navigating to this section
        }
    }

    // Handle initial page load with hash
    function handleInitialHash() {
        if (window.location.hash) {
            const sectionId = window.location.hash.substring(1);
            const correspondingLink = document.querySelector(`.nav-link[href="#${sectionId}"], .nav-link[data-section="${sectionId}"]`);
            
            if (correspondingLink) {
                navLinks.forEach(nav => nav.classList.remove('active'));
                correspondingLink.classList.add('active');
                showSection(sectionId);
            }
        }
    }
    handleInitialHash();

    // Logout confirmation
    function setupLogout() {
        if (!logoutBtn) return;
        
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const logoutModal = new bootstrap.Modal(document.getElementById('logoutModal'));
            logoutModal.show();
        });
    }

    // Results export buttons
    function setupResultsExport() {
        if (exportPdfBtn) {
            exportPdfBtn.addEventListener('click', function() {
                console.log('Exporting to PDF...');
                // Actual PDF export implementation would go here
            });
        }

        if (exportCsvBtn) {
            exportCsvBtn.addEventListener('click', function() {
                console.log('Exporting to CSV...');
                // Actual CSV export implementation would go here
            });
        }

        if (printResultsBtn) {
            printResultsBtn.addEventListener('click', function() {
                window.print();
            });
        }
    }

    // Fetch elections from backend
    async function fetchElections() {
        try {
            electionsContainer.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading elections...</div>';
            
            const response = await fetch('/election/show');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const elections = await response.json();
            window.electionData = elections; // Store for filtering
            renderElections(elections);
        } catch (error) {
            console.error('Fetch error:', error);
            showErrorMessage();
        }
    }

    // Show error message
    function showErrorMessage() {
        electionsContainer.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error loading elections. Please try again later.</p>
                <button class="btn btn-retry" id="retryElections">Retry</button>
            </div>
        `;
        
        document.getElementById('retryElections').addEventListener('click', fetchElections);
    }

    // Render elections list
    function renderElections(elections) {
        if (!elections || !elections.length) {
            electionsContainer.innerHTML = `
                <div class="no-elections">
                    <i class="fas fa-info-circle"></i>
                    <p>No elections found matching your criteria.</p>
                </div>
            `;
            return;
        }

        electionsContainer.innerHTML = elections.map(election => `
            <div class="election-card">
                <div class="card-header">
                    <span class="status-badge ${getStatusClass(election.electionStatus)}">
                        ${election.electionStatus || 'UNKNOWN'}
                    </span>
                    <h3 class="card-title">${election.electionName || 'Unnamed Election'}</h3>
                </div>
                <div class="card-body">
                    <p class="card-description">${election.electionDescription || 'No description available'}</p>
                    <div class="card-dates">
                        <div class="date-item">
                            <i class="fas fa-calendar-alt"></i>
                            <span>Starts: ${formatDate(election.electionStartDate)}</span>
                        </div>
                        <div class="date-item">
                            <i class="fas fa-calendar-check"></i>
                            <span>Ends: ${formatDate(election.electionEndDate)}</span>
                        </div>
                    </div>
                </div>
                <div class="card-footer">
                    <div class="participants">
                        <i class="fas fa-users"></i>
                        <span>${election.users?.length || 0} participants</span>
                    </div>
                    ${createActionButton(election)}
                </div>
            </div>
        `).join('');

        // Add event listeners to action buttons
        document.querySelectorAll('.register-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const electionId = this.dataset.id;
                registerForElection(electionId);
            });
        });
    }

    // Get status class for styling
    function getStatusClass(status) {
        if (!status) return 'status-unknown';
        switch(status.toUpperCase()) {
            case 'ACTIVE': return 'status-active';
            case 'UPCOMING': return 'status-upcoming';
            case 'SCHEDULED': return 'status-upcoming';
            case 'ENDED': return 'status-ended';
            case 'CANCELLED': return 'status-cancelled';
            default: return 'status-unknown';
        }
    }

    // Format date
    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        try {
            const options = { year: 'numeric', month: 'short', day: 'numeric' };
            return new Date(dateString).toLocaleDateString(undefined, options);
        } catch {
            return 'Invalid date';
        }
    }

    // Create appropriate action button
    function createActionButton(election) {
        const status = election.electionStatus?.toUpperCase();
        const isUpcoming = status === 'UPCOMING' || status === 'SCHEDULED';
        const isActive = status === 'ACTIVE';
        const id = election.idElection || election.id;
        
        if (isUpcoming) {
            return `<a href="#" class="action-btn register-btn" data-id="${id}">
                <i class="fas fa-user-plus"></i> Register
            </a>`;
        } else if (isActive) {
            return `<a href="/elections/vote/${id}" class="action-btn vote-btn">
                <i class="fas fa-vote-yea"></i> Vote Now
            </a>`;
        } else {
            return `<a href="/elections/${id}" class="action-btn view-btn">
                <i class="fas fa-eye"></i> View Results
            </a>`;
        }
    }

    // Set up filter buttons
    function setupFilterButtons() {
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Update active button
                filterButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                // Filter elections
                const status = this.dataset.status;
                filterElections(status);
            });
        });
    }

    // Filter elections by status
    function filterElections(status) {
        if (!window.electionData) return;
        
        const filtered = status === 'all' ? 
            window.electionData : 
            window.electionData.filter(election => {
                const electionStatus = election.electionStatus?.toUpperCase();
                if (status === 'UPCOMING') {
                    return electionStatus === 'UPCOMING' || electionStatus === 'SCHEDULED';
                }
                return electionStatus === status;
            });
        
        renderElections(filtered);
    }

    // Register for an election
    async function registerForElection(electionId) {
        try {
            const response = await fetch(`/election/register/${electionId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Include CSRF token if needed
                    // 'X-CSRF-TOKEN': document.querySelector('meta[name="_csrf"]').content
                }
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Registration failed: ${response.status}`);
            }
            
            const result = await response.json();
            showToast(`Successfully registered for election: ${result.electionName}`);
            fetchElections(); // Refresh the list
        } catch (error) {
            console.error('Registration error:', error);
            showToast(error.message || 'Failed to register for election. Please try again.', 'error');
        }
    }

    // Show toast notification
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast-notification toast-${type}`;
        toast.innerHTML = `
            <div class="toast-message">${message}</div>
            <button class="toast-close">&times;</button>
        `;
        
        document.body.appendChild(toast);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 300);
        }, 5000);
        
        // Manual close
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 300);
        });
    }

    // Refresh elections button
    if (refreshElectionsBtn) {
        refreshElectionsBtn.addEventListener('click', fetchElections);
    }
});
