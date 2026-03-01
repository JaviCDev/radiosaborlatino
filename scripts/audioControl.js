const STREAM_URL = 'https://azuracast.aguilarsoluciones.com/listen/radiosaborlatino/stream';
const BANNER_URL = 'https://radiosaborlatino.net/radio/wp-content/uploads/header-1200x300px.jpg';

let currentAudio = null;
let isPlaying = false;

const playBtn        = document.getElementById('playBtn');
const playIcon       = document.getElementById('playIcon');
const stopIcon       = document.getElementById('stopIcon');
const loadingSpinner = document.getElementById('loadingSpinner');
const audioWave      = document.getElementById('audioWave');
const playerBanner   = document.querySelector('.playerBanner');
const volumeSlider   = document.getElementById('volumeSlider');
const nowPlayingTitle = document.getElementById('nowPlayingTitle');

if (audioWave) {
    for (let i = 0; i < 30; i++) {
        audioWave.appendChild(document.createElement('span'));
    }
}

/* ---------------- UI STATES ---------------- */

function showLoading() {
    if (playIcon) playIcon.style.display = 'none';
    if (stopIcon) stopIcon.style.display = 'none';
    if (loadingSpinner) loadingSpinner.style.display = 'block';
    if (playBtn) playBtn.classList.add('loading');
    if (audioWave) audioWave.classList.remove('active');
}

function showStop() {
    if (loadingSpinner) loadingSpinner.style.display = 'none';
    if (playIcon) playIcon.style.display = 'none';
    if (stopIcon) stopIcon.style.display = 'block';
    if (playBtn) playBtn.classList.remove('loading');
    if (audioWave) audioWave.classList.add('active');
}

function showPlay() {
    if (loadingSpinner) loadingSpinner.style.display = 'none';
    if (playIcon) playIcon.style.display = 'block';
    if (stopIcon) stopIcon.style.display = 'none';
    if (playBtn) playBtn.classList.remove('loading');
    if (audioWave) audioWave.classList.remove('active');
}

/* ---------------- STREAM CONTROL ---------------- */

function stopStream() {
    if (currentAudio) {
        currentAudio.pause();

        // FULLY destroy buffer and connection
        currentAudio.removeAttribute('src');
        currentAudio.load();

        currentAudio = null;
        isPlaying = false;
        showPlay();
    }
}

function playStream() {
    stopStream();
    showLoading();

    // cache buster forces real live connection every time
    const liveUrl = STREAM_URL + '?t=' + Date.now();

    currentAudio = new Audio();
    currentAudio.src = liveUrl;
    currentAudio.preload = 'none';

    if (volumeSlider) {
        currentAudio.volume = volumeSlider.value / 100;
    }

    currentAudio.load();

    currentAudio.play().then(() => {
        isPlaying = true;
        showStop();

        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: nowPlayingTitle?.textContent || 'Radio Sabor Latino',
                artist: 'Radio Sabor Latino',
                artwork: [{
                    src: BANNER_URL,
                    sizes: '1200x300',
                    type: 'image/jpeg'
                }]
            });

            navigator.mediaSession.setActionHandler('play', () => currentAudio.play());
            navigator.mediaSession.setActionHandler('pause', () => currentAudio.pause());
        }

    }).catch(() => {
        showPlay();
    });

    currentAudio.addEventListener('ended', () => {
        isPlaying = false;
        showPlay();
    });
}

/* ---------------- BUTTON EVENTS ---------------- */

if (playBtn) {
    playBtn.addEventListener('click', () => {
        isPlaying ? stopStream() : playStream();
    });
}

if (playerBanner) {
    playerBanner.addEventListener('click', () => {
        if (!isPlaying) playStream();
    });
}

if (volumeSlider) {
    volumeSlider.addEventListener('input', () => {
        if (currentAudio) {
            currentAudio.volume = volumeSlider.value / 100;
        }
    });
}

/* ---------------- NOW PLAYING ---------------- */

function fetchNowPlaying() {
    fetch('https://javicdev.com/saborlatino/RadioSaborLatino-info.php')
        .then(r => r.json())
        .then(data => {
            if (data.title && nowPlayingTitle) {
                nowPlayingTitle.textContent = data.title;
            }

            if (data.listeners != null) {
                const listenerSpan = document.querySelector('.listenerCounter span');
                if (listenerSpan) listenerSpan.textContent = data.listeners;
            }

            if ('mediaSession' in navigator && navigator.mediaSession.metadata && data.title) {
                navigator.mediaSession.metadata.title = data.title;
            }
        })
        .catch(() => {});
}

fetchNowPlaying();
setInterval(fetchNowPlaying, 15000);

/* ---------------- AUTOPLAY ---------------- */

window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (!isPlaying) playStream();
    }, 3000);
});

/* ---------------- HAMBURGER MENU ---------------- */

const hamburger = document.getElementById('hamburger');
const nav = document.getElementById('nav');

if (hamburger && nav) {
    hamburger.addEventListener('click', () => {
        const isOpen = nav.classList.toggle('open');
        hamburger.classList.toggle('open');
        hamburger.setAttribute('aria-expanded', isOpen);
    });

    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('open');
            hamburger.classList.remove('open');
            hamburger.setAttribute('aria-expanded', 'false');
        });
    });
}