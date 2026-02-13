document.addEventListener('DOMContentLoaded', function() {
    // Initialize form with max birthdate and event listeners
    initForm();
});

const voteOffices = {
    // This should come from your backend, but here's an example structure
    "1": { id: 1, name: "Yaoundé Main Office", location: "Bastos, Yaoundé" },
    "2": { id: 2, name: "Douala Central Office", location: "Bonanjo, Douala" }
    // Add more offices as needed
};


function initForm() {
    // Set max date for birthdate (today)
    document.getElementById('birthdate').max = new Date().toISOString().split('T')[0];
    
    // Setup all event listeners
    setupEventListeners();
    
    // Initialize polling stations dropdown
    updatePollingStations();

    // Setup vote office dropdown
    setupVoteOfficeDropdown();

    // Setup election checkboxes
    setupElectionCheckboxes();
}

function setupEventListeners() {
    const form = document.getElementById("voterForm");
    
    // Real-time validation on input
    form.addEventListener('input', function(event) {
        if (event.target.matches('input, select')) {
            validateField(event.target);
        }
    });
    
    // Validation on blur
    form.addEventListener('focusout', function(event) {
        if (event.target.matches('input, select')) {
            validateField(event.target);
        }
    });
    
    // Special validation for birth date
    document.getElementById('birthdate').addEventListener('change', validateBirthDate);
    
    // Update polling stations when current region changes
    document.getElementById('currentregion').addEventListener('change', updatePollingStations);
    
    // Form submission handler
    form.addEventListener('submit', handleFormSubmit);
    
    // Draft saving functionality
    document.getElementById('saveDraftBtn').addEventListener('click', saveAsDraft);
}

function validateField(element) {
    const errorElement = element.nextElementSibling?.classList.contains('error-message')
        ? element.nextElementSibling
        : null;

    element.classList.remove('error-highlight', 'success-highlight');

    if (element.checkValidity()) {
        if (element.value && !element.hasAttribute('data-no-success')) {
            element.classList.add('success-highlight');
        }
        element.setAttribute('aria-invalid', 'false');
        if (errorElement) errorElement.textContent = '';
    } else {
        element.classList.add('error-highlight');
        element.setAttribute('aria-invalid', 'true');
        if (errorElement) {
            errorElement.textContent = element.validationMessage || 'Please fill this field correctly';
        }
    }
}

function validateBirthDate() {
    const birthDateInput = document.getElementById('birthdate');
    const errorElement = document.getElementById('birthdateError');
    const birthDate = new Date(birthDateInput.value);
    const today = new Date();

    birthDateInput.classList.remove('error-highlight', 'success-highlight');
    birthDateInput.setCustomValidity('');
    errorElement.textContent = '';
    birthDateInput.setAttribute('aria-invalid', 'false');

    if (!birthDateInput.value) return;

    if (birthDate > today) {
        const errorMsg = 'Birth date cannot be in the future';
        birthDateInput.setCustomValidity(errorMsg);
        errorElement.textContent = errorMsg;
        birthDateInput.classList.add('error-highlight');
        birthDateInput.setAttribute('aria-invalid', 'true');
        return;
    }

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    if (age < 21) {
        const errorMsg = `You must be at least 21 years old (current age: ${age})`;
        birthDateInput.setCustomValidity(errorMsg);
        errorElement.textContent = errorMsg;
        birthDateInput.classList.add('error-highlight');
        birthDateInput.setAttribute('aria-invalid', 'true');
    } else {
        birthDateInput.classList.add('success-highlight');
        validateField(birthDateInput);
    }
}


async function handleFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const submitButton = document.getElementById('submitButton');

        // Collect checkbox values
    const selectedElections = Array.from(document.querySelectorAll('input[name="register"]:checked'))
                                 .map(checkbox => checkbox.value);
    
    // Prepare form data including the new fields
    const formData = {
        ...Object.fromEntries(new FormData(form)),
        register: selectedElections
    };

    // Validate all fields before submission
    if (!validateAllFields(form)) {
        showAlert('Please fill out all required fields correctly.', 'error');
        return;
    }

    try {
        // Show loading state
        submitButton.classList.add('loading');
        submitButton.disabled = true;

        // Prepare form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Format birth date
        if (data.birthdate) {
            data.birthdate = new Date(data.birthdate).toISOString().split('T')[0];
        }

        // Get CSRF token from form
        const csrfToken = document.querySelector('input[name="_csrf"]').value;

        // Submit data to server
        const response = await fetch(form.action, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRF-TOKEN': csrfToken
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            const result = await response.json();
            showSuccessMessage(result);
            form.reset();
        } else {
            const errorResponse = await response.json();
            handleServerErrors(errorResponse);
        }
    } catch (error) {
        showAlert('An error occurred while submitting the form. Please try again.', 'error');
        console.error('Submission error:', error);
    } finally {
        // Reset button state
        submitButton.classList.remove('loading');
        submitButton.disabled = false;
    }
}

function saveAsDraft() {
    // In a real implementation, you would save to localStorage or send to server
    showAlert('Your information has been saved as a draft.', 'info');
}

function handleServerErrors(errorResponse) {
    // Clear existing error highlights
    document.querySelectorAll('.error-highlight').forEach(el => {
        el.classList.remove('error-highlight');
    });

    document.querySelectorAll('.error-message').forEach(el => {
        el.textContent = '';
    });

    // Display new errors from server
    if (errorResponse.errors) {
        for (const [field, message] of Object.entries(errorResponse.errors)) {
            const inputElement = document.getElementById(field);
            if (inputElement) {
                inputElement.classList.add('error-highlight');
                const errorElement = inputElement.nextElementSibling?.classList.contains('error-message')
                    ? inputElement.nextElementSibling
                    : document.getElementById(`${field}Error`);

                if (errorElement) {
                    errorElement.textContent = message;
                }
            }
        }
    } else if (errorResponse.message) {
        showAlert(errorResponse.message, 'error');
    }
}

function showSuccessMessage(result) {
    const existingMessage = document.querySelector('.success-message');
    if (existingMessage) existingMessage.remove();

    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        <div>
            <h3>Registration Successful!</h3>
            <p>Voter ID: ${result.id || 'N/A'}</p>
            <p>Thank you for registering. A confirmation email has been sent to ${result.email}.</p>
        </div>
    `;

    const form = document.getElementById('voterForm');
    form.parentNode.insertBefore(successMessage, form);
    successMessage.scrollIntoView({ behavior: 'smooth' });
}

function validateAllFields(form) {
    let isValid = true;

    // Validate birth date separately
    validateBirthDate();

    // Validate all required fields
    form.querySelectorAll('input[required], select[required]').forEach(element => {
        validateField(element);
        if (!element.checkValidity()) {
            isValid = false;
        }
    });

    return isValid;
}

function showAlert(message, type = 'error') {
    // In a production app, you would use a proper notification system
    alert(`${type.toUpperCase()}: ${message}`);
}

function setupVoteOfficeDropdown() {
    const officeSelect = document.getElementById('office');
    
    // Clear existing options
    officeSelect.innerHTML = '';
    
    // Add default option
    const defaultOption = new Option('Select your voting office', '', true, true);
    defaultOption.disabled = true;
    officeSelect.add(defaultOption);
    
    // Add office options (in a real app, this would come from an API)
    Object.values(voteOffices).forEach(office => {
        const option = new Option(`${office.name} - ${office.location}`, office.id);
        officeSelect.add(option);
    });
}



