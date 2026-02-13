document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const loginForm = document.getElementById('loginForm');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    const submitButton = loginForm.querySelector('button[type="submit"]');
    const rememberCheckbox = document.getElementById('remember');
    const twoFactorSection = document.getElementById('twoFactorAuth');
    const verify2FABtn = document.getElementById('verify2FA');
    const resend2FABtn = document.getElementById('resend2FA');
    const strengthBars = document.querySelectorAll('.strength-bar');
    const strengthText = document.getElementById('password-strength-text');

    // Check for remembered credentials
    checkRememberedCredentials();

    // Password strength meter
    passwordInput.addEventListener('input', function() {
        const strength = calculatePasswordStrength(this.value);
        updateStrengthMeter(strength);
    });

    // Toggle password visibility
    togglePassword.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.classList.toggle('fa-eye-slash');
        this.classList.toggle('fa-eye');
    });

    // Form submission
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validate CAPTCHA
        const captchaResponse = grecaptcha.getResponse();
        if (!captchaResponse) {
            showError('Please complete the CAPTCHA');
            return;
        }

        // Get form values
        const email = document.getElementById('email').value.trim();
        const password = passwordInput.value.trim();
        const rememberMe = rememberCheckbox.checked;

        // Validation
        if (!validateForm(email, password)) {
            return;
        }

        // Show loading state
        setLoadingState(true, submitButton);

        try {
            // Send login request
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                    rememberMe: rememberMe,
                    captcha: captchaResponse
                })
            });

            const data = await response.json();

            if (response.ok) {
                if (data.requires2FA) {
                    // Show 2FA section
                    show2FASection(data.tempToken);
                } else {
                    // Regular login success
                    handleLoginSuccess(data);
                }
            } else {
                handleLoginError(data.error || 'Login failed');
            }
        } catch (error) {
            handleLoginError('Network error. Please try again.');
        } finally {
            setLoadingState(false, submitButton);
            grecaptcha.reset();
        }
    });

    // 2FA Verification
    verify2FABtn.addEventListener('click', async function() {
        const code = document.getElementById('2faCode').value.trim();
        if (!code || code.length !== 6) {
            showError('Please enter a valid 6-digit code');
            return;
        }

        setLoadingState(true, verify2FABtn);
        
        try {
            const response = await fetch('/verify-2fa', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: this.dataset.tempToken,
                    code: code
                })
            });

            const data = await response.json();
            
            if (response.ok) {
                handleLoginSuccess(data);
            } else {
                handleLoginError(data.error || 'Invalid verification code');
            }
        } catch (error) {
            handleLoginError('Verification failed. Please try again.');
        } finally {
            setLoadingState(false, verify2FABtn);
        }
    });

    // Resend 2FA Code
    resend2FABtn.addEventListener('click', async function() {
        setLoadingState(true, resend2FABtn);
        
        try {
            const response = await fetch('/resend-2fa', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: this.dataset.tempToken
                })
            });

            const data = await response.json();
            
            if (response.ok) {
                showMessage('New verification code sent!');
            } else {
                handleLoginError(data.error || 'Failed to resend code');
            }
        } catch (error) {
            handleLoginError('Failed to resend code. Please try again.');
        } finally {
            setLoadingState(false, resend2FABtn);
        }
    });

    // Helper Functions
    function checkRememberedCredentials() {
        const rememberedEmail = getCookie('remembered_email');
        if (rememberedEmail) {
            document.getElementById('email').value = rememberedEmail;
            rememberCheckbox.checked = true;
        }
    }

    function calculatePasswordStrength(password) {
        let strength = 0;
        
        // Length check
        if (password.length > 0) strength += 1;
        if (password.length >= 8) strength += 1;
        
        // Complexity checks
        if (/[A-Z]/.test(password)) strength += 1;
        if (/\d/.test(password)) strength += 1;
        if (/[^A-Za-z0-9]/.test(password)) strength += 1;
        
        return Math.min(strength, 4); // Cap at 4 for our 4-bar meter
    }

    function updateStrengthMeter(strength) {
        strengthBars.forEach((bar, index) => {
            bar.style.backgroundColor = index < strength ? getStrengthColor(strength) : '#ddd';
        });
        
        const strengthMessages = [
            'Very Weak',
            'Weak',
            'Moderate',
            'Strong',
            'Very Strong'
        ];
        strengthText.textContent = strengthMessages[strength];
        strengthText.style.color = getStrengthColor(strength);
    }

    function getStrengthColor(strength) {
        const colors = [
            '#ff3b30', // Red
            '#ff9500', // Orange
            '#ffcc00', // Yellow
            '#34c759', // Green
            '#28cd41'  // Dark Green
        ];
        return colors[strength];
    }

    function validateForm(email, password) {
        // Clear previous errors
        clearErrors();

        if (!email) {
            showError('Please enter your email');
            return false;
        }

        if (!isValidEmail(email)) {
            showError('Please enter a valid email address');
            return false;
        }

        if (!password) {
            showError('Please enter your password');
            return false;
        }

        if (password.length < 8) {
            showError('Password must be at least 8 characters');
            return false;
        }

        return true;
    }

    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function setLoadingState(isLoading, button) {
        if (isLoading) {
            button.disabled = true;
            const originalText = button.innerHTML;
            button.dataset.originalText = originalText;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + button.textContent.trim();
        } else {
            button.disabled = false;
            if (button.dataset.originalText) {
                button.innerHTML = button.dataset.originalText;
            }
        }
    }

    function show2FASection(tempToken) {
        loginForm.querySelector('.g-recaptcha').style.display = 'none';
        loginForm.querySelector('.form-options').style.display = 'none';
        loginForm.querySelector('.social-login').style.display = 'none';
        loginForm.querySelector('.signup-link').style.display = 'none';
        submitButton.style.display = 'none';
        
        verify2FABtn.dataset.tempToken = tempToken;
        resend2FABtn.dataset.tempToken = tempToken;
        twoFactorSection.style.display = 'block';
        document.getElementById('2faCode').focus();
    }

    function handleLoginSuccess(data) {
        if (rememberCheckbox.checked) {
            setCookie('remembered_email', data.email, 30); // Remember for 30 days
        } else {
            deleteCookie('remembered_email');
        }
        
        // Redirect to dashboard or intended URL
        window.location.href = data.redirectUrl || '/dashboard';
    }

    function handleLoginError(message) {
        showError(message);
        passwordInput.value = '';
        passwordInput.focus();
    }

    function showError(message) {
        clearErrors();
        
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        errorElement.style.color = '#ff3333';
        errorElement.style.margin = '10px 0';
        errorElement.style.textAlign = 'center';
        
        loginForm.insertBefore(errorElement, loginForm.firstChild);
    }

    function showMessage(message) {
        clearErrors();
        
        const msgElement = document.createElement('div');
        msgElement.className = 'success-message';
        msgElement.textContent = message;
        msgElement.style.color = '#28cd41';
        msgElement.style.margin = '10px 0';
        msgElement.style.textAlign = 'center';
        
        loginForm.insertBefore(msgElement, loginForm.firstChild);
    }

    function clearErrors() {
        const errorMessages = document.querySelectorAll('.error-message, .success-message');
        errorMessages.forEach(msg => msg.remove());
    }

    function setCookie(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = "expires=" + date.toUTCString();
        document.cookie = name + "=" + value + ";" + expires + ";path=/;Secure;SameSite=Strict";
    }

    function getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    function deleteCookie(name) {
        document.cookie = name + '=; Max-Age=-99999999; path=/;';
    }
});