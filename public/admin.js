function switchTab(tabId) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById('tab-' + tabId).classList.add('active');
}

function showStatus(message, isError) {
    const statusEl = document.getElementById('status');
    statusEl.textContent = message;
    statusEl.style.display = 'block';
    statusEl.className = isError ? 'error' : 'success';
    setTimeout(() => { statusEl.style.display = 'none'; }, 5000);
}

async function updateStream() {
    const password = document.getElementById('password').value;
    const iframeHtml = document.getElementById('iframe-code').value;
    
    if (!password) return showStatus('Please enter the admin password', true);
    if (!iframeHtml) return showStatus('Please enter the iframe code', true);
    
    try {
        const response = await fetch('/api/stream', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password, iframeHtml })
        });
        
        if (response.ok) {
            showStatus('Stream updated successfully! Viewers will see it within 60 seconds.', false);
        } else {
            const data = await response.json();
            showStatus(data.error || 'Failed to update stream', true);
        }
    } catch (err) {
        showStatus('Network error occurred', true);
    }
}

async function loadSuggestions() {
    const password = document.getElementById('password').value;
    if (!password) return showStatus('Please enter the admin password first', true);
    
    const listEl = document.getElementById('suggestions-list');
    listEl.innerHTML = '<div style="color: #00e5ff; text-align: center;">Loading...</div>';
    
    try {
        const response = await fetch('/api/admin/suggestions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
        });
        
        if (response.ok) {
            const suggestions = await response.json();
            if (suggestions.length === 0) {
                listEl.innerHTML = '<div style="color: #8892b0; text-align: center; padding: 20px;">No suggestions yet.</div>';
                return;
            }
            
            listEl.innerHTML = suggestions.reverse().map(s => `
                <div class="suggestion-item">
                    <div class="suggestion-date">${new Date(s.date).toLocaleString()}</div>
                    <div class="suggestion-text">${s.text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
                </div>
            `).join('');
            
        } else {
            const data = await response.json();
            listEl.innerHTML = '<div style="color: #ff3333; text-align: center; padding: 20px;">' + (data.error || 'Failed to load') + '</div>';
        }
    } catch (err) {
        listEl.innerHTML = '<div style="color: #ff3333; text-align: center; padding: 20px;">Network error</div>';
    }
}
