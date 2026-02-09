// Record Exercise Session Script
let patientId = null;

window.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    patientId = urlParams.get('patient_id');

    if (!patientId) {
        alert('No patient selected');
        window.location.href = 'patient_search.html';
        return;
    }

    // Set today's date as default
    document.getElementById('sessionDate').valueAsDate = new Date();

    // Load data
    await Promise.all([
        loadPatientInfo(),
        loadNextSessionNumber(),
        loadStaffList()
    ]);

    // Setup image preview
    document.getElementById('ekgImage').addEventListener('change', previewImage);
});

async function loadPatientInfo() {
    try {
        const response = await fetch(`/api/get_patient?patient_id=${patientId}`);
        const data = await response.json();

        if (data.success) {
            document.getElementById('patientInfo').textContent =
                `Patient: ${data.patient.first_name} ${data.patient.last_name} (${data.patient.phone})`;
            document.getElementById('headerTitle').textContent =
                `Record Exercise - ${data.patient.first_name} ${data.patient.last_name}`;
        }
    } catch (error) {
        console.error('Error loading patient:', error);
    }
}

async function loadNextSessionNumber() {
    try {
        const response = await fetch(`/api/get_next_session_number?patient_id=${patientId}`);
        const data = await response.json();

        if (data.success) {
            document.getElementById('sessionNumber').value = data.next_session_number;
        }
    } catch (error) {
        console.error('Error loading session number:', error);
        document.getElementById('sessionNumber').value = 1;
    }
}

async function loadStaffList() {
    try {
        const response = await fetch('/api/get_staff_list');
        const data = await response.json();

        if (data.success) {
            const doctorSelect = document.getElementById('doctorId');
            const therapistSelect = document.getElementById('therapistId');

            data.doctors.forEach(doctor => {
                const option = document.createElement('option');
                option.value = doctor.user_id;
                option.textContent = `${doctor.first_name} ${doctor.last_name}`;
                doctorSelect.appendChild(option);
            });

            data.therapists.forEach(therapist => {
                const option = document.createElement('option');
                option.value = therapist.user_id;
                option.textContent = `${therapist.first_name} ${therapist.last_name}`;
                therapistSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading staff:', error);
    }
}

function previewImage(event) {
    const file = event.target.files[0];

    if (!file) return;

    // Validate file type
    if (!file.type.match('image/(png|jpeg)')) {
        alert('Please upload PNG or JPEG image only');
        event.target.value = '';
        return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        event.target.value = '';
        return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById('previewImg').src = e.target.result;
        document.getElementById('imagePreview').style.display = 'block';
    };
    reader.readAsDataURL(file);
}

document.getElementById('exerciseForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'กำลังบันทึก...';

    const formData = new FormData();
    formData.append('patient_id', patientId);
    formData.append('session_date', document.getElementById('sessionDate').value);
    formData.append('heart_rate', document.getElementById('heartRate').value);
    formData.append('bp_systolic', document.getElementById('bpSystolic').value);
    formData.append('bp_diastolic', document.getElementById('bpDiastolic').value);
    formData.append('mets', document.getElementById('mets').value);
    formData.append('exercise_method', document.getElementById('exerciseMethod').value);
    formData.append('recommendations', document.getElementById('recommendations').value);
    formData.append('doctor_id', document.getElementById('doctorId').value);
    formData.append('therapist_id', document.getElementById('therapistId').value);
    formData.append('ekg_image', document.getElementById('ekgImage').files[0]);

    try {
        const response = await fetch('/api/save_exercise_session', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            alert('บันทึกข้อมูลสำเร็จ!');
            window.location.href = `exercise_history.html?patient_id=${patientId}`;
        } else {
            alert('Error: ' + data.message);
            submitBtn.disabled = false;
            submitBtn.textContent = 'บันทึกข้อมูล';
        }
    } catch (error) {
        console.error('Error:', error);
        alert('เกิดข้อผิดพลาด กรุณาลองใหม่');
        submitBtn.disabled = false;
        submitBtn.textContent = 'บันทึกข้อมูล';
    }
});

function goBack() {
    window.location.href = `patient_dashboard.html?patient_id=${patientId}`;
}

function logout() {
    fetch('/api/logout').then(() => {
        window.location.href = 'login.html';
    });
}
