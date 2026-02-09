/**
 * Patient Search JavaScript
 * Searches patients by phone number only
 */

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');

    // Search on Enter key
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    // Initialize with empty table
    displayResults([]);
});

/**
 * Perform search (called by button or Enter key)
 */
function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput.value.trim();

    if (!query) {
        document.getElementById('messageArea').textContent = 'Please enter a phone number';
        displayResults([]);
        return;
    }

    searchPatients(query);
}

/**
 * Search patients via API (phone number only)
 * @param {string} query - Phone number to search
 */
async function searchPatients(query) {
    const messageArea = document.getElementById('messageArea');
    messageArea.textContent = 'Searching...';

    try {
        const url = `/api/search_patients?query=${encodeURIComponent(query)}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.success) {
            displayResults(data.patients);
            messageArea.textContent = data.patients.length === 0 ? 'No patients found' : '';
        } else {
            messageArea.textContent = data.message || 'Search failed';
            displayResults([]);
        }
    } catch (error) {
        console.error('Search error:', error);
        messageArea.textContent = 'An error occurred during search';
        displayResults([]);
    }
}

/**
 * Display search results in table
 * @param {Array} patients - Array of patient objects
 */
function displayResults(patients) {
    const resultsBody = document.getElementById('resultsTableBody');

    if (!patients || patients.length === 0) {
        resultsBody.innerHTML = `
            <tr>
                <td colspan="6" style="padding: 2rem; text-align: center; color: #999;">
                    Enter phone number and click Search
                </td>
            </tr>
        `;
        return;
    }

    resultsBody.innerHTML = patients.map(patient => `
        <tr style="background-color: white;" 
            onmouseover="this.style.backgroundColor='#f5f5f5'" 
            onmouseout="this.style.backgroundColor='white'">
            <td style="padding: 0.75rem; border: 1px solid #ddd;">${escapeHtml(patient.phone)}</td>
            <td style="padding: 0.75rem; border: 1px solid #ddd;">
                <a href="patient_dashboard.html?patient_id=${patient.patient_id}" 
                   style="color: var(--primary-blue); text-decoration: none; font-weight: 500;">
                    ${escapeHtml(patient.first_name)}
                </a>
            </td>
            <td style="padding: 0.75rem; border: 1px solid #ddd;">
                <a href="patient_dashboard.html?patient_id=${patient.patient_id}" 
                   style="color: var(--primary-blue); text-decoration: none; font-weight: 500;">
                    ${escapeHtml(patient.last_name)}
                </a>
            </td>
            <td style="padding: 0.75rem; border: 1px solid #ddd; font-family: monospace;">${escapeHtml(patient.masked_id)}</td>
            <td style="padding: 0.75rem; border: 1px solid #ddd;">${formatDate(patient.created_at)}</td>
            <td style="padding: 0.75rem; border: 1px solid #ddd; text-align: center;">
                <button onclick="deletePatient(${patient.patient_id}, '${escapeHtml(patient.first_name)} ${escapeHtml(patient.last_name)}'); event.stopPropagation();" 
                        style="background-color: #dc3545; color: white; border: none; padding: 0.5rem 1rem; border-radius: 5px; cursor: pointer; font-weight: 500;"
                        onmouseover="this.style.backgroundColor='#c82333'"
                        onmouseout="this.style.backgroundColor='#dc3545'">
                    🗑️ Delete
                </button>
            </td>
        </tr>
    `).join('');
}

/**
 * Format date string to readable format
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Delete patient with confirmation
 * @param {number} patientId - Patient ID to delete
 * @param {string} patientName - Patient name for confirmation
 */
async function deletePatient(patientId, patientName) {
    // Confirmation dialog with warning
    const confirmed = confirm(
        `⚠️ WARNING: Delete Patient?\n\n` +
        `Patient: ${patientName}\n\n` +
        `This will permanently delete:\n` +
        `• Patient record\n` +
        `• All exercise sessions\n` +
        `• All EKG images\n` +
        `• All medical history\n\n` +
        `This action CANNOT be undone!\n\n` +
        `Are you sure you want to continue?`
    );

    if (!confirmed) {
        return;
    }

    const messageArea = document.getElementById('messageArea');
    messageArea.textContent = 'Deleting patient...';
    messageArea.style.color = '#dc3545';

    try {
        const response = await fetch('/api/delete_patient', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ patient_id: patientId })
        });

        const data = await response.json();

        if (data.success) {
            messageArea.textContent = `✅ Patient "${data.patient_name}" deleted successfully`;
            messageArea.style.color = '#28a745';

            // Refresh search results
            setTimeout(() => {
                performSearch();
            }, 1500);
        } else {
            messageArea.textContent = `❌ ${data.message}`;
            messageArea.style.color = '#dc3545';
        }
    } catch (error) {
        console.error('Delete error:', error);
        messageArea.textContent = '❌ Failed to delete patient. Please try again.';
        messageArea.style.color = '#dc3545';
    }
}

