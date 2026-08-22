var bgMusic = document.getElementById('bgMusic');
var musicPlayBtn = document.getElementById('musicPlayBtn');
var nextTrackBtn = document.getElementById('nextTrackBtn');
var trackNameSpan = document.getElementById('trackName');
var volumeSlider = document.getElementById('volumeSlider');
var musicPlayer = document.getElementById('musicPlayer');
var musicToggleIcon = document.getElementById('musicToggleIcon');

// ===== پلی‌لیست شرطی بر اساس مسیر صفحه =====
// اگر از صفحه اصلی (خارج از source) اجرا شده، مسیر با source/
// اگر از داخل source اجرا شده، مسیر معمولی
var isRoot = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '/index.html';

var playlist = isRoot ? [
    { name: "قطعه ۱", url: "source/music/music_1.mp3" },
    { name: "قطعه ۲", url: "source/music/music_2.mp3" },
    { name: "قطعه ۳", url: "source/music/music_3.mp3" },
    { name: "قطعه ۴", url: "source/music/music_4.mp3" }
] : [
    { name: "قطعه ۱", url: "music/music_1.mp3" },
    { name: "قطعه ۲", url: "music/music_2.mp3" },
    { name: "قطعه ۳", url: "music/music_3.mp3" },
    { name: "قطعه ۴", url: "music/music_4.mp3" }
];

var STORAGE_KEY = 'hendesyar_music_state';
var currentTrackIndex = 0;
var isMusicPlaying = false;
var isStateRestored = false;

function loadMusicState() {
    try {
        var saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            return JSON.parse(saved);
        }
    } catch(e) {}
    return null;
}

function saveMusicState() {
    try {
        var state = {
            trackIndex: currentTrackIndex,
            currentTime: bgMusic.currentTime || 0,
            isPlaying: isMusicPlaying,
            volume: bgMusic.volume || 0.1
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch(e) {}
}

function loadTrack(index) {
    var track = playlist[index];
    bgMusic.src = track.url;
    trackNameSpan.textContent = track.name;
    
    var savedState = loadMusicState();
    if (savedState && savedState.trackIndex === index && !isStateRestored) {
        bgMusic.currentTime = savedState.currentTime || 0;
        bgMusic.volume = savedState.volume || 0.1;
        if (volumeSlider) volumeSlider.value = bgMusic.volume;
        if (savedState.isPlaying) {
            bgMusic.play().catch(function() {});
            isMusicPlaying = true;
            if (musicPlayBtn) {
                musicPlayBtn.innerHTML = '⏸';
                musicPlayBtn.classList.add('play-btn');
            }
            if (musicPlayer) musicPlayer.classList.remove('paused');
        }
        isStateRestored = true;
    } else {
        if (isMusicPlaying) {
            bgMusic.play().catch(function() {});
        }
    }
}

function nextTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    isStateRestored = false;
    loadTrack(currentTrackIndex);
    if (!isMusicPlaying) {
        togglePlay();
    }
    saveMusicState();
}

if (bgMusic) {
    bgMusic.addEventListener('ended', function() {
        nextTrack();
    });

    bgMusic.addEventListener('timeupdate', function() {
        if (isMusicPlaying) {
            saveMusicState();
        }
    });
}

function toggleMusicPlayer() {
    if (!musicPlayer) return;
    musicPlayer.classList.toggle('open');
    if (musicToggleIcon) {
        musicToggleIcon.textContent = musicPlayer.classList.contains('open') ? '✕' : '▶';
    }
}

function togglePlay() {
    if (isMusicPlaying) {
        bgMusic.pause();
        if (musicPlayBtn) {
            musicPlayBtn.innerHTML = '▶';
            musicPlayBtn.classList.remove('play-btn');
        }
        if (musicPlayer) musicPlayer.classList.add('paused');
    } else {
        if (!bgMusic.src || bgMusic.src === window.location.href) {
            var savedState = loadMusicState();
            if (savedState && savedState.trackIndex !== undefined) {
                currentTrackIndex = savedState.trackIndex;
                isStateRestored = false;
                loadTrack(currentTrackIndex);
                bgMusic.currentTime = savedState.currentTime || 0;
                bgMusic.volume = savedState.volume || 0.1;
                if (volumeSlider) volumeSlider.value = bgMusic.volume;
            } else {
                loadTrack(0);
            }
        }
        bgMusic.play().catch(function() {});
        if (musicPlayBtn) {
            musicPlayBtn.innerHTML = '⏸';
            musicPlayBtn.classList.add('play-btn');
        }
        if (musicPlayer) musicPlayer.classList.remove('paused');
    }
    isMusicPlaying = !isMusicPlaying;
    saveMusicState();
}

if (nextTrackBtn) {
    nextTrackBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        nextTrack();
    });
}

if (volumeSlider) {
    volumeSlider.addEventListener('input', function(e) {
        var vol = parseFloat(e.target.value);
        bgMusic.volume = vol;
        saveMusicState();
    });
}

window.addEventListener('beforeunload', function() {
    saveMusicState();
});

var savedState = loadMusicState();
if (savedState) {
    currentTrackIndex = savedState.trackIndex || 0;
    bgMusic.volume = savedState.volume || 0.1;
    if (volumeSlider) volumeSlider.value = bgMusic.volume;
    if (savedState.isPlaying) {
        isMusicPlaying = true;
    }
    loadTrack(currentTrackIndex);
} else {
    bgMusic.volume = 0.1;
    if (volumeSlider) volumeSlider.value = 0.1;
    loadTrack(0);
}