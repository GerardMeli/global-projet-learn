        // Polling stations data for each region
        const pollingStations = {
            "Adamawa": [
                { id: "ADA001", name: "Ngaoundéré Main Station" },
                { id: "ADA002", name: "Tibati Central" },
                { id: "ADA003", name: "Mayo-Baléo Station" },
                { id: "ADA004", name: "Mbé Station" },
                { id: "ADA005", name: "Djohong Station" }
            ],
            "Centre": [
                { id: "CEN001", name: "Yaoundé Central" },
                { id: "CEN002", name: "Mfou Station" },
                { id: "CEN003", name: "Obala Station" },
                { id: "CEN004", name: "Mbalmayo Station" },
                { id: "CEN005", name: "Nkoteng Station" }
            ],
            "East": [
                { id: "EST001", name: "Bertoua Main Station" },
                { id: "EST002", name: "Batouri Station" },
                { id: "EST003", name: "Abong-Mbang Station" },
                { id: "EST004", name: "Yokadouma Station" },
                { id: "EST005", name: "Dimako Station" }
            ],
            "Far North": [
                { id: "FNO001", name: "Maroua Central" },
                { id: "FNO002", name: "Kousséri Station" },
                { id: "FNO003", name: "Mora Station" },
                { id: "FNO004", name: "Kaélé Station" },
                { id: "FNO005", name: "Mokolo Station" }
            ],
            "Littoral": [
                { id: "LIT001", name: "Douala Central" },
                { id: "LIT002", name: "Bonabéri Station" },
                { id: "LIT003", name: "Nkongsamba Station" },
                { id: "LIT004", name: "Edéa Station" },
                { id: "LIT005", name: "Manoka Station" }
            ],
            "North": [
                { id: "NOR001", name: "Garoua Main Station" },
                { id: "NOR002", name: "Pitoa Station" },
                { id: "NOR003", name: "Lagdo Station" },
                { id: "NOR004", name: "Rey Bouba Station" },
                { id: "NOR005", name: "Tcholliré Station" }
            ],
            "Northwest": [
                { id: "NW001", name: "Bamenda Central" },
                { id: "NW002", name: "Bafut Station" },
                { id: "NW003", name: "Mbengwi Station" },
                { id: "NW004", name: "Wum Station" },
                { id: "NW005", name: "Nkambe Station" }
            ],
            "South": [
                { id: "SUD001", name: "Ebolowa Main Station" },
                { id: "SUD002", name: "Kribi Station" },
                { id: "SUD003", name: "Sangmélima Station" },
                { id: "SUD004", name: "Mvangan Station" },
                { id: "SUD005", name: "Ambam Station" }
            ],
            "Southwest": [
                { id: "SW001", name: "Buea Central" },
                { id: "SW002", name: "Limbe Station" },
                { id: "SW003", name: "Tiko Station" },
                { id: "SW004", name: "Muyuka Station" },
                { id: "SW005", name: "Mamfe Station" }
            ],
            "West": [
                { id: "WES001", name: "Bafoussam Main Station" },
                { id: "WES002", name: "Dschang Station" },
                { id: "WES003", name: "Foumban Station" },
                { id: "WES004", name: "Mbouda Station" },
                { id: "WES005", name: "Bangangté Station" }
            ]
        };

        document.addEventListener('DOMContentLoaded', function() {
            // Initialize form functionality
            initForm();
        });

        function initForm() {
            // Set max date for birth date (today)
            document.getElementById('birthDate').max = new Date().toISOString().split('T')[0];
            
            // Setup event listeners
            setupEventListeners();
            
            // Initialize polling stations
            updatePollingStations();
        }

        function setupEventListeners() {
            const form = document.getElementById("voterForm");
            
            // Input validation
            form.addEventListener('input', function(event) {
                if (event.target.matches('input, select')) {
                    validateField(event.target);
                }
            });
            
            // Blur validation
            form.addEventListener('focusout', function(event) {
                if (event.target.matches('input, select')) {
                    validateField(event.target);
                }
            });
            
            // Special handling for birth date
            document.getElementById('birthDate').addEventListener('change', validateBirthDate);
            
            // Region change updates polling stations
            document.getElementById('region').addEventListener('change', updatePollingStations);
            
            // Form submission
            form.addEventListener('submit', handleFormSubmit);
        }

        function validateField(element) {
            const errorElement = element.nextElementSibling?.classList.contains('error-message') 
                ? element.nextElementSibling
                : null;
                
            // Reset visual styles
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
            const birthDateInput = document.getElementById('birthDate');
            const errorElement = document.getElementById('birthDateError');
            const birthDate = new Date(birthDateInput.value);
            const today = new Date();
            
            // Reset validation
            birthDateInput.classList.remove('error-highlight', 'success-highlight');
            birthDateInput.setCustomValidity('');
            errorElement.textContent = '';
            birthDateInput.setAttribute('aria-invalid', 'false');
            
            // Skip validation if empty
            if (!birthDateInput.value) return;
            
            // Check if date is in the future
            if (birthDate > today) {
                const errorMsg = 'Birth date cannot be in the future';
                birthDateInput.setCustomValidity(errorMsg);
                errorElement.textContent = errorMsg;
                birthDateInput.classList.add('error-highlight');
                birthDateInput.setAttribute('aria-invalid', 'true');
                return;
            }
            
            // Calculate age
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            
            // Check minimum age
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

        function updatePollingStations() {
            const regionSelect = document.getElementById('region');
            const pollingStationSelect = document.getElementById('pollingStation');
            const selectedRegion = regionSelect.value;
            
            // Clear existing options
            pollingStationSelect.innerHTML = '';
            
            // Add default option
            const defaultOption = new Option('Select your polling station', '', true, true);
            defaultOption.disabled = true;
            defaultOption.selected = true;
            pollingStationSelect.add(defaultOption);
            
            // Add polling stations for selected region
            if (selectedRegion && pollingStations[selectedRegion]) {
                pollingStations[selectedRegion].forEach(station => {
                    const option = new Option(`${station.name} (${station.id})`, station.id);
                    pollingStationSelect.add(option);
                });
            }
            
            // Validate the field after update
            validateField(pollingStationSelect);
        }

        async function handleFormSubmit(e) {
            e.preventDefault();
            const form = e.target;
            const submitButton = document.getElementById('submitButton');
            
            // Validate all fields before submission
            if (!validateAllFields(form)) {
                showAlert('Please fill out all required fields correctly.', 'error');
                return;
            }
            
            try {
                // Show loading state
                submitButton.classList.add('loading');
                submitButton.disabled = true;
                
                // Simulate API call (replace with actual fetch)
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // Handle successful submission
                showSuccessMessage();
                form.reset();
                
                // Reset all validation states
                document.querySelectorAll('input, select').forEach(el => {
                    el.classList.remove('error-highlight', 'success-highlight');
                    el.setAttribute('aria-invalid', 'false');
                    const errorElement = el.nextElementSibling?.classList.contains('error-message') 
                        ? el.nextElementSibling
                        : null;
                    if (errorElement) errorElement.textContent = '';
                });
                
            } catch (error) {
                showAlert('An error occurred while submitting the form. Please try again.', 'error');
                console.error('Submission error:', error);
            } finally {
                // Remove loading state
                submitButton.classList.remove('loading');
                submitButton.disabled = false;
            }
        }

        function validateAllFields(form) {
            let isValid = true;
            
            // Validate birth date first
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

        function showSuccessMessage() {
            // Remove any existing success messages
            const existingMessage = document.querySelector('.success-message');
            if (existingMessage) existingMessage.remove();
            
            // Create success message
            const successMessage = document.createElement('div');
            successMessage.className = 'success-message';
            successMessage.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <div>
                    <h3>Registration Successful!</h3>
                    <p>Your voter registration has been received. A confirmation email will be sent shortly.</p>
                </div>
            `;
            
            // Insert before the form
            const form = document.getElementById('voterForm');
            form.parentNode.insertBefore(successMessage, form);
        }

        function showAlert(message, type = 'error') {
            // In a real application, you might want to implement a more sophisticated alert system
            alert(message);
        }