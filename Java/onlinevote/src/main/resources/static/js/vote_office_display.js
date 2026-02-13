// DOM elements
const officesContainer = document.getElementById('officesContainer');
const pagination = document.getElementById('pagination');
const searchInput = document.getElementById('searchInput');

// Pagination variables
const itemsPerPage = 6;
let currentPage = 1;
let offices = []; // This will be populated from the database

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    fetchOffices(); // Fetch data from database instead of using sample data
    
    // Search functionality
    searchInput.addEventListener('input', handleSearch);
});

// Fetch offices from database
async function fetchOffices() {
    try {
        // Show loading state
        officesContainer.innerHTML = '<div class="loading">Loading offices...</div>';
        
        const response = await fetch('/vote_office/get'); // Replace with your actual API endpoint
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        offices = await response.json();
        
        if (offices.length === 0) {
            officesContainer.innerHTML = '<p class="no-results">No offices found in the database.</p>';
            return;
        }
        
        renderOffices();
        setupPagination();
    } catch (error) {
        console.error('Error fetching offices:', error);
        officesContainer.innerHTML = '<p class="error-message">Error loading offices. Please try again later.</p>';
    }
}

// Render offices to the grid
function renderOffices(officesToRender = offices) {
    officesContainer.innerHTML = '';

    if (officesToRender.length === 0) {
        officesContainer.innerHTML = '<p class="no-results">No offices found matching your criteria.</p>';
        return;
    }

    // Calculate pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedOffices = officesToRender.slice(startIndex, endIndex);

    paginatedOffices.forEach(office => {
        const officeCard = document.createElement('div');
        officeCard.className = 'office-card';

        officeCard.innerHTML = `
            <div class="card-header">
                <h3 class="card-title">${office.nameOffice}</h3>
                <div class="card-location">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${office.locationOffice}</span>
                </div>
            </div>
            <div class="card-body">
                <p class="card-description">${office.descriptionOffice}</p>
                <div class="voters-count">
                    <i class="fas fa-users"></i>
                    <span>${office.voters} registered voters</span>
                </div>
            </div>
            <div class="card-footer">
                <div class="office-id">
                    <i class="fas fa-hashtag"></i>
                    <span>ID: ${office.idOffice}</span>
                </div>
                <div class="action-btns">
                    <a href="/offices/${office.idOffice}" class="action-btn view-btn">
                        <i class="fas fa-eye"></i> View
                    </a>
                    <a href="/offices/${office.idOffice}/edit" class="action-btn edit-btn">
                        <i class="fas fa-edit"></i> Edit
                    </a>
                    <a href="/offices/${office.idOffice}/delete" class="action-btn delete-btn">
                        <i class="fas fa-trash"></i> Delete
                    </a>
                </div>
            </div>
        `;

        officesContainer.appendChild(officeCard);
    });
}

// Set up pagination
function setupPagination(officesToPaginate = offices) {
    pagination.innerHTML = '';
    const pageCount = Math.ceil(officesToPaginate.length / itemsPerPage);

    if (pageCount <= 1) return;

    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'page-btn';
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderOffices(officesToPaginate);
            setupPagination(officesToPaginate);
        }
    });
    pagination.appendChild(prevBtn);

    // Page buttons
    for (let i = 1; i <= pageCount; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
        pageBtn.textContent = i;
        pageBtn.addEventListener('click', () => {
            currentPage = i;
            renderOffices(officesToPaginate);
            setupPagination(officesToPaginate);
        });
        pagination.appendChild(pageBtn);
    }

    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'page-btn';
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextBtn.addEventListener('click', () => {
        if (currentPage < pageCount) {
            currentPage++;
            renderOffices(officesToPaginate);
            setupPagination(officesToPaginate);
        }
    });
    pagination.appendChild(nextBtn);
}

// Handle search
function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase();

    if (searchTerm === '') {
        currentPage = 1;
        renderOffices();
        setupPagination();
        return;
    }

    const filteredOffices = offices.filter(office =>
        office.nameOffice.toLowerCase().includes(searchTerm) ||
        office.locationOffice.toLowerCase().includes(searchTerm) ||
        office.descriptionOffice.toLowerCase().includes(searchTerm) ||
        office.idOffice.toString().includes(searchTerm) ||
        office.voters.toString().includes(searchTerm)
    );

    currentPage = 1;
    renderOffices(filteredOffices);
    setupPagination(filteredOffices);
}