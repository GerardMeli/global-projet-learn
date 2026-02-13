document.addEventListener('DOMContentLoaded', function() {
    const voterGrid = document.getElementById('voterGrid');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const noResults = document.getElementById('noResults');
    const searchInput = document.getElementById('searchInput');
    const regionFilter = document.getElementById('regionFilter');
    const roleFilter = document.getElementById('roleFilter');
    const pagination = document.getElementById('pagination');
    const editVoterBtn = document.getElementById('editVoterBtn');
    
    let allVoters = [];
    let currentPage = 1;
    const votersPerPage = 9;
    
    // Initialize modal
    const voterModal = new bootstrap.Modal(document.getElementById('voterModal'));
    
    // Fetch voters from Spring Boot backend
    fetchVoters();
    
    // Search and filter event listeners
    searchInput.addEventListener('input', filterVoters);
    regionFilter.addEventListener('change', filterVoters);
    roleFilter.addEventListener('change', filterVoters);
    
    // Edit button handler
    editVoterBtn.addEventListener('click', function() {
        // In a real app, this would open an edit form
        alert('Edit functionality would be implemented here');
    });
    
    async function fetchVoters() {
        try {
            const response = await fetch('/voter/display');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            allVoters = await response.json();
            
            // Populate filters
            populateFilters();
            
            // Display voters
            displayVoters(allVoters);
            
            // Hide loading indicator
            loadingIndicator.classList.add('d-none');
        } catch (error) {
            console.error('Error fetching voters:', error);
            loadingIndicator.innerHTML = `
                <div class="alert alert-danger" role="alert">
                    Failed to load voters. Please try again later.
                </div>
            `;
        }
    }
    
    function populateFilters() {
        // Get unique regions
        const regions = [...new Set(allVoters.map(v => v.region))].filter(r => r);
        regions.forEach(region => {
            const option = document.createElement('option');
            option.value = region;
            option.textContent = region;
            regionFilter.appendChild(option);
        });
    }
    
    function displayVoters(voters) {
        voterGrid.innerHTML = '';
        
        if (voters.length === 0) {
            noResults.classList.remove('d-none');
            pagination.classList.add('d-none');
            return;
        }
        
        noResults.classList.add('d-none');
        
        voters.forEach(voter => {
            const card = createVoterCard(voter);
            voterGrid.appendChild(card);
        });
        
        // In a real app, you would implement pagination here
        // setupPagination(voters);
    }
    
    function createVoterCard(voter) {
        const col = document.createElement('div');
        col.className = 'col';
        
        const card = document.createElement('div');
        card.className = 'voter-card';
        
        // Generate initials for avatar
        const initials = getInitials(voter.firstname, voter.lastname);
        
        // Calculate age
        const age = calculateAge(voter.birthdate);
        
        // Determine role badge class
        const roleClass = getRoleClass(voter.role);
        
        card.innerHTML = `
            <div class="card-avatar">${initials}</div>
            <div class="card-body">
                <h5 class="card-title">${voter.firstname} ${voter.lastname}</h5>
                <h6 class="card-subtitle">Voter #${voter.number || 'N/A'}</h6>
                <p class="card-text"><strong>Region:</strong> ${voter.region || 'N/A'}</p>
                <p class="card-text"><strong>Age:</strong> ${age} years</p>
                <span class="role-badge ${roleClass}">${formatRole(voter.role)}</span>
                <button class="btn btn-view mt-3" data-id="${voter.id}">
                    View Details
                </button>
            </div>
        `;
        
        col.appendChild(card);
        
        // Add click event to view button
        col.querySelector('.btn-view').addEventListener('click', () => showVoterDetails(voter));
        
        return col;
    }
    
    function showVoterDetails(voter) {
        // Calculate age
        const age = calculateAge(voter.birthdate);
        
        // Format birthdate
        const formattedBirthdate = formatDate(voter.birthdate);
        
        // Set modal content
        document.getElementById('modalVoterName').textContent = 
            `${voter.firstname} ${voter.lastname}`;
            
        document.getElementById('modalAvatar').textContent = 
            getInitials(voter.firstname, voter.lastname);
            
        document.getElementById('modalRole').textContent = formatRole(voter.role);
        document.getElementById('modalRole').className = `badge ${getRoleClass(voter.role)}`;
        document.getElementById('modalBirthdate').textContent = formattedBirthdate;
        document.getElementById('modalGender').textContent = voter.gender || 'N/A';
        document.getElementById('modalPlaceOfBirth').textContent = voter.placeofbirth || 'N/A';
        document.getElementById('modalAge').textContent = `${age} years`;
        document.getElementById('modalNumber').textContent = voter.number || 'N/A';
        document.getElementById('modalLocation').textContent = voter.location || 'N/A';
        document.getElementById('modalRegion').textContent = voter.region || 'N/A';
        document.getElementById('modalDepartment').textContent = voter.department || 'N/A';
        document.getElementById('modalArron').textContent = voter.arron || 'N/A';
        
        // Show modal
        voterModal.show();
    }
    
    function filterVoters() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedRegion = regionFilter.value;
        const selectedRole = roleFilter.value;
        
        const filtered = allVoters.filter(voter => {
            const fullName = `${voter.firstname} ${voter.lastname}`.toLowerCase();
            const matchesSearch = fullName.includes(searchTerm) || 
                                (voter.number && voter.number.toString().includes(searchTerm)) ||
                                (voter.region && voter.region.toLowerCase().includes(searchTerm));
            
            const matchesRegion = !selectedRegion || voter.region === selectedRegion;
            const matchesRole = !selectedRole || voter.role === selectedRole;
            
            return matchesSearch && matchesRegion && matchesRole;
        });
        
        displayVoters(filtered);
    }
    
    // Utility functions
    function getInitials(firstname, lastname) {
        return `${firstname?.charAt(0) || ''}${lastname?.charAt(0) || ''}`.toUpperCase();
    }
    
    function calculateAge(birthdate) {
        if (!birthdate) return 'N/A';
        
        const birthDate = new Date(birthdate);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age;
    }
    
    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }
    
    function formatRole(role) {
        if (!role) return 'Unknown';
        return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
    }
    
    function getRoleClass(role) {
        switch(role) {
            case 'ADMIN': return 'bg-danger';
            case 'OFFICIAL': return 'bg-warning text-dark';
            case 'VOTER': return 'bg-success';
            default: return 'bg-secondary';
        }
    }
});