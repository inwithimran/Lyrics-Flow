// --- XSS PROTECTION: escape user/external text before inserting into innerHTML ---
function escapeHTML(str) {
    return String(str ?? '').replace(/[&<>"']/g, (ch) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[ch]));
}

// --- GLOBAL SHEET & TAB HELPERS (accessible from any scope) ---
function openSheet(sheet) {
    if (!sheet) return;
    sheet.classList.add('open');
    if (sheet.id === 'library-sheet') {
        if (typeof window.renderLibraryPlaylist === 'function') {
            window.renderLibraryPlaylist();
        }
        if (typeof window.scrollToActiveTrack === 'function') {
            window.scrollToActiveTrack();
        }
    }
}
function closeSheet(sheet) { if (sheet) sheet.classList.remove('open'); }

function switchTab(tabId) {
    document.querySelectorAll('.m3-tab-pill[data-tab]').forEach(chip => {
        chip.classList.toggle('active', chip.dataset.tab === tabId);
    });
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.toggle('hidden', pane.id !== tabId);
    });
}

// --- STUDIO QUICK-ACCESS NAVIGATION (opens sheet, switches tab, scrolls & highlights target) ---
document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-studio-tab]');
    if (!btn) return;

    const sheetId = btn.dataset.targetSheet || 'studio-sheet';
    const tabId = btn.dataset.studioTab;
    const scrollTargetId = btn.dataset.scrollTo;

    const sheet = document.getElementById(sheetId);
    if (sheet && typeof openSheet === 'function') {
        openSheet(sheet);
    }

    if (tabId && typeof switchTab === 'function') {
        switchTab(tabId);
    }

    if (scrollTargetId) {
        requestAnimationFrame(() => {
            setTimeout(() => {
                const target = document.getElementById(scrollTargetId);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'center' });

                    setTimeout(() => {
                        document.querySelectorAll('.quick-access-highlight').forEach(el => {
                            el.classList.remove('quick-access-highlight');
                        });
                        void target.offsetWidth;
                        target.classList.add('quick-access-highlight');
                        setTimeout(() => {
                            target.classList.remove('quick-access-highlight');
                        }, 2200);
                    }, 400);
                }
            }, 400);
        });
    }
});

// --- DESKTOP ONLINE LRC SEARCH BRIDGE SCRIPT ---
        document.addEventListener('DOMContentLoaded', () => {
            const dtSongInput = document.getElementById('dt-online-song-input');
            const dtArtistInput = document.getElementById('dt-online-artist-input');
            const dtFetchBtn = document.getElementById('dt-btn-fetch-online-lrc');
            const dtFetchStatus = document.getElementById('dt-online-fetch-status');

            const modalSongInput = document.getElementById('online-song-input');
            const modalArtistInput = document.getElementById('online-artist-input');
            const modalFetchBtn = document.getElementById('btn-fetch-online-lrc');
            const modalFetchStatus = document.getElementById('online-fetch-status');

            if (!dtFetchBtn || !modalFetchBtn) return;

            // Trigger fetch from desktop widget by bridging to core engine handlers
            dtFetchBtn.addEventListener('click', () => {
                if (modalSongInput) modalSongInput.value = dtSongInput ? dtSongInput.value : '';
                if (modalArtistInput) modalArtistInput.value = dtArtistInput ? dtArtistInput.value : '';
                
                modalFetchBtn.click();
            });

            // Sync inputs live between desktop right sidebar and studio drawer modal
            if (dtSongInput && modalSongInput) {
                dtSongInput.addEventListener('input', () => modalSongInput.value = dtSongInput.value);
                modalSongInput.addEventListener('input', () => dtSongInput.value = modalSongInput.value);
            }

            if (dtArtistInput && modalArtistInput) {
                dtArtistInput.addEventListener('input', () => modalArtistInput.value = dtArtistInput.value);
                modalArtistInput.addEventListener('input', () => dtArtistInput.value = modalArtistInput.value);
            }

            // Sync status messages
            if (modalFetchStatus && dtFetchStatus) {
                const observer = new MutationObserver(() => {
                    dtFetchStatus.textContent = modalFetchStatus.textContent;
                    dtFetchStatus.className = modalFetchStatus.className;
                    if (modalFetchStatus.classList.contains('hidden')) {
                        dtFetchStatus.classList.add('hidden');
                    } else {
                        dtFetchStatus.classList.remove('hidden');
                    }
                });
                observer.observe(modalFetchStatus, { attributes: true, childList: true, characterData: true, subtree: true });
            }
        });
    
