document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('electionForm');
    const statusMessage = document.getElementById('statusMessage');

    // Set default dates (today for start, tomorrow for end)
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('electionStartDate').min = today;
    document.getElementById('electionStartDate').value = today;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('electionEndDate').min = tomorrow.toISOString().split('T')[0];
    document.getElementById('electionEndDate').value = tomorrow.toISOString().split('T')[0];

    // Update end date min when start date changes
    document.getElementById('electionStartDate').addEventListener('change', function() {
        const startDate = this.value;
        const endDateField = document.getElementById('electionEndDate');

        if (startDate) {
            const nextDay = new Date(startDate);
            nextDay.setDate(nextDay.getDate() + 1);
            endDateField.min = nextDay.toISOString().split('T')[0];

            // If current end date is before new min, update it
            if (endDateField.value < endDateField.min) {
                endDateField.value = endDateField.min;
            }
        }
    });

    // Form validation and submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        let isValid = true;

        // Clear previous status message
        statusMessage.className = 'status-message';
        statusMessage.textContent = '';

        // Validate election name
        const nameField = document.getElementById('electionName');
        const nameError = document.getElementById('nameError');
        if (!nameField.value.trim()) {
            nameError.classList.add('show');
            isValid = false;
        } else {
            nameError.classList.remove('show');
        }

        // Validate status
        const statusField = document.getElementById('electionStatus');
        const statusError = document.getElementById('statusError');
        if (!statusField.value) {
            statusError.classList.add('show');
            isValid = false;
        } else {
            statusError.classList.remove('show');
        }

        // Validate dates
        const startDateField = document.getElementById('electionStartDate');
        const endDateField = document.getElementById('electionEndDate');
        const startDateError = document.getElementById('startDateError');
        const endDateError = document.getElementById('endDateError');

        if (!startDateField.value) {
            startDateError.classList.add('show');
            isValid = false;
        } else {
            startDateError.classList.remove('show');
        }

        if (!endDateField.value) {
            endDateError.classList.add('show');
            isValid = false;
        } else {
            endDateError.classList.remove('show');
        }

        // Check if end date is after start date
        if (startDateField.value && endDateField.value) {
            if (new Date(endDateField.value) <= new Date(startDateField.value)) {
                endDateError.textContent = 'End date must be after start date';
                endDateError.classList.add('show');
                isValid = false;
            } else {
                endDateError.classList.remove('show');
            }
        }

        // If form is valid, proceed with submission
        if (isValid) {
            const formData = {
                electionName: nameField.value.trim(),
                electionDescription: document.getElementById('electionDescription').value.trim(),
                electionStartDate: startDateField.value,
                electionEndDate: endDateField.value,
                electionStatus: statusField.value.toUpperCase(),
                registeredVoterIds: [] // Assuming you will handle this in the backend
            };

            try {
                // Disable submit button during request
                const submitBtn = form.querySelector('button[type="submit"]');
                submitBtn.disabled = true;
                submitBtn.textContent = 'Saving...';

                // Send data to Spring Boot endpoint
                const response = await fetch("/election/add", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        // Include this if your API requires authentication
                        // 'Authorization': 'Bearer ' + yourAuthToken
                    },
                    body: JSON.stringify(formData)
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();

                // Show success message
                statusMessage.textContent = 'Election saved successfully!';
                statusMessage.className = 'status-message success';

                // Reset form after successful submission
                form.reset();

                // Reset default dates
                document.getElementById('electionStartDate').value = today;
                document.getElementById('electionEndDate').value = tomorrow.toISOString().split('T')[0];

                console.log('Success:', result);
            } catch (error) {
                console.error('Error:', error);
                statusMessage.textContent = `Error saving election: ${error.message}`;
                statusMessage.className = 'status-message error';
            } finally {
                // Re-enable submit button
                const submitBtn = form.querySelector('button[type="submit"]');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Save Election';
            }
        }
    });
});