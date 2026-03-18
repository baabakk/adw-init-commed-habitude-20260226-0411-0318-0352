// Auth page JavaScript

const API_BASE = '/api';

// DOM Elements
const signupForm = document.getElementById('signup-form');
const loginForm = document.getElementById('login-form');
const verificationForm = document.getElementById('verification-form');
const messagingChannelSelect = document.getElementById('messaging-channel');
const channelIdentifierInput = document.getElementById('channel-identifier');
const identifierGroup = document.getElementById('identifier-group');
const identifierLabel = document.getElementById('identifier-label');
const identifierHint = document.getElementById('identifier-hint');
const timezoneSelect = document.getElementById('timezone');
const signupBtn = document.getElementById('signup-btn');
const loginBtn = document.getElementById('login-btn');
const verifyBtn = document.getElementById('verify-btn');
const loginIdentifierInput = document.getElementById('login-identifier');
const verificationCodeInput = document.getElementById('verification-code');
const errorMessage = document.getElementById('error-message');
const successMessage = document.getElementById('success-message');
const showLoginLink = document.getElementById('show-login');
const showSignupLink = document.getElementById('show-signup');
const backToSignupLink = document.getElementById('back-to-signup');

// State
let currentChannelIdentifier = '';
let isSignupMode = true;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Check if already logged in
    const token = localStorage.getItem('auth_token');
    if (token) {
        validateSession(token);
    }

    setupEventListeners();
});

function setupEventListeners() {
    messagingChannelSelect.addEventListener('change', handleChannelChange);
    channelIdentifierInput.addEventListener('input', validateSignupForm);
    timezoneSelect.addEventListener('change', validateSignupForm);
    signupBtn.addEventListener('click', handleSignup);
    loginBtn.addEventListener('click', handleLogin);
    verifyBtn.addEventListener('click', handleVerify);
    showLoginLink.addEventListener('click', showLogin);
    showSignupLink.addEventListener('click', showSignup);
    backToSignupLink.addEventListener('click', showSignup);
    verificationCodeInput.addEventListener('input', handleCodeInput);
}

function handleChannelChange() {
    const channel = messagingChannelSelect.value;
    
    if (channel) {
        identifierGroup.style.display = 'block';
        
        if (channel === 'telegram') {
            identifierLabel.textContent = 'Telegram Chat ID';
            identifierHint.textContent = 'Get your Chat ID from @userinfobot on Telegram';
            channelIdentifierInput.placeholder = '123456789';
        } else {
            identifierLabel.textContent = 'Phone Number';
            identifierHint.textContent = 'Enter your phone number with country code';
            channelIdentifierInput.placeholder = '+1234567890';
        }
    } else {
        identifierGroup.style.display = 'none';
    }
    
    validateSignupForm();
}

function validateSignupForm() {
    const channel = messagingChannelSelect.value;
    const identifier = channelIdentifierInput.value.trim();
    const timezone = timezoneSelect.value;
    
    signupBtn.disabled = !channel || !identifier || !timezone;
}

async function handleSignup() {
    const channel = messagingChannelSelect.value;
    const identifier = channelIdentifierInput.value.trim();
    const timezone = timezoneSelect.value;
    
    hideMessages();
    signupBtn.disabled = true;
    signupBtn.textContent = 'Sending...';
    
    try {
        const response = await fetch(`${API_BASE}/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messaging_channel: channel,
                channel_identifier: identifier,
                timezone: timezone,
            }),
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentChannelIdentifier = identifier;
            showSuccess('Verification code sent! Check your ' + channel);
            setTimeout(() => {
                showVerification();
            }, 1500);
        } else {
            showError(data.error || 'Failed to send verification code');
        }
    } catch (error) {
        console.error('Signup error:', error);
        showError('Network error. Please check your connection.');
    } finally {
        signupBtn.disabled = false;
        signupBtn.textContent = 'Send Verification Code';
    }
}

async function handleLogin() {
    const identifier = loginIdentifierInput.value.trim();
    
    if (!identifier) {
        showError('Please enter your channel identifier');
        return;
    }
    
    hideMessages();
    loginBtn.disabled = true;
    loginBtn.textContent = 'Sending...';
    
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                channel_identifier: identifier,
            }),
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentChannelIdentifier = identifier;
            showSuccess('Verification code sent!');
            setTimeout(() => {
                showVerification();
            }, 1500);
        } else {
            showError(data.error || 'Failed to send verification code');
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('Network error. Please check your connection.');
    } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = 'Send Verification Code';
    }
}

async function handleVerify() {
    const code = verificationCodeInput.value.trim();
    
    if (code.length !== 6) {
        showError('Please enter a 6-digit code');
        return;
    }
    
    hideMessages();
    verifyBtn.disabled = true;
    verifyBtn.textContent = 'Verifying...';
    
    try {
        const response = await fetch(`${API_BASE}/auth/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                channel_identifier: currentChannelIdentifier,
                code: code,
            }),
        });
        
        const data = await response.json();
        
        if (data.success) {
            localStorage.setItem('auth_token', data.token);
            localStorage.setItem('user_id', data.userId);
            showSuccess('Verification successful! Redirecting...');
            setTimeout(() => {
                window.location.href = '/';
            }, 1000);
        } else {
            showError(data.error || 'Verification failed');
        }
    } catch (error) {
        console.error('Verification error:', error);
        showError('Network error. Please check your connection.');
    } finally {
        verifyBtn.disabled = false;
        verifyBtn.textContent = 'Verify';
    }
}

function handleCodeInput(e) {
    // Only allow numbers
    e.target.value = e.target.value.replace(/\D/g, '');
}

async function validateSession(token) {
    try {
        const response = await fetch(`${API_BASE}/auth/session`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        
        const data = await response.json();
        
        if (data.success) {
            window.location.href = '/';
        } else {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_id');
        }
    } catch (error) {
        console.error('Session validation error:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_id');
    }
}

function showLogin(e) {
    e.preventDefault();
    signupForm.style.display = 'none';
    loginForm.style.display = 'block';
    verificationForm.style.display = 'none';
    hideMessages();
    isSignupMode = false;
}

function showSignup(e) {
    e.preventDefault();
    signupForm.style.display = 'block';
    loginForm.style.display = 'none';
    verificationForm.style.display = 'none';
    hideMessages();
    isSignupMode = true;
}

function showVerification() {
    signupForm.style.display = 'none';
    loginForm.style.display = 'none';
    verificationForm.style.display = 'block';
    hideMessages();
    verificationCodeInput.value = '';
    verificationCodeInput.focus();
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    successMessage.style.display = 'none';
}

function showSuccess(message) {
    successMessage.textContent = message;
    successMessage.style.display = 'block';
    errorMessage.style.display = 'none';
}

function hideMessages() {
    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';
}
