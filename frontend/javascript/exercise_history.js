// Exercise History Script
let patientId = null;
let sessions = [];
let chart = null;
let userRole = null;

window.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    patientId = urlParams.get('patient_id');

    if (!patientId) {
        alert('No patient selected');
        window.location.href = 'patient_search.html';
        return;
    }

    // Check session and get role
    await checkSession();

    // Load data
    await Promise.all([
        loadPatientInfo(),
        loadSessions()
    ]);

    // Setup event listeners
    document.getElementById('sessionSelector').addEventListener('change', displaySessionDetails);
    ['showHeartRate', 'showBPSystolic', 'showBPDiastolic', 'showMETs'].forEach(id => {
        document.getElementById(id).addEventListener('change', updateChart);
    });
});

async function checkSession() {
    try {
        const response = await fetch('/api/check_session');
        const data = await response.json();

        if (!data.logged_in) {
            window.location.href = 'login.html';
            return;
        }

        userRole = data.role;

        // Hide back button for patients
        if (userRole === 'patient') {
            document.getElementById('backBtn').style.display = 'none';
        }
    } catch (error) {
        console.error('Session check error:', error);
        window.location.href = 'login.html';
    }
}

async function loadPatientInfo() {
    try {
        const response = await fetch(`/api/get_patient?patient_id=${patientId}`);
        const data = await response.json();

        if (data.success) {
            document.getElementById('patientInfo').textContent =
                `Patient: ${data.patient.first_name} ${data.patient.last_name} (${data.patient.phone})`;
            document.getElementById('headerTitle').textContent =
                `Exercise History - ${data.patient.first_name} ${data.patient.last_name}`;
        }
    } catch (error) {
        console.error('Error loading patient:', error);
    }
}

async function loadSessions() {
    try {
        const response = await fetch(`/api/get_exercise_sessions?patient_id=${patientId}`);
        const data = await response.json();

        if (data.success) {
            sessions = data.sessions;

            if (sessions.length === 0) {
                document.getElementById('noSessions').style.display = 'block';
                return;
            }

            // Populate selector
            const selector = document.getElementById('sessionSelector');
            selector.innerHTML = sessions.map(s =>
                `<option value="${s.session_id}">Session ${s.session_number} - ${formatDate(s.session_date)}</option>`
            ).join('');

            // Display first session
            displaySessionDetails();

            // Initialize chart
            initChart();
        }
    } catch (error) {
        console.error('Error loading sessions:', error);
    }
}

function displaySessionDetails() {
    const sessionId = document.getElementById('sessionSelector').value;
    const session = sessions.find(s => s.session_id == sessionId);

    if (!session) return;

    document.getElementById('sessionDetails').style.display = 'block';
    document.getElementById('detailDate').textContent = formatDate(session.session_date);
    document.getElementById('detailNumber').textContent = session.session_number;
    document.getElementById('detailHR').textContent = session.heart_rate;
    document.getElementById('detailBP').textContent = `${session.bp_systolic}/${session.bp_diastolic}`;
    document.getElementById('detailMETs').textContent = session.mets;
    document.getElementById('detailMethod').textContent = session.exercise_method;
    document.getElementById('detailRec').textContent = session.recommendations;
    document.getElementById('detailEKG').src = `/${session.ekg_image_path}`;
    document.getElementById('detailDoctor').textContent = session.doctor_name;
    document.getElementById('detailTherapist').textContent = session.therapist_name;
}

function initChart() {
    const ctx = document.getElementById('progressChart').getContext('2d');

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['0', '1', '2', '3', '4', '5', '6', '7'],
            datasets: []
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        pointStyle: 'line'
                    }
                },
                title: {
                    display: true,
                    text: 'Exercise Progress Over Time',
                    font: { size: 16 }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Session Number'
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });

    updateChart();
}

function updateChart() {
    if (!chart) return;

    // Create data array with nulls for missing sessions (0-7)
    // Session 0 always starts at 0
    const createDataArray = (valueFunc) => {
        const data = new Array(8).fill(null);
        data[0] = 0; // Start at (0,0)
        sessions.forEach(s => {
            data[s.session_number] = valueFunc(s);
        });
        return data;
    };

    const datasets = [];

    if (document.getElementById('showHeartRate').checked) {
        datasets.push({
            label: 'Heart Rate (BPM)',
            data: createDataArray(s => s.heart_rate),
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.1)',
            tension: 0.1,
            spanGaps: false
        });
    }

    if (document.getElementById('showBPSystolic').checked) {
        datasets.push({
            label: 'BP Systolic (mmHg)',
            data: createDataArray(s => s.bp_systolic),
            borderColor: 'rgb(54, 162, 235)',
            backgroundColor: 'rgba(54, 162, 235, 0.1)',
            tension: 0.1,
            spanGaps: false
        });
    }

    if (document.getElementById('showBPDiastolic').checked) {
        datasets.push({
            label: 'BP Diastolic (mmHg)',
            data: createDataArray(s => s.bp_diastolic),
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.1)',
            tension: 0.1,
            spanGaps: false
        });
    }

    if (document.getElementById('showMETs').checked) {
        datasets.push({
            label: 'METs',
            data: createDataArray(s => s.mets),
            borderColor: 'rgb(153, 102, 255)',
            backgroundColor: 'rgba(153, 102, 255, 0.1)',
            tension: 0.1,
            spanGaps: false
        });
    }

    chart.data.datasets = datasets;
    chart.update();
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function goBack() {
    window.location.href = `patient_dashboard.html?patient_id=${patientId}`;
}

function logout() {
    fetch('/api/logout').then(() => {
        window.location.href = 'login.html';
    });
}
