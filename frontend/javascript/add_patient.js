/**
 * Add Patient JavaScript
 * Handles patient registration form validation and submission
 */

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('addPatientForm');
    const messageArea = document.getElementById('messageArea');
    const submitBtn = document.getElementById('submitBtn');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Basic Information
        const phone = document.getElementById('phone').value.trim();
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const nationalId = document.getElementById('nationalId').value.trim();

        // Medical History
        const symptoms = document.getElementById('symptoms').value.trim();
        const procedureHistory = document.getElementById('procedureHistory').value.trim();

        // Physical Measurements
        const weight = document.getElementById('weight').value;
        const height = document.getElementById('height').value;
        const age = document.getElementById('age').value;

        // CPET
        const cpetCompleted = document.getElementById('cpetCompleted').checked;

        // Validate Thai National ID (exactly 13 digits)
        if (!/^\d{13}$/.test(nationalId)) {
            showMessage('National ID must be exactly 13 digits', 'error');
            return;
        }

        // Validate required medical history fields
        if (!symptoms) {
            showMessage('กรุณากรอกอาการของผู้ป่วย', 'error');
            return;
        }

        if (!procedureHistory) {
            showMessage('กรุณากรอกหัตถการที่ได้รับมา', 'error');
            return;
        }

        // Validate required physical measurements
        if (!weight) {
            showMessage('กรุณากรอกน้ำหนัก', 'error');
            return;
        }

        if (!height) {
            showMessage('กรุณากรอกส่วนสูง', 'error');
            return;
        }

        if (!age) {
            showMessage('กรุณากรอกอายุ', 'error');
            return;
        }

        // Show loading state
        submitBtn.disabled = true;
        submitBtn.textContent = 'Registering...';
        showMessage('Adding patient to database...', 'info');

        try {
            const response = await fetch('/api/add_patient', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    phone: phone,
                    first_name: firstName,
                    last_name: lastName,
                    national_id: nationalId,
                    symptoms: symptoms,
                    procedure_history: procedureHistory,
                    weight: weight ? parseInt(weight) : null,
                    height: height ? parseInt(height) : null,
                    age: age ? parseInt(age) : null,
                    cpet_completed: cpetCompleted
                })
            });

            const data = await response.json();

            if (data.success) {
                showMessage('Patient registered successfully! Redirecting to search...', 'success');

                // Clear form
                form.reset();

                // Redirect to search page after 1.5 seconds
                setTimeout(() => {
                    window.location.href = 'patient_search.html';
                }, 1500);
            } else {
                showMessage(data.message || 'Failed to register patient', 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Register Patient';
            }
        } catch (error) {
            console.error('Add patient error:', error);
            showMessage('An error occurred. Please try again.', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Register Patient';
        }
    });

    /**
     * Display message to user
     * @param {string} message - Message text
     * @param {string} type - Message type: 'success', 'error', 'info'
     */
    function showMessage(message, type) {
        let color = '#333';
        let bgColor = '#f0f0f0';

        switch (type) {
            case 'success':
                color = '#155724';
                bgColor = '#d4edda';
                break;
            case 'error':
                color = '#721c24';
                bgColor = '#f8d7da';
                break;
            case 'info':
                color = '#004085';
                bgColor = '#d1ecf1';
                break;
        }

        messageArea.innerHTML = `
            <div style="
                padding: 0.75rem;
                border-radius: 8px;
                background-color: ${bgColor};
                color: ${color};
                text-align: center;
                font-size: 1rem;
            ">
                ${message}
            </div>
        `;
    }
});
