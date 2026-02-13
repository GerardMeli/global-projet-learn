document.addEventListener('DOMContentLoaded', function() {
            // Form elements
            const form = document.getElementById('candidateForm');
            const sections = document.querySelectorAll('.form-section');
            const progressSteps = document.querySelectorAll('.progress-step');
            const nextButtons = document.querySelectorAll('.next-section');
            const prevButtons = document.querySelectorAll('.prev-section');
            const submitButton = document.getElementById('submitButton');
            const notification = document.getElementById('notification');


            // Initialize form
            initForm();

            function initForm() {
                // Set max date for birthdate (must be at least 21 years old)
                const birthDateInput = document.getElementById('birthdate');
                const today = new Date();
                const maxDate = new Date(today.getFullYear() - 21, today.getMonth(), today.getDate());
                birthDateInput.max = maxDate.toISOString().split('T')[0];
                
                // Set up event listeners
                setupEventListeners();
                
                // Show first section
                showSection(1);
            }

            function setupEventListeners() {
                // Real-time validation
                form.addEventListener('input', function(e) {
                    if (e.target.matches('input, select')) {
                        validateField(e.target);
                    }
                });

                // Validate on blur
                form.addEventListener('focusout', function(e) {
                    if (e.target.matches('input, select')) {
                        validateField(e.target);
                    }
                });

                // Next section buttons
                nextButtons.forEach(button => {
                    button.addEventListener('click', function() {
                        const currentSection = this.closest('.form-section');
                        const currentSectionNum = parseInt(currentSection.dataset.section);
                        
                        if (validateSection(currentSection)) {
                            showSection(currentSectionNum + 1);
                        }
                    });
                });

                // Previous section buttons
                prevButtons.forEach(button => {
                    button.addEventListener('click', function() {
                        const currentSection = this.closest('.form-section');
                        const currentSectionNum = parseInt(currentSection.dataset.section);
                        showSection(currentSectionNum - 1);
                    });
                });

                // Region change updates polling stations and offices
                document.getElementById('currentregion').addEventListener('change', function() {
                    loadVoteOffices(this.value);
                });
                
                // Role change shows/hides candidate fields
                document.getElementById('role').addEventListener('change', function() {
                    const formSection = document.querySelector('.form-section[data-section="2"]');
                    if (this.value === 'CANDIDATE') {
                        formSection.classList.add('role-candidate');
                        loadElections();
                    } else {
                        formSection.classList.remove('role-candidate');
                    }
                });
                
                // Form submission
                form.addEventListener('submit', handleFormSubmit);
            }

            function validateField(field) {
                const errorElement = field.parentElement.querySelector('.error-message');
                
                // Reset styling
                field.classList.remove('invalid', 'valid');
                field.removeAttribute('aria-invalid');
                
                if (field.checkValidity()) {
                    if (field.value) {
                        field.classList.add('valid');
                    }
                    if (errorElement) errorElement.textContent = '';
                } else {
                    field.classList.add('invalid');
                    field.setAttribute('aria-invalid', 'true');
                    if (errorElement) {
                        errorElement.textContent = field.validationMessage || 'Please fill this field correctly';
                    }
                }
            }

            function validateSection(section) {
                let isValid = true;
                const inputs = section.querySelectorAll('input[required], select[required]');
                
                inputs.forEach(input => {
                    validateField(input);
                    if (!input.checkValidity()) {
                        isValid = false;
                        // Scroll to first invalid field
                        if (isValid === false) {
                            input.focus();
                        }
                    }
                });
                
                // Special validation for candidate fields
                const role = document.getElementById('role').value;
                if (role === 'CANDIDATE') {
                    // Validate deposit
                    const depositInput = document.getElementById('deposit');
                    if (!depositInput.value) {
                        depositInput.classList.add('invalid');
                        depositInput.setAttribute('aria-invalid', 'true');
                        const errorElement = depositInput.parentElement.querySelector('.error-message');
                        if (errorElement) {
                            errorElement.textContent = 'Deposit amount is required for candidates';
                            errorElement.style.display = 'block';
                        }
                        isValid = false;
                    }
                    
                    // Validate elections
                    const checkedElections = document.querySelectorAll('input[name="register"]:checked').length;
                    const electionsError = document.getElementById('electionsError');
                    
                    if (checkedElections === 0) {
                        electionsError.style.display = 'block';
                        isValid = false;
                    } else {
                        electionsError.style.display = 'none';
                    }
                }
                
                if (!isValid) {
                    showNotification('Please fill out all required fields correctly', 'error');
                }
                
                return isValid;
            }

            function showSection(sectionNum) {
                // Hide all sections
                sections.forEach(section => {
                    section.classList.remove('active');
                });
                
                // Show selected section
                const sectionToShow = document.querySelector(`.form-section[data-section="${sectionNum}"]`);
                if (sectionToShow) {
                    sectionToShow.classList.add('active');
                    
                    // Update progress indicator
                    progressSteps.forEach((step, index) => {
                        if (index < sectionNum) {
                            step.classList.add('active');
                        } else {
                            step.classList.remove('active');
                        }
                    });
                    
                    // Focus first input in section
                    const firstInput = sectionToShow.querySelector('input, select');
                    if (firstInput) firstInput.focus();
                }
            }

            async function loadVoteOffices(region) {
                const select = document.getElementById('office');
                select.innerHTML = '<option value="" disabled selected>Loading offices...</option>';
                
                try {
                    // In a real application, this would fetch from your backend
                    // For demo purposes, we'll simulate with static data
                    const offices = await simulateFetchOffices(region);
                    
                    select.innerHTML = '';
                    const defaultOption = document.createElement('option');
                    defaultOption.value = '';
                    defaultOption.textContent = 'Select your vote office';
                    defaultOption.disabled = true;
                    defaultOption.selected = true;
                    select.appendChild(defaultOption);
                    
                    offices.forEach(office => {
                        const option = document.createElement('option');
                        option.value = office.id;
                        option.textContent = `${office.name} (${office.location})`;
                        select.appendChild(option);
                    });
                } catch (error) {
                    console.error('Failed to load offices:', error);
                    select.innerHTML = '<option value="" disabled selected>Failed to load offices</option>';
                }
            }

            async function loadElections() {
                const container = document.querySelector('.elections-checkboxes');
                container.innerHTML = '<p>Loading elections...</p>';
                
                try {
                    // In a real application, this would fetch from your backend
                    // For demo purposes, we'll simulate with static data
                    const elections = await simulateFetchElections();
                    
                    container.innerHTML = '';
                    elections.forEach(election => {
                        const div = document.createElement('div');
                        div.className = 'checkbox-group';
                        
                        const input = document.createElement('input');
                        input.type = 'checkbox';
                        input.id = `election-${election.id}`;
                        input.name = 'register';
                        input.value = election.id;
                        
                        const label = document.createElement('label');
                        label.htmlFor = `election-${election.id}`;
                        label.textContent = `${election.name} (${new Date(election.date).toLocaleDateString()})`;
                        
                        div.appendChild(input);
                        div.appendChild(label);
                        container.appendChild(div);
                    });
                } catch (error) {
                    console.error('Failed to load elections:', error);
                    container.innerHTML = '<p class="error">Failed to load elections. Please try again later.</p>';
                }
            }

            function simulateFetchElections() {
                // Simulate API call delay
                return new Promise((resolve) => {
                    setTimeout(() => {
                        // Static demo data - in a real app, this would come from your backend
                        resolve([
                            { 
                                id: 1, 
                                name: "Presidential Election 2025", 
                                date: "2025-10-07" 
                            },
                            { 
                                id: 2, 
                                name: "Legislative Elections 2025", 
                                date: "2025-10-07" 
                            },
                            { 
                                id: 3, 
                                name: "Municipal Elections 2025", 
                                date: "2025-10-07" 
                            }
                        ]);
                    }, 500);
                });
            }

            async function handleFormSubmit(e) {
                e.preventDefault();
                
                // Validate all sections
                let isValid = true;
                sections.forEach(section => {
                    if (!validateSection(section)) {
                        isValid = false;
                    }
                });
                
                if (!isValid) {
                    showNotification('Please correct the errors in the form', 'error');
                    return;
                }
                
                try {
                    // Show loading state
                    submitButton.classList.add('loading');
                    submitButton.disabled = true;
                    
                    // Prepare form data
                    const formData = new FormData(form);
                    const data = Object.fromEntries(formData.entries());
                    
                    // Handle candidate-specific data
                    if (data.role === 'CANDIDATE') {
                        const electionCheckboxes = document.querySelectorAll('input[name="register"]:checked');
                        data.register = Array.from(electionCheckboxes).map(cb => cb.value);
                        
                        // Convert deposit to float
                        if (data.deposit) {
                            data.deposit = parseFloat(data.deposit);
                        }
                    } else {
                        // Remove candidate-specific fields if not a candidate
                        delete data.deposit;
                        delete data.register;
                    }
                    
                    // Get CSRF token
                    const csrfToken = document.querySelector('input[name="_csrf"]').value;
                    
                    // Send data to server
                    const response = await fetch(form.action, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': csrfToken
                        },
                        body: JSON.stringify(data)
                    });
                    
                    const result = await response.json();
                    
                    if (response.ok) {
                        // Success
                        showNotification('Registration successful!', 'success');
                        form.reset();
                        showSection(1); // Return to first section
                        
                        // Reset candidate fields visibility
                        document.querySelector('.form-section[data-section="2"]').classList.remove('role-candidate');
                    } else {
                        // Server-side validation errors
                        handleServerErrors(result);
                    }
                } catch (error) {
                    console.error('Submission error:', error);
                    showNotification('An error occurred. Please try again.', 'error');
                } finally {
                    // Reset loading state
                    submitButton.classList.remove('loading');
                    submitButton.disabled = false;
                }
            }

            function handleServerErrors(errorResponse) {
                // Clear all errors first
                document.querySelectorAll('.error-message').forEach(el => {
                    el.textContent = '';
                });
                
                document.querySelectorAll('[aria-invalid="true"]').forEach(el => {
                    el.removeAttribute('aria-invalid');
                });
                
                if (errorResponse.errors) {
                    // Handle field-specific errors
                    for (const [field, message] of Object.entries(errorResponse.errors)) {
                        const inputElement = document.getElementById(field);
                        if (inputElement) {
                            inputElement.classList.add('invalid');
                            inputElement.setAttribute('aria-invalid', 'true');
                            const errorElement = inputElement.parentElement.querySelector('.error-message');
                            if (errorElement) {
                                errorElement.textContent = message;
                            }
                        } else if (field === 'register') {
                            // Handle elections error
                            const electionsError = document.getElementById('electionsError');
                            electionsError.textContent = message;
                            electionsError.style.display = 'block';
                        }
                    }
                    
                    // Scroll to first error
                    const firstError = document.querySelector('.invalid');
                    if (firstError) {
                        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                } else if (errorResponse.message) {
                    // Handle general error message
                    showNotification(errorResponse.message, 'error');
                }
            }

            function showNotification(message, type) {
                notification.textContent = message;
                notification.className = 'notification show ' + type;
                
                // Hide after 5 seconds
                setTimeout(() => {
                    notification.classList.remove('show');
                }, 5000);
            }
        });