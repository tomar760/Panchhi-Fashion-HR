const API_URL = "YOUR_NEW_GOOGLE_APP_SCRIPT_URL_HERE"; // Yahan naya URL dalna

function updateClock() {
    const d = document.getElementById('liveDate'); const t = document.getElementById('liveTime');
    if(!d || !t) return;
    const now = new Date();
    d.innerText = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    t.innerText = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function showComingSoon(mod) {
    document.getElementById('constructionText').innerText = mod;
    document.getElementById('constructionModal').classList.remove('hidden');
    document.getElementById('constructionModal').classList.add('flex');
}
function closeComingSoon() { document.getElementById('constructionModal').classList.add('hidden'); }

// Sidebar Animation
function toggleMenu(menuId) {
    const menu = document.getElementById(menuId);
    const icon = document.getElementById(menuId + '-icon');
    if(menu.classList.contains('hidden')) {
        menu.classList.remove('hidden'); icon.classList.add('rotate-180');
    } else {
        menu.classList.add('hidden'); icon.classList.remove('rotate-180');
    }
}

document.addEventListener('DOMContentLoaded', () => { updateClock(); setInterval(updateClock, 1000); });
