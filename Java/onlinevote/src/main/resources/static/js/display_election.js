document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const electionsContainer = document.getElementById('electionsContainer');
    const filterButtons = document.querySelectorAll('.filter-btn');

    // Initialize
    fetchElections();
    setupFilterButtons();

    // Fetch elections from backend
    async function fetchElections() {
        try {
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
            </div>
        `;
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
    }

    // Get status class for styling
    function getStatusClass(status) {
        if (!status) return 'status-unknown';
        switch(status.toUpperCase()) {
            case 'ACTIVE': return 'status-active';
            case 'UPCOMING': return 'status-upcoming';
            case 'SCHEDULED': return 'status-upcoming';
            case 'ENDED': return 'status-ended';
            default: return 'status-unknown';
        }
    }

    // Format date
    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString();
        } catch {
            return 'Invalid date';
        }
    }

    // Create appropriate action button
    function createActionButton(election) {
        const status = election.electionStatus?.toUpperCase();
        const isUpcoming = status === 'UPCOMING' || status === 'SCHEDULED';
        const id = election.idElection || election.id;
        
        return isUpcoming ?
            `<a href="#" class="action-btn register-btn" data-id="${id}">
                <i class="fas fa-user-plus"></i> Register
            </a>` :
            `<a href="/elections/${id}" class="action-btn view-btn">
                <i class="fas fa-eye"></i> View
            </a>`;
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
});