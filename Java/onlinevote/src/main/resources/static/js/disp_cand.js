document.addEventListener('DOMContentLoaded', function() {
    const candidateGrid = document.getElementById('candidateGrid');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const noResults = document.getElementById('noResults');
    const searchInput = document.getElementById('searchInput');
    const partyFilter = document.getElementById('partyFilter');
    const regionFilter = document.getElementById('regionFilter');
    const pagination = document.getElementById('pagination');
    
    let allCandidates = [];
    let currentPage = 1;
    const candidatesPerPage = 9;
    
    // Initialize modal
    const candidateModal = new bootstrap.Modal(document.getElementById('candidateModal'));
    
    // Fetch candidates from Spring Boot backend
    fetchCandidates();
    
    // Search and filter event listeners
    searchInput.addEventListener('input', filterCandidates);
    partyFilter.addEventListener('change', filterCandidates);
    regionFilter.addEventListener('change', filterCandidates);
    
    async function fetchCandidates() {
        try {
            const response = await fetch('/candidate/display');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            allCandidates = await response.json();
            
            // Populate filters
            populateFilters();
            
            // Display candidates
            displayCandidates(allCandidates);
            
            // Hide loading indicator
            loadingIndicator.classList.add('d-none');
        } catch (error) {
            console.error('Error fetching candidates:', error);
            loadingIndicator.innerHTML = `
                <div class="alert alert-danger" role="alert">
                    Failed to load candidates. Please try again later.
                </div>
            `;
        }
    }
    
    function populateFilters() {
        // Get unique parties
        const parties = [...new Set(allCandidates.map(c => c.party))].filter(p => p);
        parties.forEach(party => {
            const option = document.createElement('option');
            option.value = party;
            option.textContent = party;
            partyFilter.appendChild(option);
        });
        
        // Get unique regions
        const regions = [...new Set(allCandidates.map(c => c.region))].filter(r => r);
        regions.forEach(region => {
            const option = document.createElement('option');
            option.value = region;
            option.textContent = region;
            regionFilter.appendChild(option);
        });
    }
    
    function displayCandidates(candidates) {
        candidateGrid.innerHTML = '';
        
        if (candidates.length === 0) {
            noResults.classList.remove('d-none');
            pagination.classList.add('d-none');
            return;
        }
        
        noResults.classList.add('d-none');
        
        // For now, show all candidates (pagination would be implemented here)
        candidates.forEach(candidate => {
            const card = createCandidateCard(candidate);
            candidateGrid.appendChild(card);
        });
        
        // In a real app, you would implement pagination here
        // setupPagination(candidates);
    }
    
    function createCandidateCard(candidate) {
        const col = document.createElement('div');
        col.className = 'col';
        
        const card = document.createElement('div');
        card.className = 'candidate-card';
        
        // Generate initials for avatar
        const initials = getInitials(candidate.firstname, candidate.lastname);
        
        // Calculate age
        const age = calculateAge(candidate.birthdate);
        
        card.innerHTML = `
            <div class="card-avatar">${initials}</div>
            <div class="card-body">
                <h5 class="card-title">${candidate.firstname} ${candidate.lastname}</h5>
                <h6 class="card-subtitle">${candidate.region || 'N/A'}</h6>
                <p class="card-text"><strong>Party:</strong> ${candidate.party || 'Independent'}</p>
                <p class="card-text"><strong>Age:</strong> ${age} years</p>
                <span class="card-badge">${candidate.department || 'N/A'}</span>
                <button class="btn btn-view mt-3" data-id="${candidate.id}">
                    View Details
                </button>
            </div>
        `;
        
        col.appendChild(card);
        
        // Add click event to view button
        col.querySelector('.btn-view').addEventListener('click', () => showCandidateDetails(candidate));
        
        return col;
    }
    
    function showCandidateDetails(candidate) {
        // Calculate age
        const age = calculateAge(candidate.birthdate);
        
        // Format birthdate
        const formattedBirthdate = formatDate(candidate.birthdate);
        
        // Set modal content
        document.getElementById('modalCandidateName').textContent = 
            `${candidate.firstname} ${candidate.lastname}`;
            
        document.getElementById('modalAvatar').textContent = 
            getInitials(candidate.firstname, candidate.lastname);
            
        document.getElementById('modalParty').textContent = candidate.party || 'Independent';
        document.getElementById('modalBirthdate').textContent = formattedBirthdate;
        document.getElementById('modalGender').textContent = candidate.gender || 'N/A';
        document.getElementById('modalPlaceOfBirth').textContent = candidate.placeofbirth || 'N/A';
        document.getElementById('modalAge').textContent = `${age} years`;
        document.getElementById('modalLocation').textContent = candidate.location || 'N/A';
        document.getElementById('modalRegion').textContent = candidate.region || 'N/A';
        document.getElementById('modalDepartment').textContent = candidate.department || 'N/A';
        document.getElementById('modalArron').textContent = candidate.arron || 'N/A';
        
        // Show modal
        candidateModal.show();
    }
    
    function filterCandidates() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedParty = partyFilter.value;
        const selectedRegion = regionFilter.value;
        
        const filtered = allCandidates.filter(candidate => {
            const fullName = `${candidate.firstname} ${candidate.lastname}`.toLowerCase();
            const matchesSearch = fullName.includes(searchTerm) || 
                                (candidate.party && candidate.party.toLowerCase().includes(searchTerm)) ||
                                (candidate.region && candidate.region.toLowerCase().includes(searchTerm));
            
            const matchesParty = !selectedParty || candidate.party === selectedParty;
            const matchesRegion = !selectedRegion || candidate.region === selectedRegion;
            
            return matchesSearch && matchesParty && matchesRegion;
        });
        
        displayCandidates(filtered);
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
});