// --- DESKTOP VOLUME & INTEGRATION ENHANCEMENT SCRIPT ---
     document.addEventListener('DOMContentLoaded', () => {
            const audioPlayer = document.getElementById('audio-player');
            const volumeSlider = document.getElementById('volume-slider');
            const btnMute = document.getElementById('btn-mute');
            const btnMuteMobile = document.getElementById('btn-mute-mobile');
            const volIcon = document.getElementById('vol-icon');
            const volIconMobile = document.getElementById('vol-icon-mobile');
            let lastVol = userSettings.volume > 0 ? userSettings.volume : 1;

            // Restore saved volume & mute state (otherwise it silently resets to 100% on every reload)
            if (audioPlayer) {
                const initialVol = userSettings.muted ? 0 : userSettings.volume;
                audioPlayer.volume = initialVol;
                if (volumeSlider) volumeSlider.value = initialVol;
                updateVolIcon(initialVol);
            }

            // Volume Control Sync
            if (volumeSlider && audioPlayer) {
                volumeSlider.addEventListener('input', (e) => {
                    const val = parseFloat(e.target.value);
                    audioPlayer.volume = val;
                    updateVolIcon(val);

                    userSettings.volume = val;
                    userSettings.muted = (val === 0);
                    if (val > 0) lastVol = val;
                    saveSettings();
                });
            }

            const toggleMute = () => {
                if (audioPlayer.volume > 0) {
                    lastVol = audioPlayer.volume;
                    audioPlayer.volume = 0;
                    if (volumeSlider) volumeSlider.value = 0;
                    updateVolIcon(0);

                    userSettings.muted = true;
                    saveSettings();
                } else {
                    audioPlayer.volume = lastVol || 1;
                    if (volumeSlider) volumeSlider.value = audioPlayer.volume;
                    updateVolIcon(audioPlayer.volume);

                    userSettings.muted = false;
                    userSettings.volume = audioPlayer.volume;
                    saveSettings();
                }
            };

            if (btnMute && audioPlayer) btnMute.addEventListener('click', toggleMute);
            if (btnMuteMobile && audioPlayer) btnMuteMobile.addEventListener('click', toggleMute);

            // Exposed for keyboard shortcuts (mute toggle + step volume up/down)
            window.toggleMute = toggleMute;
            window.stepVolume = (delta) => {
                const val = Math.max(0, Math.min(1, (audioPlayer.volume || 0) + delta));
                audioPlayer.volume = val;
                if (volumeSlider) volumeSlider.value = val;
                updateVolIcon(val);

                userSettings.volume = val;
                userSettings.muted = (val === 0);
                if (val > 0) lastVol = val;
                saveSettings();
            };

            function updateVolIcon(val) {
                [volIcon, volIconMobile].forEach(icon => {
                    if (!icon) return;
                    icon.className = '';
                    if (val === 0) {
                        icon.className = 'fa-solid fa-volume-xmark text-slate-500 text-xs';
                    } else if (val < 0.5) {
                        icon.className = 'fa-solid fa-volume-low text-sky-400 text-xs';
                    } else {
                        icon.className = 'fa-solid fa-volume-high text-sky-400 text-xs';
                    }
                    icon.style.width = '14px';
                    icon.style.textAlign = 'center';
                });
            }

            // Exposed so applySettingsToUI() can refresh the icon too (e.g. after Reset Preferences)
            window.updateVolIcon = updateVolIcon;

            // Sync Desktop Left Sidebar Title & Artist
            const mainTitle = document.getElementById('track-title');
            const mainArtist = document.getElementById('track-artist');
            const dtTitle = document.getElementById('desktop-side-title');
            const dtArtist = document.getElementById('desktop-side-artist');
            const dtSpin = document.querySelector('.desktop-art-spin');
            const mainIcon = document.getElementById('track-art-icon');

            if (mainTitle && dtTitle) {
                const observer = new MutationObserver(() => {
                    dtTitle.textContent = mainTitle.textContent;
                    dtArtist.textContent = mainArtist.textContent;
                    if (mainIcon && dtSpin) {
                        if (mainIcon.classList.contains('playing')) {
                            dtSpin.classList.add('playing');
                        } else {
                            dtSpin.classList.remove('playing');
                        }
                    }
                });
                observer.observe(mainTitle, { childList: true, characterData: true, subtree: true });
                if (mainIcon) {
                    const spinObs = new MutationObserver(() => {
                        if (mainIcon.classList.contains('playing')) {
                            dtSpin.classList.add('playing');
                        } else {
                            dtSpin.classList.remove('playing');
                        }
                    });
                    spinObs.observe(mainIcon, { attributes: true, attributeFilter: ['class'] });
                }
            }

                       // Desktop Sync Offset Shortcuts (Synchronized Lyrics Stage Header)
            const stageOffsetUp = document.getElementById('stage-offset-up');
            const stageOffsetDown = document.getElementById('stage-offset-down');

            if (stageOffsetUp) {
                stageOffsetUp.addEventListener('click', () => {
                    if (typeof adjustOffset === 'function') adjustOffset(0.1);
                });
            }
            if (stageOffsetDown) {
                stageOffsetDown.addEventListener('click', () => {
                    if (typeof adjustOffset === 'function') adjustOffset(-0.1);
                });
            }

        });        
        
        
        
        
        // DEFAULT CONFIGURATION OBJECT
        const DEFAULT_SETTINGS = {
            isWakeLockActive: true,
            themeColor: '#38BDF8',
            themeRgb: '56, 189, 248',
            themeName: 'CYBER CYAN',
            visualizerMode: 'bars',
            fontScale: 1.0,
            timeOffset: 0.0,
            eqPreset: 'flat',
            eqBands: [0, 0, 0, 0, 0],
            playbackMode: 'off',
            volume: 1.0,
            muted: false,
            playbackRate: 1.0
        };

        // LOCALSTORAGE PERSISTENCE ENGINE
        const STORAGE_KEY = 'lyrics_flow_pro_prefs_v2';

        function loadSavedSettings() {
            try {
                const saved = localStorage.getItem(STORAGE_KEY);
                return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : { ...DEFAULT_SETTINGS };
            } catch (e) {
                console.error('LocalStorage Read Error:', e);
                return { ...DEFAULT_SETTINGS };
            }
        }

        let userSettings = loadSavedSettings();

        function saveSettings() {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(userSettings));
            } catch (e) {
                console.error('LocalStorage Write Error:', e);
            }
        }

        // --- LAST PLAYED TRACK PERSISTENCE (remembers song + position across reloads) ---
        const LAST_TRACK_KEY = 'lyrics_flow_pro_last_track_v1';

        function saveLastTrackState() {
            if (!activeSongId || activeSongId === 'custom-file') return;
            try {
                localStorage.setItem(LAST_TRACK_KEY, JSON.stringify({
                    id: activeSongId,
                    time: audio.currentTime || 0
                }));
            } catch (e) {
                console.error('LocalStorage Write Error:', e);
            }
        }

        function loadLastTrackState() {
            try {
                const saved = localStorage.getItem(LAST_TRACK_KEY);
                return saved ? JSON.parse(saved) : null;
            } catch (e) {
                console.error('LocalStorage Read Error:', e);
                return null;
            }
        }

        // CORE STATE & SELECTORS
        const audio = document.getElementById('audio-player');
        const scroller = document.getElementById('lyrics-scroller');
        const container = document.getElementById('lyrics-container');
        const btnPlayPause = document.getElementById('btn-play-pause');
        const btnPlayPauseMob = document.getElementById('btn-play-pause-mob');
        const scrubber = document.getElementById('audio-scrubber');
        const currTimeLbl = document.getElementById('curr-time');
        const durTimeLbl = document.getElementById('dur-time');
        const resumeSyncBtn = document.getElementById('resume-sync-btn');
        const trackArtIcon = document.getElementById('track-art-icon');

        let onlineTrackTitle = '';
        let onlineArtistName = '';
        let fileTrackTitle = '';
        let fileArtistName = '';
        let activeSongId = null;
        let pendingLocalAudioFile = null; // Selected but not yet applied local file (waits for Apply button)

        let searchQuery = '';

        let currentBlobUrl = null;
        let activeFetchController = null;
        let wakeLock = null;

        const canvasBar = document.getElementById('viz-canvas-bar');
        const ctxBar = canvasBar.getContext('2d');
        const canvasBg = document.getElementById('viz-canvas-bg');
        const ctxBg = canvasBg.getContext('2d');

        let lyrics = [];
        let activeIndex = -1;
        let isAutoScrollLocked = false;

        let audioCtx, analyser, dataArray, sourceNode;
        let eqBands = [];
        const EQ_FREQS = [60, 230, 910, 4000, 14000];

        let sleepEndTime = null;
        let sleepTimerTimeout = null;
        let sleepIntervalId = null;

        let isDragging = false;
        let dragStartY = 0;
        let dragStartTransformY = 0;
        let totalDragDistance = 0;

        let isScrubbing = false;

        let barCount = window.innerWidth >= 768 ? 128 : 64;
        let smoothBars = new Array(128).fill(0);
        let barVelocities = new Array(128).fill(0);


        // --- OPTIMIZED FAST AUDIO SOURCE LOADER & BACKGROUND CACHING ---
        async function setAudioSource(source) {
            if (activeFetchController) {
                activeFetchController.abort();
                activeFetchController = null;
            }

            if (currentBlobUrl) {
                URL.revokeObjectURL(currentBlobUrl);
                currentBlobUrl = null;
            }

            if (!source) return;

            audio.crossOrigin = 'anonymous';

            if (source instanceof File || source instanceof Blob) {
                currentBlobUrl = URL.createObjectURL(source);
                audio.src = currentBlobUrl;
                return;
            }

            if (typeof source === 'string') {
                audio.src = source;

                if (source.startsWith('http://') || source.startsWith('https://')) {
                    const controller = new AbortController();
                    activeFetchController = controller;

                    fetch(source, { signal: controller.signal })
                        .then(res => {
                            if (!res.ok) throw new Error("Network response was not ok");
                            return res.blob();
                        })
                        .then(blob => {
                            if (activeFetchController !== controller) return;

                            const savedTime = audio.currentTime || 0;
                            const wasPaused = audio.paused;

                            if (currentBlobUrl) URL.revokeObjectURL(currentBlobUrl);
                            currentBlobUrl = URL.createObjectURL(blob);

                            audio.src = currentBlobUrl;

                            const restoreState = () => {
                                seekAudioTo(savedTime);
                                if (!wasPaused) {
                                    triggerPlay();
                                }
                                audio.removeEventListener('loadedmetadata', restoreState);
                            };

                            if (audio.readyState >= 1) {
                                restoreState();
                            } else {
                                audio.addEventListener('loadedmetadata', restoreState);
                            }
                        })
                        .catch(err => {
                            if (err.name !== 'AbortError') {
                                console.warn("Background audio caching skipped:", err);
                            }
                        });
                }
            }
        }

        // --- SAFE SEEKING WRAPPER ---
        function seekAudioTo(targetTime) {
            if (!audio.src) return;
            if (isNaN(targetTime) || !isFinite(targetTime)) return;

            let maxTime = audio.duration;
            if (isNaN(maxTime) || !isFinite(maxTime)) {
                if (audio.seekable && audio.seekable.length > 0) {
                    maxTime = audio.seekable.end(audio.seekable.length - 1);
                } else {
                    maxTime = targetTime;
                }
            }

            const validTime = Math.max(0, Math.min(maxTime, targetTime));

            try {
                if (audio.readyState >= 1) {
                    audio.currentTime = validTime;
                } else {
                    const onLoaded = () => {
                        audio.currentTime = validTime;
                        audio.removeEventListener('loadedmetadata', onLoaded);
                    };
                    audio.addEventListener('loadedmetadata', onLoaded);
                }
            } catch (e) {
                console.warn("Seek error:", e);
            }
        }

        // --- ALWAYS DISPLAY ON (SCREEN WAKE LOCK) ---
        const wakeLockToggle = document.getElementById('wake-lock-toggle');

        async function requestWakeLock() {
            if ('wakeLock' in navigator && userSettings.isWakeLockActive) {
                try {
                    wakeLock = await navigator.wakeLock.request('screen');
                } catch (err) {
                    console.log('Wake Lock Error:', err);
                }
            }
        }

        async function releaseWakeLock() {
            if (wakeLock !== null) {
                try {
                    await wakeLock.release();
                    wakeLock = null;
                } catch (err) {
                    console.log('Wake Lock Release Error:', err);
                }
            }
        }

        wakeLockToggle.onchange = async (e) => {
            userSettings.isWakeLockActive = e.target.checked;
            saveSettings();
            if (userSettings.isWakeLockActive) {
                await requestWakeLock();
            } else {
                await releaseWakeLock();
            }
        };

        document.addEventListener('visibilitychange', async () => {
            if (wakeLock !== null && document.visibilityState === 'visible' && userSettings.isWakeLockActive) {
                await requestWakeLock();
            }
        });

        if (userSettings.isWakeLockActive) {
            requestWakeLock();
        }

        // --- PLAYBACK MODE TOGGLE ENGINE ---
        function updateLoopModeUI() {
    const btn = document.getElementById('btn-loop-mode');
    const icon = document.getElementById('loop-mode-icon');
    const text = document.getElementById('loop-mode-text');
    const badge = document.getElementById('loop-mode-badge');

    const btnDt = document.getElementById('btn-loop-mode-dt');
    const iconDt = document.getElementById('loop-mode-icon-dt');
    const textDt = document.getElementById('loop-mode-text-dt');

    btn.classList.remove('active-mode');
    if (btnDt) btnDt.classList.remove('active-mode');

    badge.classList.add('hidden');
    badge.classList.remove('flex');

    if (userSettings.playbackMode === 'one') {
        btn.classList.add('active-mode');
        if (btnDt) btnDt.classList.add('active-mode');
        icon.className = 'fa-solid fa-repeat text-xs';
        text.innerText = 'Repeat';
        if (iconDt) iconDt.className = 'fa-solid fa-repeat text-sm';
        if (textDt) textDt.innerText = 'Repeat';
        badge.classList.remove('hidden');
        badge.classList.add('flex');
    } else if (userSettings.playbackMode === 'shuffle') {
        btn.classList.add('active-mode');
        if (btnDt) btnDt.classList.add('active-mode');
        icon.className = 'fa-solid fa-shuffle text-xs';
        text.innerText = 'Shuffle';
        if (iconDt) iconDt.className = 'fa-solid fa-shuffle text-sm';
        if (textDt) textDt.innerText = 'Shuffle';
    } else {
        icon.className = 'fa-solid fa-repeat text-xs';
        text.innerText = 'Off';
        if (iconDt) iconDt.className = 'fa-solid fa-repeat text-sm';
        if (textDt) textDt.innerText = 'Off';
    }
}

