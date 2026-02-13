  // Polling stations data for each region
        const pollingStations = {
            "Centre": [
                { id: "CEN001", name: "Yaoundé I – Ecole Publique Bastos" },
                { id: "CEN002", name: "Yaoundé II – Lycée Bilingue d'Essos" },
                { id: "CEN003", name: "Obala – Ecole Catholique Obala Centre" },
                { id: "CEN004", name: "Mbalmayo – Lycée Classique de Mbalmayo" },
                { id: "CEN005", name: "Akonolinga – Ecole Publique Akonolinga Nord" }
            ],
            "Littoral": [
                { id: "LIT001", name: "Douala I – Collège Saint-Michel" },
                { id: "LIT002", name: "Douala V – Lycée de Bépanda" },
                { id: "LIT003", name: "Bonabéri – Ecole Publique Bonabéri" },
                { id: "LIT004", name: "Nkongsamba – Lycée de Nkongsamba" },
                { id: "LIT005", name: "Manjo – Ecole Communale Manjo" }
            ],
            "Ouest": [
                { id: "OUE001", name: "Bafoussam I – Lycée Bilingue de Bafoussam" },
                { id: "OUE002", name: "Dschang – Ecole Publique Groupée A" },
                { id: "OUE003", name: "Mbouda – Collège Evangélique Mbouda" },
                { id: "OUE004", name: "Foumbot – Ecole Publique de Foumbot Centre" },
                { id: "OUE005", name: "Bangangté – Lycée Classique Bangangté" }
            ],
            "Nord-Ouest": [
                { id: "NW001", name: "Bamenda I – GHS Bamenda" },
                { id: "NW002", name: "Kumbo – Ecole Catholique Tobin" },
                { id: "NW003", name: "Ndop – Ecole Communale Ndop" },
                { id: "NW004", name: "Fundong – GBHS Fundong" },
                { id: "NW005", name: "Wum – Government Primary School Wum" }
            ],
            "Sud-Ouest": [
                { id: "SW001", name: "Buea – Buea Town School" },
                { id: "SW002", name: "Limbe – Government School Limbe I" },
                { id: "SW003", name: "Kumba – GHS Kumba Town" },
                { id: "SW004", name: "Tiko – Ecole Anglophone Tiko" },
                { id: "SW005", name: "Ekondo-Titi – GBHS Ekondo-Titi" }
            ],
            "Nord": [
                { id: "NOR001", name: "Garoua I – Lycée de Garoua" },
                { id: "NOR002", name: "Guider – Ecole Publique Guider Centre" },
                { id: "NOR003", name: "Pitoa – Lycée Technique de Pitoa" },
                { id: "NOR004", name: "Poli – Ecole Communale de Poli" },
                { id: "NOR005", name: "Figuil – Ecole de Figuil Est" }
            ],
            "Extrême-Nord": [
                { id: "EN001", name: "Maroua I – Ecole Publique Doualaré" },
                { id: "EN002", name: "Mokolo – Lycée Bilingue de Mokolo" },
                { id: "EN003", name: "Mora – Ecole Publique de Mora" },
                { id: "EN004", name: "Kousseri – Lycée Moderne Kousseri" },
                { id: "EN005", name: "Yagoua – GHS Yagoua" }
            ],
            "Adamaoua": [
                { id: "ADA001", name: "Ngaoundéré – Lycée Classique de Ngaoundéré" },
                { id: "ADA002", name: "Meiganga – Ecole Publique de Meiganga" },
                { id: "ADA003", name: "Tibati – Collège Adventiste Tibati" },
                { id: "ADA004", name: "Banyo – Ecole Communale de Banyo" },
                { id: "ADA005", name: "Ngaoundal – Lycée de Ngaoundal" }
            ],
            "Sud": [
                { id: "SUD001", name: "Ebolowa – Lycée Bilingue d'Ebolowa" },
                { id: "SUD002", name: "Kribi – Collège d'Enseignement Général Kribi" },
                { id: "SUD003", name: "Sangmélima – Ecole Publique Sangmélima Centre" },
                { id: "SUD004", name: "Ambam – Lycée d'Ambam" },
                { id: "SUD005", name: "Djoum – Ecole Primaire Djoum I" }
            ],
            "Est": [
                { id: "EST001", name: "Bertoua – Lycée Technique de Bertoua" },
                { id: "EST002", name: "Batouri – Ecole Publique de Batouri" },
                { id: "EST003", name: "Abong-Mbang – Ecole Communale Abong-Mbang" },
                { id: "EST004", name: "Yokadouma – GHS Yokadouma" },
                { id: "EST005", name: "Lomié – Ecole Primaire Lomié Centre" }
            ]
        };

        document.addEventListener('DOMContentLoaded', function() {
            initForm();
        });

        function initForm() {
            document.getElementById('birthDate').max = new Date().toISOString().split('T')[0];
            setupEventListeners();
            updatePollingStations();
        }

        function setupEventListeners() {
            const form = document.getElementById("voterForm");

            form.addEventListener('input', function(event) {
                if (event.target.matches('input, select')) {
                    validateField(event.target);
                }
            });

            form.addEventListener('focusout', function(event) {
                if (event.target.matches('input, select')) {
                    validateField(event.target);
                }
            });

            document.getElementById('birthDate').addEventListener('change', validateBirthDate);
            document.getElementById('region').addEventListener('change', updatePollingStations);
            form.addEventListener('submit', handleFormSubmit);
            
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
            const birthDateInput = document.getElementById('birthDate');
            const errorElement = document.getElementById('birthDateError');
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

        function updatePollingStations() {
            const regionSelect = document.getElementById('region');
            const pollingStationSelect = document.getElementById('pollingStation');
            const selectedRegion = regionSelect.value;

            pollingStationSelect.innerHTML = '';

            const defaultOption = new Option('Select your polling station', '', true, true);
            defaultOption.disabled = true;
            pollingStationSelect.add(defaultOption);

            if (selectedRegion && pollingStations[selectedRegion]) {
                pollingStations[selectedRegion].forEach(station => {
                    const option = new Option(`${station.name} (${station.id})`, station.id);
                    pollingStationSelect.add(option);
                });
            }

            validateField(pollingStationSelect);
        }

        async function handleFormSubmit(e) {
            e.preventDefault();
            const form = e.target;
            const submitButton = document.getElementById('submitButton');

            if (!validateAllFields(form)) {
                showAlert('Please fill out all required fields correctly.', 'error');
                return;
            }

            try {
                submitButton.classList.add('loading');
                submitButton.disabled = true;

                const formData = new FormData(form);
                const data = Object.fromEntries(formData.entries());

                if (data.birthDate) {
                    data.birthDate = new Date(data.birthDate).toISOString().split('T')[0];
                }

                // Get CSRF token from form
                const csrfToken = document.querySelector('input[name="_csrf"]').value;

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
                submitButton.classList.remove('loading');
                submitButton.disabled = false;
            }
        }

        function saveAsDraft() {
            // Implement draft saving functionality
            showAlert('Your information has been saved as a draft.', 'info');
        }

        function handleServerErrors(errorResponse) {
            document.querySelectorAll('.error-highlight').forEach(el => {
                el.classList.remove('error-highlight');
            });

            document.querySelectorAll('.error-message').forEach(el => {
                el.textContent = '';
            });

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

            validateBirthDate();

            form.querySelectorAll('input[required], select[required]').forEach(element => {
                validateField(element);
                if (!element.checkValidity()) {
                    isValid = false;
                }
            });

            return isValid;
        }

        function showAlert(message, type = 'error') {
            // In a real implementation, you might use a more sophisticated notification system
            alert(`${type.toUpperCase()}: ${message}`);
        }