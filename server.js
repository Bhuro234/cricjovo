const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public'));

const DATA_FILE = path.join(__dirname, 'data.json');
const SUGGESTIONS_FILE = path.join(__dirname, 'suggestions.json');

app.get('/api/stream', (req, res) => {
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Failed to read data' });
        try {
            let parsed = JSON.parse(data);
            if (parsed.iframeHtml && parsed.iframeHtml.includes('<iframe')) {
                if (parsed.iframeHtml.includes('allow=')) {
                    parsed.iframeHtml = parsed.iframeHtml.replace(/allow="[^"]*"/, 'allow="autoplay; fullscreen; encrypted-media; picture-in-picture"');
                } else {
                    parsed.iframeHtml = parsed.iframeHtml.replace('<iframe ', '<iframe allow="autoplay; fullscreen; encrypted-media; picture-in-picture" ');
                }
                
                parsed.iframeHtml = parsed.iframeHtml.replace(/src="([^"]+)"/, function(match, url) {
                    if (url.includes('mute=')) return match;
                    if (url.includes('?')) {
                        return 'src="' + url + '&mute=1&muted=1&autoplay=1"';
                    } else {
                        return 'src="' + url + '?mute=1&muted=1&autoplay=1"';
                    }
                });
            }
            res.json(parsed);
        } catch(e) {
            res.json({});
        }
    });
});

app.post('/api/stream', (req, res) => {
    const { password, iframeHtml } = req.body;
    if (password !== 'Bhuribhai@94') return res.status(401).json({ error: 'Unauthorized' });
    
    fs.writeFile(DATA_FILE, JSON.stringify({ iframeHtml }, null, 2), (err) => {
        if (err) return res.status(500).json({ error: 'Failed to save data' });
        res.json({ success: true });
    });
});

app.post('/api/suggestions', (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'No text provided' });
    
    fs.readFile(SUGGESTIONS_FILE, 'utf8', (err, data) => {
        let suggestions = [];
        if (!err && data) {
            try { suggestions = JSON.parse(data); } catch (e) {}
        }
        suggestions.push({ text, date: new Date().toISOString() });
        fs.writeFile(SUGGESTIONS_FILE, JSON.stringify(suggestions, null, 2), (err) => {
            if (err) return res.status(500).json({ error: 'Failed to save suggestion' });
            res.json({ success: true });
        });
    });
});

app.post('/api/admin/suggestions', (req, res) => {
    const { password } = req.body;
    if (password !== 'Bhuribhai@94') return res.status(401).json({ error: 'Unauthorized' });
    
    fs.readFile(SUGGESTIONS_FILE, 'utf8', (err, data) => {
        let suggestions = [];
        if (!err && data) {
            try { suggestions = JSON.parse(data); } catch (e) {}
        }
        res.json(suggestions);
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
