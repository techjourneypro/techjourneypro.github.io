// Function to submit form data to Google Forms
async function submitToGoogleForm(formData, formUrl) {
    try {
        const response = await fetch(formUrl, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        return true;
    } catch (error) {
        console.error('Error submitting form:', error);
        return false;
    }
}

// Function to handle user registration
async function handleRegistration(event) {
    event.preventDefault();
    
    const formData = new FormData();
    formData.append('entry.1234567890', document.getElementById('username').value);
    formData.append('entry.0987654321', document.getElementById('email').value);
    formData.append('entry.1122334455', document.getElementById('password').value);
    
    const success = await submitToGoogleForm(formData, 'YOUR_GOOGLE_FORM_URL');
    
    if (success) {
        alert('Registration successful!');
        window.location.href = 'index.html';
    } else {
        alert('Registration failed. Please try again.');
    }
}

// Function to handle course enrollment
async function handleEnrollment(event) {
    event.preventDefault();
    
    const formData = new FormData();
    formData.append('entry.1234567890', localStorage.getItem('userId'));
    formData.append('entry.0987654321', event.target.dataset.courseId);
    formData.append('entry.1122334455', new Date().toISOString());
    
    const success = await submitToGoogleForm(formData, 'YOUR_ENROLLMENT_FORM_URL');
    
    if (success) {
        alert('Enrollment successful!');
        loadEnrolledCourses();
    } else {
        alert('Enrollment failed. Please try again.');
    }
}

// Add event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const registrationForm = document.getElementById('registrationForm');
    if (registrationForm) {
        registrationForm.addEventListener('submit', handleRegistration);
    }
    
    // Add enrollment handlers to course cards
    document.querySelectorAll('.enroll-btn').forEach(btn => {
        btn.addEventListener('click', handleEnrollment);
    });
});