const toggleLoopMode = () => {
    if (userSettings.playbackMode === 'off') {
        userSettings.playbackMode = 'one';
    } else if (userSettings.playbackMode === 'one') {
        userSettings.playbackMode = 'shuffle';
    } else {
        userSettings.playbackMode = 'off';
    }
    saveSettings();
    updateLoopModeUI();
};

const btnLoopMob = document.getElementById('btn-loop-mode');
const btnLoopDt = document.getElementById('btn-loop-mode-dt');
if (btnLoopMob) btnLoopMob.onclick = toggleLoopMode;
if (btnLoopDt) btnLoopDt.onclick = toggleLoopMode;


        // --- AUTO PLAY NEXT SONG & ENDED EVENT ---
        audio.onended = () => {
            if (userSettings.playbackMode === 'one') {
                seekAudioTo(0);
                triggerPlay();
                return;
            }

            const playlist = window.PLAYLIST_DATA || [];
            if (!playlist.length || activeSongId === 'custom-file' || !activeSongId) return;

            let nextTrack = null;

            if (userSettings.playbackMode === 'shuffle') {
                let randomIndex;
                do {
                    randomIndex = Math.floor(Math.random() * playlist.length);
                } while (playlist.length > 1 && playlist[randomIndex].id === activeSongId);
                nextTrack = playlist[randomIndex];
            } else {
                const currentIndex = playlist.findIndex(s => s.id === activeSongId);
                if (currentIndex !== -1) {
                    const nextIndex = (currentIndex + 1) % playlist.length;
                    nextTrack = playlist[nextIndex];
                }
            }

            if (nextTrack) {
                // Automatic advance shouldn't wipe out a local file the user has staged
                // but not yet applied — only an explicit user pick should do that.
                loadTrackFromLibrary(nextTrack, { keepPendingLocalFile: true });
            }
        };

        function playPreviousTrack() {
            if (audio.currentTime > 3) {
                seekAudioTo(0);
                return;
            }

            const playlist = window.PLAYLIST_DATA || [];
            if (!playlist.length || activeSongId === 'custom-file' || !activeSongId) {
                seekAudioTo(0);
                return;
            }

            let prevTrack = null;
            if (userSettings.playbackMode === 'shuffle') {
                const randomIndex = Math.floor(Math.random() * playlist.length);
                prevTrack = playlist[randomIndex];
            } else {
                const currentIndex = playlist.findIndex(s => s.id === activeSongId);
                const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
                prevTrack = playlist[prevIndex];
            }

            if (prevTrack) {
                loadTrackFromLibrary(prevTrack);
            }
        }

        function playNextTrack() {
            const playlist = window.PLAYLIST_DATA || [];
            if (!playlist.length || activeSongId === 'custom-file' || !activeSongId) return;

            let nextTrack = null;
            if (userSettings.playbackMode === 'shuffle') {
                const randomIndex = Math.floor(Math.random() * playlist.length);
                nextTrack = playlist[randomIndex];
            } else {
                const currentIndex = playlist.findIndex(s => s.id === activeSongId);
                const nextIndex = (currentIndex + 1) % playlist.length;
                nextTrack = playlist[nextIndex];
            }

            if (nextTrack) {
                loadTrackFromLibrary(nextTrack);
            }
        }

        document.getElementById('btn-prev-track').onclick = playPreviousTrack;
        document.getElementById('btn-next-track').onclick = playNextTrack;

        // --- SHOW/HIDE THE SOFT-BAR VISUALIZER STRIP ---
        // On desktop, when a non-"bars" style (e.g. the galaxy/orbit style) is active,
        // the bar strip's reserved space/background can visually cover part of the
        // sidebar. So on desktop we fully collapse the strip unless "bars" is selected.
        // On mobile there is no sidebar to protect, so the strip always stays as-is.
        function updateBarVizVisibility() {
            const wrapper = document.getElementById('bar-viz-wrapper');
            if (!wrapper) return;

            const isDesktop = window.innerWidth >= 1024;
            const isBarsStyle = userSettings.visualizerMode === 'bars';

            if (isDesktop && !isBarsStyle) {
                wrapper.style.display = 'none';
            } else {
                wrapper.style.display = '';
            }
        }

        // --- APPLY INITIAL / RESTORED SETTINGS TO UI & ENGINE ---
        function applySettingsToUI() {
            wakeLockToggle.checked = userSettings.isWakeLockActive;

            document.documentElement.style.setProperty('--m3-primary', userSettings.themeColor);
            document.documentElement.style.setProperty('--m3-primary-rgb', userSettings.themeRgb);
            document.getElementById('theme-tag').innerText = userSettings.themeName;
            document.getElementById('theme-tag').style.color = userSettings.themeColor;

            document.querySelectorAll('.viz-style-chip').forEach(btn => {
                if (btn.dataset.style === userSettings.visualizerMode) btn.classList.add('active');
                else btn.classList.remove('active');
            });

            updateBarVizVisibility();

            document.querySelectorAll('#theme-picker .theme-swatch').forEach(btn => {
                if (btn.dataset.color === userSettings.themeColor) btn.classList.add('selected');
                else btn.classList.remove('selected');
            });

            document.documentElement.style.setProperty('--font-scale', userSettings.fontScale);
            document.getElementById('font-scale-lbl').innerText = parseFloat(userSettings.fontScale).toFixed(2) + 'x';

            updateOffsetUI();
            updateLoopModeUI();

            document.querySelectorAll('.eq-preset-btn').forEach(btn => {
                if (btn.dataset.preset === userSettings.eqPreset) btn.classList.add('active');
                else btn.classList.remove('active');
            });

            userSettings.eqBands.forEach((val, i) => {
    const sliders = document.querySelectorAll(`.eq-band[data-band="${i}"], .dt-eq-band[data-band="${i}"]`);
    sliders.forEach(slider => { if (slider) slider.value = val; });
    if (eqBands[i]) eqBands[i].gain.value = val;
});

            // Restore saved volume/mute state
            const volSliderEl = document.getElementById('volume-slider');
            const initialVol = userSettings.muted ? 0 : userSettings.volume;
            audio.volume = initialVol;
            if (volSliderEl) volSliderEl.value = initialVol;
            if (typeof window.updateVolIcon === 'function') window.updateVolIcon(initialVol);

            // Restore saved playback speed
            const speedSliderEl = document.getElementById('speed-slider');
            const speedValEl = document.getElementById('speed-val');
            audio.playbackRate = userSettings.playbackRate;
            if (speedSliderEl) speedSliderEl.value = userSettings.playbackRate;
            if (speedValEl) speedValEl.innerText = parseFloat(userSettings.playbackRate).toFixed(2) + 'x';

            updateScroll(activeIndex);
        }

                // --- HEADER TITLE PRIORITY UPDATE ---
        function updateHeaderTitle() {
            const titleEl = document.getElementById('track-title');
            const artistEl = document.getElementById('track-artist');

            const dtSongInput = document.getElementById('dt-online-song-input');
            const dtArtistInput = document.getElementById('dt-online-artist-input');
            const modalSongInput = document.getElementById('online-song-input');
            const modalArtistInput = document.getElementById('online-artist-input');

            let currentTitle = onlineTrackTitle || fileTrackTitle || '';
            let currentArtist = onlineArtistName || fileArtistName || '';

            if (onlineTrackTitle) {
                titleEl.innerText = onlineTrackTitle;
                artistEl.innerText = onlineArtistName || 'Online Synced Track';
            } else if (fileTrackTitle) {
                titleEl.innerText = fileTrackTitle;
                artistEl.innerText = fileArtistName || 'Local File Track';
            } else {
                titleEl.innerText = 'No Track Loaded';
                artistEl.innerText = 'Tap music library or studio buttons';
            }
        
            if (currentTitle) {
                if (dtSongInput) dtSongInput.value = currentTitle;
                if (modalSongInput) modalSongInput.value = currentTitle;
                if (dtArtistInput) dtArtistInput.value = currentArtist;
                if (modalArtistInput) modalArtistInput.value = currentArtist;
            }
        }

        // --- CANVAS INIT & DRAW LOOP ---
        function initCanvas() {
            const dpr = window.devicePixelRatio || 1;
            const barWrapper = document.getElementById('bar-viz-wrapper').getBoundingClientRect();
            
            canvasBar.width = barWrapper.width * dpr;
            canvasBar.height = barWrapper.height * dpr;
            ctxBar.scale(dpr, dpr);

            canvasBg.width = window.innerWidth * dpr;
            canvasBg.height = window.innerHeight * dpr;
            ctxBg.scale(dpr, dpr);

            if (window.innerWidth >= 768) {
                barCount = 128;
                if (analyser) analyser.fftSize = 512;
            } else {
                barCount = 64;
                if (analyser) analyser.fftSize = 256;
            }
        }
        window.onresize = () => { initCanvas(); updateScroll(activeIndex); updateBarVizVisibility(); };
        initCanvas();

        // --- WEB AUDIO API SETUP ---
        async function setupAudioContext() {
            if (audioCtx) return;
            try {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                analyser = audioCtx.createAnalyser();
                analyser.fftSize = window.innerWidth >= 768 ? 512 : 256;
         analyser.smoothingTimeConstant = 0.65;

                dataArray = new Uint8Array(analyser.frequencyBinCount);

                sourceNode = audioCtx.createMediaElementSource(audio);

                
let lastNode = sourceNode;
EQ_FREQS.forEach((freq, idx) => {
    const filter = audioCtx.createBiquadFilter();
    if (idx === 0) filter.type = 'lowshelf';
    else if (idx === EQ_FREQS.length - 1) filter.type = 'highshelf';
    else { filter.type = 'peaking'; filter.Q.value = 1.0; }
    
    filter.frequency.value = freq; 
    filter.gain.value = userSettings.eqBands[idx] || 0; 
    
    lastNode.connect(filter);
    lastNode = filter;
    eqBands.push(filter);
});


                lastNode.connect(analyser);
                analyser.connect(audioCtx.destination);
            } catch (err) {
                console.log("AudioContext setup:", err);
            }
        }

        // Dual Canvas Visualizer Engine
        function drawVisualizer() {
            requestAnimationFrame(drawVisualizer);

            const wBar = canvasBar.width / (window.devicePixelRatio || 1);
            const hBar = canvasBar.height / (window.devicePixelRatio || 1);
            const wBg = window.innerWidth;
            const hBg = window.innerHeight;

            ctxBar.clearRect(0, 0, wBar, hBar);
            ctxBg.clearRect(0, 0, wBg, hBg);

            if (userSettings.visualizerMode === 'off') return;

            let hasData = false;
            if (analyser && !audio.paused) {
                analyser.getByteFrequencyData(dataArray);
                for (let v of dataArray) if (v > 0) { hasData = true; break; }
            }

            let displayData = new Array(barCount).fill(0);
            if (hasData) {
                for (let i = 0; i < barCount; i++) displayData[i] = dataArray[i] || 0;
            } else if (!audio.paused) {
                const time = Date.now() / 200;
                for (let i = 0; i < barCount; i++) displayData[i] = (Math.sin(time + i * 0.3) * 0.5 + 0.5) * 120 + 20;
            }

            const gravity = 1.8;
const attackForce = 0.45;

for (let i = 0; i < barCount; i++) {
    let target = Math.pow(displayData[i] / 255, 1.8) * 255;

    if (target > smoothBars[i]) {
        smoothBars[i] += (target - smoothBars[i]) * attackForce;
        barVelocities[i] = (target - smoothBars[i]) * 0.2;
    } else {
        barVelocities[i] += gravity;
        smoothBars[i] -= barVelocities[i];
        if (smoothBars[i] < 0) {
            smoothBars[i] = 0;
            barVelocities[i] = 0;
        }
    }
}


            if (userSettings.visualizerMode === 'bars') {
                const slotWidth = wBar / barCount;
                const barW = slotWidth * 0.45;

                for (let i = 0; i < barCount; i++) {
                    const h = (smoothBars[i] / 255) * (hBar * 1);
                    const x = (i * slotWidth) + (slotWidth - barW) / 2;
                    const y = hBar - h;

                    const grad = ctxBar.createLinearGradient(0, hBar, 0, y);
                    grad.addColorStop(0, 'transparent');
                    grad.addColorStop(0.4, userSettings.themeColor);
                    grad.addColorStop(1, '#ffffff');

                    ctxBar.fillStyle = grad;
                    ctxBar.beginPath();
                    ctxBar.roundRect(x, y, barW, h, [3, 3, 0, 0]);
                    ctxBar.fill();
                }
            } 
            else if (userSettings.visualizerMode === 'circle') {
    // Ensure canvas sits in front of ambient background but behind lyric text
    canvasBg.style.zIndex = '5';

    const dpr = window.devicePixelRatio || 1;
    const containerRect = container.getBoundingClientRect();
    
    // Center the circle in Desktop mode inside the lyric viewport area
    const cx = containerRect.width > 0 ? (containerRect.left + containerRect.width / 2) : (window.innerWidth / 2);
    const cy = containerRect.height > 0 ? (containerRect.top + containerRect.height / 2) : (window.innerHeight / 2);
    const radius = Math.min(containerRect.width || window.innerWidth, containerRect.height || window.innerHeight) * 0.28;

    ctxBg.save();
    ctxBg.translate(cx, cy);

    for (let i = 0; i < barCount; i++) {
        const angle = (i / barCount) * Math.PI * 2;
        const h = (smoothBars[i] / 255) * (radius * 0.75);

        const x1 = Math.cos(angle) * radius;
        const y1 = Math.sin(angle) * radius;
        const x2 = Math.cos(angle) * (radius + h);
        const y2 = Math.sin(angle) * (radius + h);

        ctxBg.beginPath();
        ctxBg.moveTo(x1, y1);
        ctxBg.lineTo(x2, y2);
        ctxBg.strokeStyle = userSettings.themeColor;
        ctxBg.lineWidth = 3;
        ctxBg.lineCap = 'round';
        ctxBg.globalAlpha = 0.85;
        ctxBg.stroke();
    }

    ctxBg.restore();
}


        }
        drawVisualizer();

        // --- LRC PARSER & RENDERER ---
        function parseLRC(text) {
            lyrics = [];
            if (!text || !text.trim()) { renderLyrics(); return; }

            const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/);
            const timeReg = /[\[<\(]\s*(\d{1,3})\s*:\s*(\d{1,2})(?:\s*[\.\:,]\s*(\d{1,3}))?\s*[\]>\)]/g;

            let timestamped = false;

            lines.forEach((line) => {
                if (/^\s*[\[<\(]\s*(ar|ti|al|by|offset|length)\s*:/i.test(line)) return;

                const matches = [...line.matchAll(timeReg)];
                if (matches.length > 0) {
                    timestamped = true;
                    let content = line.replace(timeReg, '').trim() || "♪ ♪ ♪";
                    matches.forEach(m => {
                        const min = parseInt(m[1], 10);
                        const sec = parseInt(m[2], 10);
                        let ms = 0;
                        if (m[3]) {
                            const raw = m[3];
                            ms = raw.length === 1 ? parseInt(raw, 10) * 100 : (raw.length === 2 ? parseInt(raw, 10) * 10 : parseInt(raw, 10));
                        }
                        lyrics.push({ time: min * 60 + sec + ms / 1000, content });
                    });
                }
            });

            if (!timestamped) {
                const cleanLines = lines.filter(l => l.trim() !== '');
                const step = (audio.duration && !isNaN(audio.duration)) ? audio.duration / cleanLines.length : 3.5;
                cleanLines.forEach((content, i) => {
                    lyrics.push({ time: i * step, content: content.trim() });
                });
            }

            lyrics.sort((a, b) => a.time - b.time);
            renderLyrics();
        }

        function renderLyrics() {
            scroller.innerHTML = '';
            if (lyrics.length === 0) {
                scroller.innerHTML = '<div class="lyric-line active">No synchronized lyrics loaded</div>';
                updateScroll(-1);
                return;
            }

            lyrics.forEach((item, idx) => {
                const div = document.createElement('div');
                div.className = 'lyric-line';
                div.id = `line-${idx}`;
                div.innerText = item.content;

                div.onclick = (e) => {
                    e.stopPropagation();
                    if (totalDragDistance > 10) return;
                    seekAudioTo(item.time + userSettings.timeOffset);
                    if (audio.paused) triggerPlay();
                    
                    isAutoScrollLocked = false;
                    resumeSyncBtn.classList.add('hidden');
                    updateScroll(idx, true);
                };

                scroller.appendChild(div);
            });
            activeIndex = -1;
            updateScroll(-1);
        }

        function updateScroll(idx, force = false) {
            const lines = document.querySelectorAll('.lyric-line');
            lines.forEach(el => el.classList.remove('active'));

            const containerH = container.offsetHeight;

            if (idx === -1 || !lines.length) {
                if (!isAutoScrollLocked || force) {
                    scroller.style.transform = `translateY(${containerH / 2}px)`;
                }
                return;
            }

            const target = document.getElementById(`line-${idx}`);
            if (target) {
                target.classList.add('active');
                if (!isAutoScrollLocked || force) {
                    const targetOffset = target.offsetTop + target.offsetHeight / 2;
                    scroller.style.transform = `translateY(${containerH / 2 - targetOffset}px)`;
                }
            }
        }

        // Realtime 60FPS Lyric Sync Loop
        function syncLoop() {
            if (!audio.paused && !audio.ended) {
                const cur = audio.currentTime;
                currTimeLbl.innerText = formatTime(cur);
                if (!isScrubbing && audio.duration && !isNaN(audio.duration)) {
                    scrubber.value = (cur / audio.duration) * 100;
                }

                const adj = cur - userSettings.timeOffset;
                let idx = -1;
                for (let i = 0; i < lyrics.length; i++) {
                    if (adj >= lyrics[i].time - 0.08) idx = i;
                    else break;
                }

                if (idx !== activeIndex) {
                    activeIndex = idx;
                    updateScroll(idx);
                }
            }
            requestAnimationFrame(syncLoop);
        }
        requestAnimationFrame(syncLoop);

        // --- DRAG / TOUCH FOR LYRICS ---
        function getCurrentTransformY() {
            const MatrixCtor = window.DOMMatrix || window.WebKitCSSMatrix;
            const matrix = new MatrixCtor(window.getComputedStyle(scroller).transform);
            return matrix.m42 || container.offsetHeight / 2;
        }

        function startDrag(clientY) {
            if (!lyrics.length) return;
            isDragging = true;
            dragStartY = clientY;
            dragStartTransformY = getCurrentTransformY();
            totalDragDistance = 0;
            scroller.style.transition = 'none';
        }

        function moveDrag(clientY) {
            if (!isDragging || !lyrics.length) return;
            const deltaY = clientY - dragStartY;
            totalDragDistance += Math.abs(deltaY);

            if (totalDragDistance > 5) {
                isAutoScrollLocked = true;
                resumeSyncBtn.classList.remove('hidden');
            }

            const lines = document.querySelectorAll('.lyric-line');
            if (lines.length > 0) {
                const containerH = container.offsetHeight;
                const firstLine = lines[0];
                const lastLine = lines[lines.length - 1];

                const maxY = containerH / 2 - (firstLine.offsetTop + firstLine.offsetHeight / 2);
                const minY = containerH / 2 - (lastLine.offsetTop + lastLine.offsetHeight / 2);

                const targetY = dragStartTransformY + deltaY;
                const clampedY = Math.max(minY, Math.min(maxY, targetY));

                scroller.style.transform = `translateY(${clampedY}px)`;
            }
        }

        function endDrag() {
            if (!isDragging) return;
            isDragging = false;
            scroller.style.transition = 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)';
        }

        container.addEventListener('mousedown', e => startDrag(e.clientY));
        window.addEventListener('mousemove', e => { if (isDragging) moveDrag(e.clientY); });
        window.addEventListener('mouseup', endDrag);

        container.addEventListener('touchstart', e => { 
            if (e.touches.length === 1) startDrag(e.touches[0].clientY); 
        }, { passive: true });
        container.addEventListener('touchmove', e => { if (e.touches.length === 1) moveDrag(e.touches[0].clientY); }, { passive: true });
        container.addEventListener('touchend', endDrag);

        function resumeAutoSync() {
            isAutoScrollLocked = false;
            resumeSyncBtn.classList.add('hidden');
            updateScroll(activeIndex, true);
        }
        resumeSyncBtn.onclick = resumeAutoSync;

        // --- MUSIC LIBRARY RENDERER, SEARCH & TRACK SELECTOR ---
        const playlistContainer = document.getElementById('playlist-container');
        const searchInput = document.getElementById('library-search-input');
        const clearSearchBtn = document.getElementById('btn-clear-library-search');

        window.renderLibraryPlaylist = renderLibraryPlaylist;
        function renderLibraryPlaylist() {
            playlistContainer.innerHTML = '';
            const playlist = window.PLAYLIST_DATA || [];

            const filtered = playlist.filter(song => {
                const query = searchQuery.toLowerCase().trim();
                if (!query) return true;
                return song.title.toLowerCase().includes(query) || song.artist.toLowerCase().includes(query);
            });

            const countBadge = document.getElementById('library-track-count');
            if (countBadge) {
                if (searchQuery.trim()) {
                    countBadge.innerText = `${filtered.length} of ${playlist.length}`;
                } else {
                    countBadge.innerText = `${playlist.length} ${playlist.length === 1 ? 'track' : 'tracks'}`;
                }
            }

            if (filtered.length === 0) {
                playlistContainer.innerHTML = `
                    <div class="text-center py-8 text-slate-400">
                        <i class="fa-solid fa-magnifying-glass text-2xl mb-2 opacity-50 block"></i>
                        <p class="text-xs font-semibold">No tracks found matching "${escapeHTML(searchQuery)}"</p>
                    </div>
                `;
                return;
            }

            filtered.forEach((song, index) => {
                const isSelected = song.id === activeSongId;
                const isPlaying = isSelected && !audio.paused;
                const card = document.createElement('div');
                card.dataset.songId = song.id;
                card.className = `library-track-card p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                        ? 'is-active text-white'
                        : 'bg-white/5 border-white/5 hover:bg-white/10 text-slate-200'
                }`;

                const activeIconHtml = `
                    <div class="equalizer-icon ${isPlaying ? '' : 'paused'}">
                        <span class="equalizer-bar"></span>
                        <span class="equalizer-bar"></span>
                        <span class="equalizer-bar"></span>
                    </div>
                `;

                const avatarStyle = isSelected
                    ? `background-color: rgba(var(--m3-primary-rgb), 0.18); border-color: rgba(var(--m3-primary-rgb), 0.4); color: var(--m3-primary);`
                    : '';

                card.innerHTML = `
                    <div class="flex items-center gap-3 min-w-0">
                        <div class="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center shrink-0 ${isSelected ? '' : 'text-slate-400'}" style="${avatarStyle}">
                            ${isSelected ? activeIconHtml : `<span class="library-track-index text-[10px] font-mono font-bold">${String(index + 1).padStart(2, '0')}</span>`}
                        </div>
                        <div class="min-w-0">
                            <div class="flex items-center gap-1.5 min-w-0">
                                <h4 class="text-xs md:text-sm font-bold truncate ${isSelected ? '' : 'text-slate-100'}" style="${isSelected ? 'color: var(--m3-primary);' : ''}">${escapeHTML(song.title)}</h4>
                                ${isSelected ? `<span class="shrink-0 text-[8px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-full" style="background-color: rgba(var(--m3-primary-rgb), 0.2); color: var(--m3-primary);">${isPlaying ? 'Playing' : 'Paused'}</span>` : ''}
                            </div>
                            <p class="text-[10px] md:text-xs text-slate-400 truncate">${escapeHTML(song.artist)}</p>
                        </div>
                    </div>
                    <button class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs shadow ${isSelected ? '' : 'bg-white/10 text-slate-200'}" style="${isSelected ? 'background-color: var(--m3-primary); color: #0a0d14;' : ''}">
                        <i class="fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'}"></i>
                    </button>
                `;

                card.onclick = () => loadTrackFromLibrary(song);
                playlistContainer.appendChild(card);
            });
        }

        window.scrollToActiveTrack = function() {
            requestAnimationFrame(() => {
                setTimeout(() => {
                    if (!activeSongId) return;
                    const activeCard = playlistContainer.querySelector(`[data-song-id="${activeSongId}"]`);
                    if (activeCard) {
                        activeCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, 450);
            });
        };

        searchInput.oninput = (e) => {
            searchQuery = e.target.value;
            if (searchQuery) {
                clearSearchBtn.classList.remove('hidden');
            } else {
                clearSearchBtn.classList.add('hidden');
            }
            renderLibraryPlaylist();
        };

        clearSearchBtn.onclick = () => {
            searchInput.value = '';
            searchQuery = '';
            clearSearchBtn.classList.add('hidden');
            renderLibraryPlaylist();
        };

                async function loadTrackFromLibrary(song, options = {}) {
            const { autoplay = true, resumeTime = null, keepPendingLocalFile = false } = options;

            // Explicitly choosing a library track cancels any staged (not-yet-applied) local
            // file. An automatic advance (song ended, playlist moves on) passes
            // keepPendingLocalFile so the user's pending selection survives until they
            // either apply it or pick a track themselves.
            if (pendingLocalAudioFile && !keepPendingLocalFile) {
                pendingLocalAudioFile = null;
                const lblAudioReset = document.getElementById('lbl-audio-name');
                if (lblAudioReset) lblAudioReset.innerText = 'Choose Local MP3 / WAV Track';
                const dtLblAudioReset = document.getElementById('dt-lbl-audio-name');
                if (dtLblAudioReset) dtLblAudioReset.innerText = 'Open Audio MP3';
            }

            const coverImg = document.getElementById('desktop-cover-img');
            if (coverImg) {
                delete coverImg.dataset.fallback;
                if (song.coverUrl) {
                    coverImg.src = song.coverUrl;
                } else if (song.cover) {
                    coverImg.src = song.cover;
                } else {
                    coverImg.src = 'Data/covers/default-cover.jpg';
                }
            }

            if (song.id === activeSongId) {
                if (audio.paused) {
                    await triggerPlay();
                } else {
                    audio.pause();
                }
                closeSheet(document.getElementById('library-sheet'));
                return;
            }

            activeSongId = song.id;

            onlineTrackTitle = song.title;
            onlineArtistName = song.artist;
            fileTrackTitle = '';
            fileArtistName = '';
            updateHeaderTitle();

            await setAudioSource(song.audioUrl);

            if (songInput) songInput.value = song.title;
            if (artistInput) artistInput.value = song.artist;

            if (song.lrcText) {
                const rawInput = document.getElementById('raw-lrc-input');
                if (rawInput) rawInput.value = song.lrcText;
                parseLRC(song.lrcText);
            } else {
                executeOnlineSync(true);
            }

            renderLibraryPlaylist();
            saveLastTrackState();

            if (resumeTime && resumeTime > 0) {
                seekAudioTo(resumeTime);
            }

            if (!autoplay) return;

            closeSheet(document.getElementById('library-sheet'));
            resumeAutoSync();
            await triggerPlay();
        }


        // --- AUTO ONLINE SYNCED LRC FINDER ENGINE ---
        const songInput = document.getElementById('online-song-input');
        const artistInput = document.getElementById('online-artist-input');
        const fetchOnlineBtn = document.getElementById('btn-fetch-online-lrc');
        const fetchStatus = document.getElementById('online-fetch-status');

        async function executeOnlineSync(silent = false) {
            const song = songInput.value.trim();
            const artist = artistInput.value.trim();

            if (!song) {
                if (!silent) {
                    fetchStatus.className = 'text-[10px] font-semibold text-red-400 block';
                    fetchStatus.innerText = '✕ Please enter a song title to search online.';
                }
                return;
            }

            fetchStatus.className = 'text-[10px] font-semibold text-sky-400 block';
            fetchStatus.innerHTML = `<i class="fa-solid fa-spinner animate-spin mr-1"></i> Searching LRCLIB database for "${escapeHTML(song)}"...`;

            try {
                let url = `https://lrclib.net/api/search?track_name=${encodeURIComponent(song)}`;
                if (artist) url += `&artist_name=${encodeURIComponent(artist)}`;

                let res = await fetch(url);
                let data = await res.json();

                if (!data || data.length === 0) {
                    res = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(song + ' ' + artist)}`);
                    data = await res.json();
                }

                if (data && data.length > 0) {
                    let match = data.find(item => item.syncedLyrics) || data[0];
                    let lrcText = match.syncedLyrics || match.plainLyrics;

                    if (lrcText) {
                        document.getElementById('raw-lrc-input').value = lrcText;
                        parseLRC(lrcText);

                        onlineTrackTitle = match.trackName;
                        onlineArtistName = match.artistName || 'Unknown Artist';
                        updateHeaderTitle();

                        document.getElementById('lbl-lrc-name').innerText = "✓ Online Synced: " + match.trackName;

                        fetchStatus.className = 'text-[10px] font-semibold text-emerald-400 block';
                        fetchStatus.innerText = `✓ Synced LRC Loaded for "${match.trackName}"!`;
                        resumeAutoSync();
                    } else {
                        throw new Error("Found track but no synced timestamps available.");
                    }
                } else {
                    throw new Error("No lyrics found online for this track.");
                }
            } catch (err) {
                fetchStatus.className = 'text-[10px] font-semibold text-red-400 block';
                fetchStatus.innerText = `✕ ${err.message || "Failed to fetch online lyrics."}`;
            }
        }

        fetchOnlineBtn.onclick = () => executeOnlineSync(false);

        // --- PLAYER CONTROLS ---
        async function triggerPlay() {
            if (audio.src) {
                try {
                    await setupAudioContext();
                    if (audioCtx && audioCtx.state === 'suspended') await audioCtx.resume();
                } catch (e) { console.log("AudioContext warning:", e); }
                try { await audio.play(); } catch (e) { console.log("Play error:", e); }
            }
        }

        const handlePlayPause = () => {
    if (!audio.src) {
        openSheet(document.getElementById('library-sheet'));
        return;
    }
    if (audio.paused) triggerPlay();
    else audio.pause();
};

btnPlayPause.onclick = handlePlayPause;
if (btnPlayPauseMob) btnPlayPauseMob.onclick = handlePlayPause;

        audio.onplay = () => {
    document.querySelectorAll('#play-icon, .play-icon-target').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('#pause-icon, .pause-icon-target').forEach(el => el.classList.remove('hidden'));
    
    
    document.querySelectorAll('#track-art-icon, .desktop-art-spin').forEach(el => {
        el.classList.add('playing');
    });

    renderLibraryPlaylist();
};

audio.onpause = () => {
    document.querySelectorAll('#play-icon, .play-icon-target').forEach(el => el.classList.remove('hidden'));
    document.querySelectorAll('#pause-icon, .pause-icon-target').forEach(el => el.classList.add('hidden'));
    
    document.querySelectorAll('#track-art-icon, .desktop-art-spin').forEach(el => {
        el.classList.remove('playing');
    });

    renderLibraryPlaylist();
    saveLastTrackState();
};

setInterval(() => {
    if (!audio.paused) saveLastTrackState();
}, 8000);

window.addEventListener('beforeunload', saveLastTrackState);




        audio.onloadedmetadata = () => {
            durTimeLbl.innerText = formatTime(audio.duration);
        };

        scrubber.addEventListener('pointerdown', () => { isScrubbing = true; });
        scrubber.addEventListener('mousedown', () => { isScrubbing = true; });
        scrubber.addEventListener('touchstart', () => { isScrubbing = true; }, { passive: true });

        const endScrub = () => { isScrubbing = false; };
        scrubber.addEventListener('pointerup', endScrub);
        scrubber.addEventListener('mouseup', endScrub);
        scrubber.addEventListener('touchend', endScrub);
        scrubber.addEventListener('change', endScrub);

        scrubber.oninput = e => {
            if (audio.duration && !isNaN(audio.duration)) {
                seekAudioTo((e.target.value / 100) * audio.duration);
                if (isAutoScrollLocked) resumeAutoSync();
            }
        };

        document.getElementById('btn-rewind').onclick = () => {
            const cur = audio.currentTime || 0;
            seekAudioTo(cur - 5);
        };
        document.getElementById('btn-forward').onclick = () => {
            const cur = audio.currentTime || 0;
            seekAudioTo(cur + 5);
        };

        const speedSlider = document.getElementById('speed-slider');
        speedSlider.oninput = e => {
            const val = parseFloat(e.target.value);
            audio.playbackRate = val;
            document.getElementById('speed-val').innerText = val.toFixed(2) + 'x';

            userSettings.playbackRate = val;
            saveSettings();
        };

        // --- KEYBOARD SHORTCUTS ---
        document.addEventListener('keydown', (e) => {
            const tag = document.activeElement ? document.activeElement.tagName : '';
            const isTyping = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' ||
                (document.activeElement && document.activeElement.isContentEditable);
            if (isTyping) return;

            switch (e.code) {
                case 'Space':
                    e.preventDefault();
                    handlePlayPause();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    seekAudioTo((audio.currentTime || 0) + 5);
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    seekAudioTo((audio.currentTime || 0) - 5);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    if (typeof window.stepVolume === 'function') window.stepVolume(0.05);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    if (typeof window.stepVolume === 'function') window.stepVolume(-0.05);
                    break;
                case 'KeyM':
                    if (typeof window.toggleMute === 'function') window.toggleMute();
                    break;
                case 'KeyN':
                    playNextTrack();
                    break;
                case 'KeyP':
                    playPreviousTrack();
                    break;
                case 'KeyL':
                    toggleLoopMode();
                    break;
                case 'Escape':
                    document.querySelectorAll('.sheet-overlay.open').forEach(closeSheet);
                    document.querySelectorAll('.dialog-overlay.open').forEach(d => d.classList.remove('open'));
                    break;
            }
        });

        // --- EXPORT & COPY LRC TOOL ---
        document.getElementById('btn-export-lrc').onclick = () => {
            const content = document.getElementById('raw-lrc-input').value;
            if (!content) return;
            const blob = new Blob([content], { type: 'text/plain' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = ((onlineTrackTitle || fileTrackTitle) || 'lyrics') + '.lrc';
            a.click();
        };

        document.getElementById('btn-copy-lrc').onclick = () => {
            const content = document.getElementById('raw-lrc-input').value;
            if (content) {
                const txt = document.createElement('textarea');
                txt.value = content;
                document.body.appendChild(txt);
                txt.select();
                document.execCommand('copy');
                document.body.removeChild(txt);
            }
        };

        // --- DSP EQUALIZER PRESETS ---
        const EQ_PRESET_MAP = {
            flat: [0, 0, 0, 0, 0],
            bass: [7, 5, 1, 0, -1],
            vocal: [-2, 1, 6, 3, -1],
            treble: [-3, -1, 2, 5, 7],
            electronic: [5, 3, 0, 2, 5],
            rock: [4, 2, -1, 3, 5]
        };

                document.querySelectorAll('.eq-preset-btn').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.eq-preset-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const presetKey = btn.dataset.preset;
                const preset = EQ_PRESET_MAP[presetKey] || EQ_PRESET_MAP.flat;
                
                userSettings.eqPreset = presetKey;
                userSettings.eqBands = [...preset];
                saveSettings();

                preset.forEach((val, i) => {
                    if (eqBands[i]) eqBands[i].gain.value = val;
                    
                    const sliders = document.querySelectorAll(`.eq-band[data-band="${i}"], .dt-eq-band[data-band="${i}"]`);
                    sliders.forEach(slider => { if (slider) slider.value = val; });
                });
            };
        });


                document.querySelectorAll('.eq-band, .dt-eq-band').forEach(slider => {
            slider.oninput = e => {
                const idx = parseInt(e.target.dataset.band, 10);
                const val = parseFloat(e.target.value);
                if (eqBands[idx]) eqBands[idx].gain.value = val;
                
                userSettings.eqBands[idx] = val;
                userSettings.eqPreset = 'custom';
                document.querySelectorAll('.eq-preset-btn').forEach(b => b.classList.remove('active'));
                
                const matchingSliders = document.querySelectorAll(`.eq-band[data-band="${idx}"], .dt-eq-band[data-band="${idx}"]`);
                matchingSliders.forEach(s => { if (s !== e.target) s.value = val; });

                saveSettings();
            };
        });


        // --- SLEEP MODE & LIVE COUNTDOWN ENGINE ---
        const homeSleepBadge = document.getElementById('sleep-countdown-badge');
        const homeSleepText = document.getElementById('sleep-countdown-text');
        const prefSleepCountdown = document.getElementById('pref-sleep-countdown');
        const prefSleepStatus = document.getElementById('pref-sleep-status');

        function startSleepTimer(minutes) {
            clearSleepTimer();
            const totalMs = minutes * 60 * 1000;
            sleepEndTime = Date.now() + totalMs;

            sleepTimerTimeout = setTimeout(() => {
                audio.pause();
                clearSleepTimer();
                prefSleepStatus.innerText = "Sleep timer expired. Playback stopped.";
            }, totalMs);

            updateSleepCountdown();
            sleepIntervalId = setInterval(updateSleepCountdown, 1000);
        }

        function updateSleepCountdown() {
            if (!sleepEndTime) return;
            const remaining = Math.max(0, Math.ceil((sleepEndTime - Date.now()) / 1000));

            if (remaining <= 0) {
                clearSleepTimer();
                return;
            }

            const formatted = formatTime(remaining);
            homeSleepText.innerText = formatted;
            homeSleepBadge.classList.remove('hidden');

            prefSleepCountdown.innerText = formatted;
            prefSleepCountdown.classList.remove('hidden');
            prefSleepStatus.innerText = `Active sleep timer expiring in ${formatted}`;
        }

        function clearSleepTimer() {
            if (sleepTimerTimeout) clearTimeout(sleepTimerTimeout);
            if (sleepIntervalId) clearInterval(sleepIntervalId);
            sleepEndTime = null;
            sleepTimerTimeout = null;
            sleepIntervalId = null;

            homeSleepBadge.classList.add('hidden');
            prefSleepCountdown.classList.add('hidden');
            prefSleepStatus.innerText = "Automatically pauses playback when expired";
        }

        document.querySelectorAll('.sleep-btn').forEach(btn => {
            btn.onclick = () => {
                const mins = parseInt(btn.dataset.time, 10);
                startSleepTimer(mins);
            };
        });

        document.getElementById('btn-set-custom-sleep').onclick = () => {
            const input = document.getElementById('custom-sleep-min');
            const mins = parseInt(input.value, 10);
            if (!isNaN(mins) && mins > 0) {
                startSleepTimer(mins);
                input.value = '';
            }
        };

        document.getElementById('btn-cancel-sleep').onclick = clearSleepTimer;

        // --- FILE INPUTS & SMART AUTO-FILL ---
        // Selecting a local file STAGES it (shows the name), pre-fills the Online LRC
        // Search fields from the filename, and immediately auto-fetches matching lyrics
        // from LRCLIB. The audio itself is only actually loaded/switched to and
        // auto-played once the user taps an Apply button (mobile "Apply & Done" or the
        // desktop "Apply & Auto-Play" button), via loadPendingLocalFile() below — so a
        // currently playing library track is not interrupted just by selecting a file.
        document.getElementById('audio-file-input').onchange = e => {
            const file = e.target.files[0];
            if (file) {
                pendingLocalAudioFile = file;

                const lblAudio = document.getElementById('lbl-audio-name');
                if (lblAudio) lblAudio.innerText = file.name;

                const dtLblAudio = document.getElementById('dt-lbl-audio-name');
                if (dtLblAudio) dtLblAudio.innerText = file.name;

                // Pre-fill the Online LRC Search fields (mobile modal + desktop sidebar)
                // from the filename, then auto-fetch matching lyrics right away.
                const rawName = file.name.replace(/\.[^/.]+$/, "");
                let guessedArtist = '';
                let guessedTitle = rawName;
                if (rawName.includes('-')) {
                    const parts = rawName.split('-');
                    guessedArtist = parts[0].trim();
                    guessedTitle = parts.slice(1).join('-').trim();
                }

                if (songInput) songInput.value = guessedTitle;
                if (artistInput) artistInput.value = guessedArtist;

                const dtSongInputEl = document.getElementById('dt-online-song-input');
                const dtArtistInputEl = document.getElementById('dt-online-artist-input');
                if (dtSongInputEl) dtSongInputEl.value = guessedTitle;
                if (dtArtistInputEl) dtArtistInputEl.value = guessedArtist;

                // Clear any lyrics/title left over from a previously staged (but un-applied)
                // file selection, so a failed fetch here doesn't leak stale data into Apply.
                onlineTrackTitle = '';
                onlineArtistName = '';
                const rawLrcInputEl = document.getElementById('raw-lrc-input');
                if (rawLrcInputEl) rawLrcInputEl.value = '';

                executeOnlineSync(true);
            }

            // Reset so selecting the SAME file again still fires the 'change' event
            e.target.value = '';
        };

        // Actually loads the staged local file into the player: sets it as the active
        // source and resets the cover to default. Lyrics were already auto-fetched (and
        // the header/search fields already updated) at selection time, so this just
        // re-parses whatever LRC is currently staged rather than fetching again.
        async function loadPendingLocalFile() {
            const file = pendingLocalAudioFile;
            if (!file) return false;

            activeSongId = 'custom-file';
            await setAudioSource(file);

            // Local files never carry cover art metadata, so always fall back to the default cover
            const coverImg = document.getElementById('desktop-cover-img');
            if (coverImg) {
                delete coverImg.dataset.fallback;
                coverImg.src = 'Data/covers/default-cover.jpg';
            }

            // Fallback title/artist guessed from the filename — only used by updateHeaderTitle()
            // if the online auto-fetch (triggered at selection time) didn't find a match.
            const rawName = file.name.replace(/\.[^/.]+$/, "");
            if (rawName.includes('-')) {
                const parts = rawName.split('-');
                fileArtistName = parts[0].trim();
                fileTrackTitle = parts.slice(1).join('-').trim();
            } else {
                fileTrackTitle = rawName;
                fileArtistName = '';
            }

            updateHeaderTitle();
            renderLibraryPlaylist();

            // Reuse the lyrics already fetched at selection time instead of fetching again;
            // only hit LRCLIB now if that earlier auto-fetch didn't find anything.
            const rawLrcVal = document.getElementById('raw-lrc-input').value;
            if (rawLrcVal && rawLrcVal.trim()) {
                parseLRC(rawLrcVal);
            } else {
                executeOnlineSync(true);
            }

            resumeAutoSync();

            pendingLocalAudioFile = null;
            return true;
        }


        document.getElementById('lrc-file-input').onchange = e => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = ev => {
                    const text = ev.target.result;
                    document.getElementById('raw-lrc-input').value = text;
                    parseLRC(text);
                    resumeAutoSync();
                };
                reader.readAsText(file);
                document.getElementById('lbl-lrc-name').innerText = file.name;
            }
        };

        document.getElementById('btn-clear-lyrics').onclick = () => {
            document.getElementById('raw-lrc-input').value = '';
            parseLRC('');
            resumeAutoSync();
        };

        document.getElementById('btn-load-demo').onclick = () => {
            if (window.PLAYLIST_DATA && window.PLAYLIST_DATA.length > 0) {
                loadTrackFromLibrary(window.PLAYLIST_DATA[0]);
            }
            closeSheet(document.getElementById('studio-sheet'));
        };

        // --- PREFERENCES & THEMES ---
        document.querySelectorAll('#theme-picker button').forEach(btn => {
            btn.onclick = () => {
                userSettings.themeColor = btn.dataset.color;
                userSettings.themeRgb = btn.dataset.rgb;
                userSettings.themeName = btn.dataset.name;
                saveSettings();

                document.documentElement.style.setProperty('--m3-primary', userSettings.themeColor);
                document.documentElement.style.setProperty('--m3-primary-rgb', userSettings.themeRgb);
                document.getElementById('theme-tag').innerText = userSettings.themeName;
                document.getElementById('theme-tag').style.color = userSettings.themeColor;

                document.querySelectorAll('#theme-picker .theme-swatch').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');

                updateLoopModeUI();
            };
        });

        document.querySelectorAll('.viz-style-chip').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.viz-style-chip').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                userSettings.visualizerMode = btn.dataset.style;
                saveSettings();
                updateBarVizVisibility();
            };
        });

        const FONT_SCALE_MIN = 0.7;
        const FONT_SCALE_MAX = 1.8;
        const FONT_SCALE_STEP = 0.05;
        const FONT_SCALE_DEFAULT = 1.0;

        function applyFontScale(val) {
            val = Math.min(FONT_SCALE_MAX, Math.max(FONT_SCALE_MIN, val));
            val = Math.round(val * 100) / 100;

            userSettings.fontScale = val;
            saveSettings();

            document.documentElement.style.setProperty('--font-scale', val);

            const formattedLbl = val.toFixed(1) + 'x';
            const fontLbl = document.getElementById('font-scale-lbl');
            const dtFontLbl = document.getElementById('dt-font-scale-lbl');
            if (fontLbl) fontLbl.innerText = formattedLbl;
            if (dtFontLbl) dtFontLbl.innerText = formattedLbl;

            let frames = 0;
            const keepCentered = () => {
                updateScroll(activeIndex, true);
                if (++frames < 12) {
                    requestAnimationFrame(keepCentered);
                }
            };
            requestAnimationFrame(keepCentered);
        }

        const btnFontScaleMinus = document.getElementById('btn-font-scale-minus');
        const btnFontScalePlus = document.getElementById('btn-font-scale-plus');
        const btnFontScaleReset = document.getElementById('btn-font-scale-reset');

        if (btnFontScaleMinus) btnFontScaleMinus.onclick = () => applyFontScale(userSettings.fontScale - FONT_SCALE_STEP);
        if (btnFontScalePlus) btnFontScalePlus.onclick = () => applyFontScale(userSettings.fontScale + FONT_SCALE_STEP);
        if (btnFontScaleReset) btnFontScaleReset.onclick = () => applyFontScale(FONT_SCALE_DEFAULT);




        document.getElementById('btn-offset-plus').onclick = () => adjustOffset(0.1);
        document.getElementById('btn-offset-minus').onclick = () => adjustOffset(-0.1);
        document.getElementById('btn-offset-reset').onclick = () => { 
            userSettings.timeOffset = 0.0; 
            saveSettings();
            updateOffsetUI(); 
        };

        function adjustOffset(v) { 
            userSettings.timeOffset += v; 
            saveSettings();
            updateOffsetUI(); 
        }

        function updateOffsetUI() {
            const offsetVal = userSettings.timeOffset;
            const formatted = (offsetVal >= 0 ? '+' : '') + offsetVal.toFixed(1) + 's';
            
            document.getElementById('offset-val-display').innerText = formatted;
            
            const offsetInd = document.getElementById('offset-indicator');
            if (offsetInd) offsetInd.innerText = formatted;

            const offsetIndDt = document.getElementById('offset-indicator-dt');
            if (offsetIndDt) offsetIndDt.innerText = formatted;

            const stageOffsetLbl = document.getElementById('stage-offset-lbl');
            if (stageOffsetLbl) stageOffsetLbl.innerText = formatted;

            const offsetTag = document.getElementById('offset-tag');
            if (offsetTag) {
                offsetTag.innerText = formatted;
                if (Math.abs(offsetVal) < 0.05) {
                    offsetTag.classList.add('hidden');
                } else {
                    offsetTag.classList.remove('hidden');
                }
            }
        }

        // --- RESET PREFERENCES DIALOG SYSTEM ---
        const resetDialog = document.getElementById('reset-dialog');
        document.getElementById('btn-open-reset-modal').onclick = () => resetDialog.classList.add('open');
        document.getElementById('btn-cancel-reset').onclick = () => resetDialog.classList.remove('open');

        document.getElementById('btn-confirm-reset').onclick = () => {
            localStorage.removeItem(STORAGE_KEY);
            userSettings = { ...DEFAULT_SETTINGS };
            applySettingsToUI();
            clearSleepTimer();
            resetDialog.classList.remove('open');
        };

        applySettingsToUI();
        renderLibraryPlaylist();

        // --- RESTORE LAST PLAYED TRACK ON RELOAD (loads track + position, no autoplay) ---
        (function restoreLastTrack() {
            const last = loadLastTrackState();
            if (!last || !last.id) return;
            const playlist = window.PLAYLIST_DATA || [];
            const track = playlist.find(s => s.id === last.id);
            if (track) {
                loadTrackFromLibrary(track, { autoplay: false, resumeTime: last.time });
            }
        })();

        // --- SHEET & TAB NAVIGATION ---
        document.getElementById('open-library-btn').onclick = () => openSheet(document.getElementById('library-sheet'));
        document.getElementById('open-studio-btn').onclick = () => openSheet(document.getElementById('studio-sheet'));

        document.getElementById('btn-apply-done').onclick = async () => {
            // Autoplay ONLY happens when a newly staged local file is actually loaded here.
            // If no new file was selected (pendingLocalAudioFile is empty), Apply must never
            // touch playback — whatever the user manually set (playing or paused) stays as-is,
            // whether the active track is a local file or a library track.
            if (pendingLocalAudioFile) {
                await loadPendingLocalFile();
                closeSheet(document.getElementById('studio-sheet'));
                await triggerPlay();
            } else {
                closeSheet(document.getElementById('studio-sheet'));
            }
        };

        // --- DESKTOP SIDEBAR: APPLY & AUTO-PLAY LOCAL FILE ---
        const dtApplyLocalBtn = document.getElementById('dt-btn-apply-local');
        if (dtApplyLocalBtn) {
            dtApplyLocalBtn.onclick = async () => {
                // Same rule as above: only a freshly staged file triggers autoplay.
                // Clicking Apply with no pending file (e.g. just tweaking sync offset while
                // the current local file is paused) must leave play/pause state untouched.
                if (pendingLocalAudioFile) {
                    await loadPendingLocalFile();
                    await triggerPlay();
                }
            };
        }

        document.querySelectorAll('.close-sheet-btn:not(#btn-apply-done)').forEach(btn => {
            btn.onclick = () => closeSheet(document.getElementById('studio-sheet'));
        });

        document.querySelectorAll('.close-library-btn').forEach(btn => {
            btn.onclick = () => closeSheet(document.getElementById('library-sheet'));
        });

        document.querySelectorAll('.sheet-overlay').forEach(sheet => {
            sheet.addEventListener('click', (e) => {
                if (e.target === sheet) {
                    closeSheet(sheet);
                }
            });
        });

        document.querySelectorAll('.dialog-overlay').forEach(dialog => {
            dialog.addEventListener('click', (e) => {
                if (e.target === dialog) {
                    dialog.classList.remove('open');
                }
            });
        });

        document.querySelectorAll('.m3-tab-pill[data-tab]').forEach(chip => {
            chip.onclick = () => switchTab(chip.dataset.tab);
        });

        function formatTime(s) {
            if (isNaN(s) || !isFinite(s)) return "00:00";
            const m = Math.floor(s / 60);
            const sec = Math.floor(s % 60);
            return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
        }