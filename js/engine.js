document.addEventListener('DOMContentLoaded', () => {
            const dtEqBands = document.querySelectorAll('.dt-eq-band');
            const mainEqBands = document.querySelectorAll('.eq-band');

            // 1. Right Sidebar EQ -> Studio EQ
            dtEqBands.forEach((dtBand) => {
                dtBand.addEventListener('input', (e) => {
                    const idx = e.target.getAttribute('data-band');
                    const val = e.target.value;
                    mainEqBands.forEach((mBand) => {
                        if (mBand.getAttribute('data-band') === idx) {
                            mBand.value = val;
                            mBand.dispatchEvent(new Event('input'));
                        }
                    });
                });
            });
        
const dtBtnEqFx = document.getElementById('dt-btn-eq-fx');
if (dtBtnEqFx) {
    dtBtnEqFx.addEventListener('click', () => {
        const studioSheet = document.getElementById('studio-sheet');
        if (studioSheet) openSheet(studioSheet);
        
        const fxPill = document.querySelector(
            '.m3-tab-pill[data-tab*="eq" i], ' +
            '.m3-tab-pill[data-tab*="fx" i], ' +
            '.m3-tab-pill[data-tab*="audio" i], ' +
            '.m3-tab-pill[data-tab*="dsp" i], ' +
            '.m3-tab-pill[data-tab*="sound" i]'
        );
        
        if (fxPill && fxPill.dataset.tab) {
            if (typeof switchTab === 'function') {
                switchTab(fxPill.dataset.tab);
            }
        } else {
            if (typeof switchTab === 'function') {
                switchTab('eq');
            }
        }
    });
}



const btnOffsetModals = document.querySelectorAll('#btn-offset-modal');
btnOffsetModals.forEach(btn => {
    btn.onclick = () => {
        const studioSheet = document.getElementById('studio-sheet');
        if (studioSheet) openSheet(studioSheet);
        
        let prefsTab = 'prefs';
        const prefPill = document.querySelector('.m3-tab-pill[data-tab="prefs"], .m3-tab-pill[data-tab="settings"], .m3-tab-pill[data-tab*="pref"]');
        if (prefPill && prefPill.dataset.tab) {
            prefsTab = prefPill.dataset.tab;
        }

        if (typeof switchTab === 'function') {
            switchTab(prefsTab);
        }

        requestAnimationFrame(() => {
            setTimeout(() => {
                const target = document.getElementById('offset-settings-container') || 
                               document.getElementById('offset-val-display') || 
                               document.querySelector('[id*="offset"]');
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 450);
        });
    };
});

// Quick Access Sleep Timer

const dtBtnSleep = document.getElementById('dt-btn-sleep-timer');
if (dtBtnSleep) {
    dtBtnSleep.addEventListener('click', () => {
        const studioSheet = document.getElementById('studio-sheet');
        if (studioSheet) openSheet(studioSheet);
        
        if (typeof switchTab === 'function') {
            switchTab('prefs');
        }

        requestAnimationFrame(() => {
            setTimeout(() => {
                const target = document.getElementById('pref-sleep-status') || 
                               document.querySelector('[id*="sleep"]');
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 400);
        });
    });
}


            // 2. Studio EQ / Reset -> Right Sidebar EQ
            mainEqBands.forEach((mBand) => {
                mBand.addEventListener('input', (e) => {
                    const idx = e.target.getAttribute('data-band');
                    const val = e.target.value;
                    dtEqBands.forEach((dtBand) => {
                        if (dtBand.getAttribute('data-band') === idx) {
                            dtBand.value = val;
                        }
                    });
                });
            });
        });

    <!-- DESKTOP ONLINE LRC SEARCH BRIDGE SCRIPT -->
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
    
    <!-- DESKTOP VOLUME & INTEGRATION ENHANCEMENT SCRIPT -->
     document.addEventListener('DOMContentLoaded', () => {
            const audioPlayer = document.getElementById('audio-player');
            const volumeSlider = document.getElementById('volume-slider');
            const btnMute = document.getElementById('btn-mute');
            const btnMuteMobile = document.getElementById('btn-mute-mobile');
            const volIcon = document.getElementById('vol-icon');
            const volIconMobile = document.getElementById('vol-icon-mobile');
            let lastVol = 1;

            // Volume Control Sync
            if (volumeSlider && audioPlayer) {
                volumeSlider.addEventListener('input', (e) => {
                    const val = parseFloat(e.target.value);
                    audioPlayer.volume = val;
                    updateVolIcon(val);
                });
            }

            const toggleMute = () => {
                if (audioPlayer.volume > 0) {
                    lastVol = audioPlayer.volume;
                    audioPlayer.volume = 0;
                    if (volumeSlider) volumeSlider.value = 0;
                    updateVolIcon(0);
                } else {
                    audioPlayer.volume = lastVol || 1;
                    if (volumeSlider) volumeSlider.value = audioPlayer.volume;
                    updateVolIcon(audioPlayer.volume);
                }
            };

            if (btnMute && audioPlayer) btnMute.addEventListener('click', toggleMute);
            if (btnMuteMobile && audioPlayer) btnMuteMobile.addEventListener('click', toggleMute);

            function updateVolIcon(val) {
                [volIcon, volIconMobile].forEach(icon => {
                    if (!icon) return;
                    icon.className = '';
                    if (val === 0) {
                        icon.className = 'fa-solid fa-volume-xmark text-slate-500';
                    } else if (val < 0.5) {
                        icon.className = 'fa-solid fa-volume-low text-sky-400 text-xs';
                    } else {
                        icon.className = 'fa-solid fa-volume-high text-sky-400 text-xs';
                    }
                });
            }

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

                       // Desktop Font Scale Shortcuts (Clean Trigger)
            const dtFontUp = document.getElementById('dt-font-up');
            const dtFontDown = document.getElementById('dt-font-down');
            const fontSlider = document.getElementById('font-scale-slider');

            if (dtFontUp && fontSlider) {
                dtFontUp.addEventListener('click', () => {
                    let current = parseFloat(fontSlider.value);
                    if (current < 1.8) {
                        fontSlider.value = Math.min(1.8, current + 0.1).toFixed(2);
                        fontSlider.dispatchEvent(new Event('input'));
                    }
                });
            }
            if (dtFontDown && fontSlider) {
                dtFontDown.addEventListener('click', () => {
                    let current = parseFloat(fontSlider.value);
                    if (current > 0.7) {
                        fontSlider.value = Math.max(0.7, current - 0.1).toFixed(2);
                        fontSlider.dispatchEvent(new Event('input'));
                    }
                });
            }


            // Sync Desktop Right Sidebar Finder & EQ to Main Inputs
            const dtSong = document.getElementById('dt-online-song');
            const dtArtistInput = document.getElementById('dt-online-artist');
            const dtBtnFetch = document.getElementById('dt-btn-fetch');

            const mainSong = document.getElementById('online-song-input');
            const mainArtistInput = document.getElementById('online-artist-input');
            const mainBtnFetch = document.getElementById('btn-fetch-online-lrc');

            if (dtBtnFetch && mainBtnFetch) {
                dtBtnFetch.addEventListener('click', () => {
                    if (dtSong && mainSong) mainSong.value = dtSong.value;
                    if (dtArtistInput && mainArtistInput) mainArtistInput.value = dtArtistInput.value;
                    mainBtnFetch.click();
                });
            }

            // Sync Desktop EQ Bands
            const dtEqBands = document.querySelectorAll('.dt-eq-band');
            const mainEqBands = document.querySelectorAll('.eq-band');

            dtEqBands.forEach((dtBand) => {
                dtBand.addEventListener('input', (e) => {
                    const idx = e.target.getAttribute('data-band');
                    const val = e.target.value;
                    mainEqBands.forEach((mBand) => {
                        if (mBand.getAttribute('data-band') === idx) {
                            mBand.value = val;
                            mBand.dispatchEvent(new Event('input'));
                        }
                    });
                });
            });
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
            playbackMode: 'off'
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

        let searchQuery = '';
        let isFirstTimeLoaded = false;

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

            isFirstTimeLoaded = true;
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
                loadTrackFromLibrary(nextTrack);
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

            document.documentElement.style.setProperty('--font-scale', userSettings.fontScale);
            document.getElementById('font-scale-slider').value = userSettings.fontScale;
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
        window.onresize = () => { initCanvas(); updateScroll(activeIndex); };
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
                if (audio.duration && !isNaN(audio.duration)) {
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
            const matrix = new WebKitCSSMatrix(window.getComputedStyle(scroller).transform);
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

        function renderLibraryPlaylist() {
            playlistContainer.innerHTML = '';
            const playlist = window.PLAYLIST_DATA || [];

            const filtered = playlist.filter(song => {
                const query = searchQuery.toLowerCase().trim();
                if (!query) return true;
                return song.title.toLowerCase().includes(query) || song.artist.toLowerCase().includes(query);
            });

            if (filtered.length === 0) {
                playlistContainer.innerHTML = `
                    <div class="text-center py-8 text-slate-400">
                        <i class="fa-solid fa-magnifying-glass text-2xl mb-2 opacity-50 block"></i>
                        <p class="text-xs font-semibold">No tracks found matching "${searchQuery}"</p>
                    </div>
                `;
                return;
            }

            filtered.forEach((song) => {
                const isSelected = song.id === activeSongId;
                const isPlaying = isSelected && !audio.paused;
                const card = document.createElement('div');
                card.className = `p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected 
                        ? 'bg-sky-500/10 border-sky-500/40 text-sky-300' 
                        : 'bg-white/5 border-white/5 hover:bg-white/10 text-slate-200'
                }`;

                const activeIconHtml = `
                    <div class="equalizer-icon ${isPlaying ? '' : 'paused'}">
                        <span class="equalizer-bar"></span>
                        <span class="equalizer-bar"></span>
                        <span class="equalizer-bar"></span>
                    </div>
                `;

                card.innerHTML = `
                    <div class="flex items-center gap-3 min-w-0">
                        <div class="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center shrink-0 ${isSelected ? 'text-sky-400' : 'text-slate-400'}">
                            ${isSelected ? activeIconHtml : '<i class="fa-solid fa-music text-sm"></i>'}
                        </div>
                        <div class="min-w-0">
                            <h4 class="text-xs md:text-sm font-bold truncate">${song.title}</h4>
                            <p class="text-[10px] md:text-xs text-slate-400 truncate">${song.artist}</p>
                        </div>
                    </div>
                    <button class="w-8 h-8 rounded-full ${isSelected ? 'bg-sky-500 text-slate-950' : 'bg-white/10 text-slate-200'} flex items-center justify-center shrink-0 text-xs shadow">
                        <i class="fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'}"></i>
                    </button>
                `;

                card.onclick = () => loadTrackFromLibrary(song);
                playlistContainer.appendChild(card);
            });
        }

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

                async function loadTrackFromLibrary(song) {
            // ১. ডেক্সটপ ডিস্কের কভার ইমেজ আপডেট
            const coverImg = document.getElementById('desktop-cover-img');
            if (coverImg) {
                if (song.coverUrl) {
                    coverImg.src = song.coverUrl;
                } else if (song.cover) {
                    coverImg.src = song.cover;
                } else {
                    coverImg.src = 'Data/img/default-cover.jpg';
                }
            }

            // ২. একই গানে প্লে/পজ টগল করা
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
            fetchStatus.innerHTML = `<i class="fa-solid fa-spinner animate-spin mr-1"></i> Searching LRCLIB database for "${song}"...`;

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
};




        audio.onloadedmetadata = () => {
            durTimeLbl.innerText = formatTime(audio.duration);
        };

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
        };


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
        document.getElementById('audio-file-input').onchange = async e => {
    const file = e.target.files[0];
    if (file) {
        activeSongId = 'custom-file';
        await setAudioSource(file);
        const rawName = file.name.replace(/\.[^/.]+$/, "");
        
        if (rawName.includes('-')) {
            const parts = rawName.split('-');
            fileArtistName = parts[0].trim();
            fileTrackTitle = parts.slice(1).join('-').trim();
            artistInput.value = fileArtistName;
            songInput.value = fileTrackTitle;
        } else {
            fileTrackTitle = rawName;
            fileArtistName = '';
            songInput.value = rawName;
            artistInput.value = '';
        }

        onlineTrackTitle = '';
        onlineArtistName = '';
        updateHeaderTitle();
        const lblAudio = document.getElementById('lbl-audio-name');
        if (lblAudio) lblAudio.innerText = file.name;

        renderLibraryPlaylist();
        executeOnlineSync(true);
        resumeAutoSync();
        await triggerPlay(); 
    }
};


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
                updateLoopModeUI();
            };
        });

        document.querySelectorAll('.viz-style-chip').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.viz-style-chip').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                userSettings.visualizerMode = btn.dataset.style;
                saveSettings();
            };
        });

                const fontScaleSlider = document.getElementById('font-scale-slider');
        if (fontScaleSlider) {
            fontScaleSlider.oninput = e => {
                const val = parseFloat(e.target.value);
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
            };
        }



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

        // --- SHEET & TAB NAVIGATION ---
        document.getElementById('open-library-btn').onclick = () => openSheet(document.getElementById('library-sheet'));
        document.getElementById('open-studio-btn').onclick = () => openSheet(document.getElementById('studio-sheet'));

        document.getElementById('btn-apply-done').onclick = () => {
            closeSheet(document.getElementById('studio-sheet'));
            if (isFirstTimeLoaded) {
                triggerPlay();
                isFirstTimeLoaded = false;
            }
        };

        document.querySelectorAll('.close-sheet-btn:not(#btn-apply-done)').forEach(btn => {
            btn.onclick = () => closeSheet(document.getElementById('studio-sheet'));
        });

        document.querySelectorAll('.close-library-btn').forEach(btn => {
            btn.onclick = () => closeSheet(document.getElementById('library-sheet'));
        });

        function openSheet(sheet) { sheet.classList.add('open'); }
        function closeSheet(sheet) { sheet.classList.remove('open'); }

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

        function switchTab(tabId) {
            document.querySelectorAll('.m3-tab-pill[data-tab]').forEach(chip => {
                if (chip.dataset.tab === tabId) chip.classList.add('active');
                else chip.classList.remove('active');
            });
            document.querySelectorAll('.tab-pane').forEach(pane => {
                if (pane.id === tabId) pane.classList.remove('hidden');
                else pane.classList.add('hidden');
            });
        }

        document.querySelectorAll('.m3-tab-pill[data-tab]').forEach(chip => {
            chip.onclick = () => switchTab(chip.dataset.tab);
        });

        function formatTime(s) {
            if (isNaN(s) || !isFinite(s)) return "00:00";
            const m = Math.floor(s / 60);
            const sec = Math.floor(s % 60);
            return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
        }