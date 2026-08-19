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

            const modalSongInput = document.getElementById('online-song-input');
            const modalArtistInput = document.getElementById('online-artist-input');
            const modalFetchBtn = document.getElementById('btn-fetch-online-lrc');

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

            // Status message mirroring is handled directly by setFetchStatusUI() inside
            // executeOnlineSync() (writes to both #online-fetch-status and
            // #dt-online-fetch-status together), so no observer is needed here.
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

            // Desktop sidebar title/artist are now kept in sync directly inside
            // updateHeaderTitle() (single source of truth) instead of via a
            // MutationObserver here. The vinyl "playing" spin class is likewise applied
            // directly to both '#track-art-icon' and '.desktop-art-spin' together in
            // audio.onplay/onpause below, so no separate mirroring observer is needed.

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
            themeName: 'ADAPTIVE COVER',
            visualizerMode: 'circle',
            fontScale: 1.0,
            timeOffset: 0.0,
            eqPreset: 'flat',
            eqBands: [0, 0, 0, 0, 0],
            repeatMode: 'off',
            shuffleEnabled: false,
            volume: 1.0,
            muted: false,
            playbackRate: 1.0,
            crossfadeEnabled: false,
            crossfadeDuration: 4,
            autoThemeFromCover: true
        };

        // LOCALSTORAGE PERSISTENCE ENGINE
        const STORAGE_KEY = 'lyrics_flow_pro_prefs_v2';

        function loadSavedSettings() {
            try {
                const saved = localStorage.getItem(STORAGE_KEY);
                const parsed = saved ? JSON.parse(saved) : {};

                // Migrate the old combined playbackMode ('off'/'one'/'shuffle') into the
                // current independent repeatMode + shuffleEnabled fields, so prefs saved
                // before Shuffle and Repeat became separate toggles still carry over.
                if (parsed && parsed.playbackMode !== undefined && parsed.repeatMode === undefined) {
                    parsed.repeatMode = parsed.playbackMode === 'one' ? 'one' : 'off';
                    parsed.shuffleEnabled = parsed.playbackMode === 'shuffle';
                    delete parsed.playbackMode;
                }

                return { ...DEFAULT_SETTINGS, ...parsed };
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
                    time: audio.currentTime || 0,
                    savedAt: Date.now() // timestamp of this save, used to measure how long the app has been closed/backgrounded
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
        // --- Crossfade Buffer Element (secondary <audio> used only for smooth track transitions) ---
        const crossfadeAudio = document.getElementById('audio-player-crossfade');
        let crossfadeTriggered = false;
        // --- Waveform Scrubber Canvas ---
        const waveformCanvas = document.getElementById('waveform-canvas');
        const waveformCtx = waveformCanvas ? waveformCanvas.getContext('2d') : null;

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
                // সরাসরি স্ট্রিম হিসেবে সেট করা হচ্ছে যাতে ব্রাউজার নিজেই HTTP range
                // রিকোয়েস্ট দিয়ে সাথে সাথে বাফারিং শুরু করতে পারে। আগে এখানে ব্যাকগ্রাউন্ডে
                // পুরো ফাইলটা আবার fetch করে blob বানিয়ে চলতি অবস্থাতেই audio.src পাল্টে
                // দেওয়া হতো — এটাই গান চলাকালীন হঠাৎ "হিজিবিজি"/ক্লিক শব্দ এবং ধীরগতির
                // লোডিং-এর মূল কারণ ছিল (একই ফাইল দুইবার ডাউনলোড হতো, নেটওয়ার্ক ব্যান্ডউইথ
                // ভাগাভাগি হতো, আর মাঝপথে src বদলালে ব্রাউজারকে নতুন করে ডিকোড শুরু করতে হতো)।
                audio.src = source;
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

            // Reflect the new position in the time label / scrubber immediately, even
            // while paused — syncLoop() only updates them during active playback, so
            // without this a restored/seeked position wouldn't show live until Play is
            // pressed.
            const reflectInUI = () => {
                currTimeLbl.innerText = formatTime(audio.currentTime);
                if (!isScrubbing && audio.duration && !isNaN(audio.duration)) {
                    scrubber.value = (audio.currentTime / audio.duration) * 100;
                }
                updateMediaSessionPosition();
            };

            try {
                if (audio.readyState >= 1) {
                    audio.currentTime = validTime;
                    reflectInUI();
                } else {
                    const onLoaded = () => {
                        audio.currentTime = validTime;
                        reflectInUI();
                        audio.removeEventListener('loadedmetadata', onLoaded);
                    };
                    audio.addEventListener('loadedmetadata', onLoaded);
                }
            } catch (e) {
                console.warn("Seek error:", e);
            }
        }

        // --- ALWAYS DISPLAY ON (SCREEN WAKE LOCK) ---
        // Wake lock is only ever HELD when the toggle is on, the song is
        // actually playing, AND the lyrics are auto-flowing (not manually
        // scroll-locked by the user). If any one of those three stops being
        // true, the lock is released — the toggle stays on for next time.
        const wakeLockToggle = document.getElementById('wake-lock-toggle');

        async function requestWakeLock() {
            if ('wakeLock' in navigator && wakeLock === null) {
                try {
                    wakeLock = await navigator.wakeLock.request('screen');
                    // The OS/browser can release the sentinel on its own (tab backgrounded,
                    // app switched away, etc.) without going through releaseWakeLock().
                    // Without this listener, our `wakeLock` variable would stay pointing at
                    // a dead sentinel, so requestWakeLock() would think a lock is already
                    // held and skip re-acquiring it when the app comes back to the foreground.
                    wakeLock.addEventListener('release', () => {
                        wakeLock = null;
                    });
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

        // Central gatekeeper: call this any time playback state, lyric-flow
        // lock state, or the user's toggle changes.
        function shouldHoldWakeLock() {
            return userSettings.isWakeLockActive && !audio.paused && !isAutoScrollLocked;
        }

        async function updateWakeLockState() {
            if (shouldHoldWakeLock()) {
                await requestWakeLock();
            } else {
                await releaseWakeLock();
            }
        }

        wakeLockToggle.onchange = async (e) => {
            userSettings.isWakeLockActive = e.target.checked;
            saveSettings();
            await updateWakeLockState();
        };

        document.addEventListener('visibilitychange', async () => {
            if (document.visibilityState === 'visible') {
                await updateWakeLockState();
            }
            // Capture the "closed/backgrounded" timestamp reliably — on mobile, the app
            // going to background (home button, switching apps, actually closing) fires
            // this reliably, whereas 'beforeunload' often does not.
            if (document.visibilityState === 'hidden') {
                saveLastTrackState();
            }
        });

        updateWakeLockState();

        // --- PLAYBACK MODE TOGGLE ENGINE ---
        // Repeat (Off -> All -> One -> Off) and Shuffle (independent on/off) are two
        // separate controls so they can be combined freely, e.g. Shuffle + Repeat All.
        // Desktop repeat control (Off -> All -> One -> Off). Only touches the
        // -dt suffixed elements; the mobile row-3 button is a separate combined
        // Repeat/Shuffle control handled by updateMobileComboUI() below.
        function updateRepeatModeUI() {
    const btnDt = document.getElementById('btn-loop-mode-dt');
    const iconDt = document.getElementById('loop-mode-icon-dt');
    const textDt = document.getElementById('loop-mode-text-dt');

    if (btnDt) btnDt.classList.remove('active-mode');
    if (iconDt) iconDt.className = 'fa-solid fa-repeat text-sm';

    if (userSettings.repeatMode === 'one') {
        if (btnDt) btnDt.classList.add('active-mode');
        if (textDt) textDt.innerText = 'One';
    } else if (userSettings.repeatMode === 'all') {
        if (btnDt) btnDt.classList.add('active-mode');
        if (textDt) textDt.innerText = 'All';
    } else {
        if (textDt) textDt.innerText = 'Off';
    }
}

function updateShuffleUI() {
    const btnDt = document.getElementById('btn-shuffle-mode-dt');
    if (btnDt) btnDt.classList.toggle('active-mode', userSettings.shuffleEnabled);
}

const toggleRepeatMode = () => {
    if (userSettings.repeatMode === 'off') {
        userSettings.repeatMode = 'all';
    } else if (userSettings.repeatMode === 'all') {
        userSettings.repeatMode = 'one';
    } else {
        userSettings.repeatMode = 'off';
    }
    saveSettings();
    updateRepeatModeUI();
};

const toggleShuffle = () => {
    userSettings.shuffleEnabled = !userSettings.shuffleEnabled;
    saveSettings();
    updateShuffleUI();
};
window.toggleShuffle = toggleShuffle;

// --- MOBILE COMBINED REPEAT/SHUFFLE CONTROL (row 3, bottom-left) ---
// A single button that cycles Off -> Shuffle -> Repeat One -> Off, swapping
// its icon each tap (repeat / shuffle / repeat-1), while still driving the
// same underlying repeatMode + shuffleEnabled settings the desktop controls use.
function getMobileComboState() {
    if (userSettings.repeatMode === 'one') return 'one';
    if (userSettings.shuffleEnabled) return 'shuffle';
    return 'off';
}

function updateMobileComboUI() {
    const btn = document.getElementById('btn-loop-mode');
    if (!btn) return;
    const icon = document.getElementById('loop-mode-icon');
    const iconOne = document.getElementById('loop-mode-icon-one');
    const text = document.getElementById('loop-mode-text');
    const state = getMobileComboState();

    btn.classList.remove('mode-active-flat');
    if (icon) icon.classList.remove('hidden');
    if (iconOne) iconOne.classList.add('hidden');

    if (state === 'one') {
        if (icon) icon.classList.add('hidden');
        if (iconOne) iconOne.classList.remove('hidden');
        btn.classList.add('mode-active-flat');
        if (text) text.innerText = 'Repeat One';
        btn.title = 'Repeat One';
    } else if (state === 'shuffle') {
        if (icon) icon.className = 'fa-solid fa-shuffle text-base text-white';
        btn.classList.add('mode-active-flat');
        if (text) text.innerText = 'Shuffle';
        btn.title = 'Shuffle';
    } else {
        if (icon) icon.className = 'fa-solid fa-repeat text-base text-white';
        if (text) text.innerText = 'Off';
        btn.title = 'Repeat / Shuffle';
    }
}

const toggleMobileComboMode = () => {
    const state = getMobileComboState();
    if (state === 'off') {
        userSettings.repeatMode = 'off';
        userSettings.shuffleEnabled = true;
    } else if (state === 'shuffle') {
        userSettings.repeatMode = 'one';
        userSettings.shuffleEnabled = false;
    } else {
        userSettings.repeatMode = 'off';
        userSettings.shuffleEnabled = false;
    }
    saveSettings();
    updateRepeatModeUI();
    updateShuffleUI();
    updateMobileComboUI();
};

const btnLoopMob = document.getElementById('btn-loop-mode');
const btnLoopDt = document.getElementById('btn-loop-mode-dt');
if (btnLoopMob) btnLoopMob.onclick = toggleMobileComboMode;
if (btnLoopDt) btnLoopDt.onclick = toggleRepeatMode;

const btnShuffleDt = document.getElementById('btn-shuffle-mode-dt');
if (btnShuffleDt) btnShuffleDt.onclick = toggleShuffle;

// Picks a random track from the playlist, avoiding an immediate repeat of the
// currently playing track (when more than one track is available). Shared by
// auto-advance-on-end and the manual Next/Previous buttons so shuffle behaves
// identically no matter how the track change was triggered.
function pickShuffleTrack(playlist, excludeId) {
    if (!playlist.length) return null;
    if (playlist.length === 1) return playlist[0];
    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * playlist.length);
    } while (playlist[randomIndex].id === excludeId);
    return playlist[randomIndex];
}


        // --- AUTO PLAY NEXT SONG & ENDED EVENT ---
        audio.onended = () => {
            // ক্রসফেড ইতিমধ্যে পরের ট্র্যাকে সুইচ করে দিয়ে থাকলে এই ডিফল্ট অ্যাডভান্স লজিক
            // আর চালানো উচিত নয় (নাহলে একটার পর একটা দুইবার ট্র্যাক স্কিপ হয়ে যাবে)
            if (crossfadeTriggered) return;
            // Repeat One always wins: replay the same track regardless of Shuffle.
            if (userSettings.repeatMode === 'one') {
                seekAudioTo(0);
                triggerPlay();
                return;
            }

            const playlist = window.PLAYLIST_DATA || [];
            if (!playlist.length || activeSongId === 'custom-file' || !activeSongId) return;

            let nextTrack = null;

            if (userSettings.shuffleEnabled) {
                nextTrack = pickShuffleTrack(playlist, activeSongId);
            } else {
                const currentIndex = playlist.findIndex(s => s.id === activeSongId);
                if (currentIndex !== -1) {
                    const isLastTrack = currentIndex === playlist.length - 1;
                    // With Repeat off, stop after the last track instead of looping back
                    // to the first; Repeat All wraps around and keeps playing.
                    if (isLastTrack && userSettings.repeatMode !== 'all') return;
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
            if (userSettings.shuffleEnabled) {
                prevTrack = pickShuffleTrack(playlist, activeSongId);
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
            if (userSettings.shuffleEnabled) {
                nextTrack = pickShuffleTrack(playlist, activeSongId);
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

        // --- ADJACENT TRACK PRELOADING (previous 2 / next 2 in the library) ---
        // Warms the browser's HTTP cache for the tracks around the one currently
        // playing, so tapping Next/Prev feels instant instead of waiting for a
        // fresh buffer. Only meaningful for the library's own sequential order —
        // Shuffle picks its next track randomly at transition time, so there's
        // nothing fixed to preload ahead of time for it.
        const preloadedTracks = new Map(); // songId -> hidden Audio element
        let preloadScheduleTimer = null;
        let preloadScheduleListener = null;

        function getAdjacentSongs(radius = 2) {
            const playlist = window.PLAYLIST_DATA || [];
            if (!playlist.length || activeSongId === 'custom-file' || !activeSongId) return [];

            const currentIndex = playlist.findIndex(s => s.id === activeSongId);
            if (currentIndex === -1) return [];

            const wanted = new Map(); // songId -> song, de-duplicated (short playlists can wrap onto themselves)
            for (let step = 1; step <= radius; step++) {
                const nextSong = playlist[(currentIndex + step) % playlist.length];
                const prevSong = playlist[(currentIndex - step + playlist.length) % playlist.length];
                if (nextSong && nextSong.id !== activeSongId) wanted.set(nextSong.id, nextSong);
                if (prevSong && prevSong.id !== activeSongId) wanted.set(prevSong.id, prevSong);
            }
            return Array.from(wanted.values());
        }

        function preloadAdjacentTracks() {
            // Respect Data Saver / metered connections where the browser exposes it.
            try {
                if (navigator.connection && navigator.connection.saveData) return;
            } catch (e) { /* navigator.connection unsupported, ignore */ }

            const wantedSongs = getAdjacentSongs(2);
            const wantedIds = new Set(wantedSongs.map(s => s.id));

            // Evict anything preloaded that's no longer within the current window,
            // so the pool can't grow unbounded as the user browses around and cap
            // how much bandwidth/memory this feature can ever hold onto.
            preloadedTracks.forEach((audioEl, songId) => {
                if (!wantedIds.has(songId)) {
                    try {
                        audioEl.removeAttribute('src');
                        audioEl.load();
                    } catch (e) { /* ignore */ }
                    preloadedTracks.delete(songId);
                }
            });

            wantedSongs.forEach(song => {
                if (!song.audioUrl || preloadedTracks.has(song.id)) return;
                const preloadEl = new Audio();
                preloadEl.preload = 'auto';
                preloadEl.crossOrigin = 'anonymous';
                preloadEl.muted = true;
                preloadEl.src = song.audioUrl;
                // Keep it off-DOM and silent — it exists purely to make the browser
                // fetch/cache the file, never to actually play audible sound.
                preloadedTracks.set(song.id, preloadEl);
            });
        }

        // Deferred the same way scheduleWaveformGeneration() is: fire once the
        // currently playing track can actually play (or after 800ms regardless),
        // so this preloading never competes for bandwidth with the track that's
        // supposed to be starting right now.
        function schedulePreloadAdjacentTracks() {
            if (preloadScheduleTimer) {
                clearTimeout(preloadScheduleTimer);
                preloadScheduleTimer = null;
            }
            if (preloadScheduleListener) {
                audio.removeEventListener('canplay', preloadScheduleListener);
                preloadScheduleListener = null;
            }

            let started = false;
            const start = () => {
                if (started) return;
                started = true;
                if (preloadScheduleTimer) { clearTimeout(preloadScheduleTimer); preloadScheduleTimer = null; }
                if (preloadScheduleListener) { audio.removeEventListener('canplay', preloadScheduleListener); preloadScheduleListener = null; }
                preloadAdjacentTracks();
            };

            preloadScheduleListener = start;
            audio.addEventListener('canplay', preloadScheduleListener, { once: true });
            preloadScheduleTimer = setTimeout(start, 800);
        }

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

            document.querySelectorAll('.viz-style-chip').forEach(btn => {
                if (btn.dataset.style === userSettings.visualizerMode) btn.classList.add('active');
                else btn.classList.remove('active');
            });

            updateBarVizVisibility();

            document.querySelectorAll('#theme-picker .theme-swatch').forEach(btn => {
                const isAutoChip = btn.id === 'theme-swatch-auto';
                const shouldSelect = userSettings.autoThemeFromCover ? isAutoChip : (!isAutoChip && btn.dataset.color === userSettings.themeColor);
                btn.classList.toggle('selected', shouldSelect);
            });

            // Crossfade / Gapless Playback প্রেফারেন্স UI সিঙ্ক
            const crossfadeToggleEl = document.getElementById('crossfade-toggle');
            const crossfadeDurationSliderEl = document.getElementById('crossfade-duration-slider');
            const crossfadeDurationLblEl = document.getElementById('crossfade-duration-lbl');
            if (crossfadeToggleEl) crossfadeToggleEl.checked = !!userSettings.crossfadeEnabled;
            if (crossfadeDurationSliderEl) crossfadeDurationSliderEl.value = userSettings.crossfadeDuration;
            if (crossfadeDurationLblEl) crossfadeDurationLblEl.innerText = parseFloat(userSettings.crossfadeDuration).toFixed(1) + 's';

            document.documentElement.style.setProperty('--font-scale', userSettings.fontScale);
            document.getElementById('font-scale-lbl').innerText = parseFloat(userSettings.fontScale).toFixed(2) + 'x';

            updateOffsetUI();
            updateRepeatModeUI();
            updateShuffleUI();
            updateMobileComboUI();

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
            const speedIndDtEl = document.getElementById('speed-indicator-dt');
            audio.playbackRate = userSettings.playbackRate;
            if (speedSliderEl) speedSliderEl.value = userSettings.playbackRate;
            if (speedValEl) speedValEl.innerText = parseFloat(userSettings.playbackRate).toFixed(2) + 'x';
            if (speedIndDtEl) speedIndDtEl.innerText = parseFloat(userSettings.playbackRate).toFixed(1) + 'x';

            updateScroll(activeIndex);
        }

                // --- HEADER TITLE PRIORITY UPDATE ---
        function updateHeaderTitle() {
            const titleEl = document.getElementById('track-title');
            const artistEl = document.getElementById('track-artist');

            // Desktop left-sidebar vinyl card mirrors the same title/artist — set
            // directly here instead of via a MutationObserver watching titleEl, so the
            // two stay in sync through one deterministic code path.
            const dtTitleEl = document.getElementById('desktop-side-title');
            const dtArtistEl = document.getElementById('desktop-side-artist');

            const dtSongInput = document.getElementById('dt-online-song-input');
            const dtArtistInput = document.getElementById('dt-online-artist-input');
            const modalSongInput = document.getElementById('online-song-input');
            const modalArtistInput = document.getElementById('online-artist-input');

            let currentTitle = onlineTrackTitle || fileTrackTitle || '';
            let currentArtist = onlineArtistName || fileArtistName || '';

            let displayTitle, displayArtist;
            if (onlineTrackTitle) {
                displayTitle = onlineTrackTitle;
                displayArtist = onlineArtistName || 'Online Synced Track';
            } else if (fileTrackTitle) {
                displayTitle = fileTrackTitle;
                displayArtist = fileArtistName || 'Local File Track';
            } else {
                displayTitle = 'No Track Loaded';
                displayArtist = 'Tap music library or studio buttons';
            }

            titleEl.innerText = displayTitle;
            artistEl.innerText = displayArtist;
            if (dtTitleEl) dtTitleEl.innerText = displayTitle;
            if (dtArtistEl) dtArtistEl.innerText = displayArtist;

            if (currentTitle) {
                if (dtSongInput) dtSongInput.value = currentTitle;
                if (modalSongInput) modalSongInput.value = currentTitle;
                if (dtArtistInput) dtArtistInput.value = currentArtist;
                if (modalArtistInput) modalArtistInput.value = currentArtist;
            }

            updateMediaSessionMetadata(displayTitle, displayArtist);
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
else if (userSettings.visualizerMode === 'nebula') {
    // Ensure canvas sits in front of ambient background but behind lyric text
    canvasBg.style.zIndex = '5';

    const containerRect = container.getBoundingClientRect();
    const cx = containerRect.width > 0 ? (containerRect.left + containerRect.width / 2) : (window.innerWidth / 2);
    const cy = containerRect.height > 0 ? (containerRect.top + containerRect.height / 2) : (window.innerHeight / 2);
    const baseRadius = Math.min(containerRect.width || window.innerWidth, containerRect.height || window.innerHeight) * 0.2;

    const now = Date.now() / 1000;

    ctxBg.save();
    ctxBg.translate(cx, cy);
    ctxBg.globalCompositeOperation = 'lighter';

    // Three orbiting rings of glowing particles, each spinning at its own speed
    // and direction, with size/position modulated by live frequency data —
    // reads like a slowly breathing, drifting galactic nebula.
    const ringCount = 3;
    const particlesPerRing = Math.max(8, Math.floor(barCount / ringCount));

    for (let ring = 0; ring < ringCount; ring++) {
        const ringRadius = baseRadius * (1 + ring * 0.6);
        const rotSpeed = (ring % 2 === 0 ? 1 : -1) * (0.06 + ring * 0.035);
        const rotation = now * rotSpeed;

        for (let i = 0; i < particlesPerRing; i++) {
            const dataIdx = (i * ringCount + ring) % barCount;
            const amp = smoothBars[dataIdx] / 255;
            const angle = (i / particlesPerRing) * Math.PI * 2 + rotation;
            const wobble = Math.sin(now * 1.4 + i * 0.6 + ring * 2) * 8;
            const r = ringRadius + amp * 55 + wobble;

            const px = Math.cos(angle) * r;
            const py = Math.sin(angle) * r * 0.55;

            const size = (1.4 + amp * 6) * (1 - ring * 0.15);

            const grad = ctxBg.createRadialGradient(px, py, 0, px, py, size * 3);
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.35, userSettings.themeColor);
            grad.addColorStop(1, 'transparent');

            ctxBg.beginPath();
            ctxBg.fillStyle = grad;
            ctxBg.globalAlpha = 0.4 + amp * 0.5;
            ctxBg.arc(px, py, size * 3, 0, Math.PI * 2);
            ctxBg.fill();
        }
    }

    // Pulsing core at the center, driven by bass energy
    const bass = (smoothBars[0] + smoothBars[1] + smoothBars[2]) / (3 * 255);
    const coreRadius = 8 + bass * 20;
    const coreGrad = ctxBg.createRadialGradient(0, 0, 0, 0, 0, coreRadius * 2.5);
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.35, userSettings.themeColor);
    coreGrad.addColorStop(1, 'transparent');

    ctxBg.beginPath();
    ctxBg.fillStyle = coreGrad;
    ctxBg.globalAlpha = 0.85;
    ctxBg.arc(0, 0, coreRadius * 2.5, 0, Math.PI * 2);
    ctxBg.fill();

    ctxBg.restore();
}
else if (userSettings.visualizerMode === 'aurora') {
    // Ensure canvas sits in front of ambient background but behind lyric text
    canvasBg.style.zIndex = '5';

    const now = Date.now() / 1000;
    const w = wBg, h = hBg;
    const midY = h * 0.5;

    ctxBg.save();
    ctxBg.globalCompositeOperation = 'lighter';

    // Layered, drifting ribbons of light — like curtains of aurora borealis —
    // each layer at its own height/speed/color, height driven by live frequency
    // data spread across the width of the screen.
    const layerCount = 4;
    const layerColors = [userSettings.themeColor, '#ffffff', userSettings.themeColor, '#a78bfa'];

    for (let layer = 0; layer < layerCount; layer++) {
        const speed = 0.12 + layer * 0.045;
        const phase = now * speed + layer * 1.9;
        const baseY = midY + (layer - (layerCount - 1) / 2) * (h * 0.05);
        const amplitude = h * 0.08 * (1 - layer * 0.1);

        const points = 72;
        const pathTop = [];
        for (let i = 0; i <= points; i++) {
            const t = i / points;
            const x = t * w;
            const dataIdx = Math.floor(t * (barCount - 1));
            const amp = smoothBars[dataIdx] / 255;
            const y = baseY
                + Math.sin(t * Math.PI * 2.6 + phase) * amplitude
                + Math.sin(t * Math.PI * 6.2 + phase * 1.4) * amplitude * 0.25
                - amp * h * 0.16;
            pathTop.push({ x, y });
        }

        ctxBg.beginPath();
        ctxBg.moveTo(pathTop[0].x, pathTop[0].y);
        for (let i = 1; i < pathTop.length; i++) ctxBg.lineTo(pathTop[i].x, pathTop[i].y);
        ctxBg.lineTo(w, h);
        ctxBg.lineTo(0, h);
        ctxBg.closePath();

        const grad = ctxBg.createLinearGradient(0, baseY - amplitude - h * 0.15, 0, h * 0.85);
        grad.addColorStop(0, layerColors[layer % layerColors.length]);
        grad.addColorStop(0.55, 'rgba(255,255,255,0.12)');
        grad.addColorStop(1, 'transparent');

        ctxBg.fillStyle = grad;
        ctxBg.globalAlpha = 0.4 - layer * 0.06;
        ctxBg.fill();

        // Bright leading edge line along the top of the ribbon for definition
        ctxBg.beginPath();
        ctxBg.moveTo(pathTop[0].x, pathTop[0].y);
        for (let i = 1; i < pathTop.length; i++) ctxBg.lineTo(pathTop[i].x, pathTop[i].y);
        ctxBg.strokeStyle = layerColors[layer % layerColors.length];
        ctxBg.lineWidth = 1.5;
        ctxBg.globalAlpha = 0.5 - layer * 0.08;
        ctxBg.stroke();
    }

    ctxBg.restore();
}
else if (userSettings.visualizerMode === 'starburst') {
    // Ensure canvas sits in front of ambient background but behind lyric text
    canvasBg.style.zIndex = '5';

    const containerRect = container.getBoundingClientRect();
    const cx = containerRect.width > 0 ? (containerRect.left + containerRect.width / 2) : (window.innerWidth / 2);
    const cy = containerRect.height > 0 ? (containerRect.top + containerRect.height / 2) : (window.innerHeight / 2);
    const maxR = Math.max(window.innerWidth, window.innerHeight) * 0.62;

    const now = Date.now() / 1000;

    ctxBg.save();
    ctxBg.translate(cx, cy);
    ctxBg.globalCompositeOperation = 'lighter';

    // A continuous rain of glowing comet streaks flying outward from the center,
    // each one looping back to the core once it reaches the edge — speed, tail
    // length, and brightness all pulse with live frequency data per streak.
    const cometCount = barCount;
    for (let i = 0; i < cometCount; i++) {
        const amp = smoothBars[i] / 255;
        const angle = (i / cometCount) * Math.PI * 2 + Math.sin(i * 12.9898) * 0.05;
        const speed = 0.1 + (i % 5) * 0.014;
        const progress = (now * speed + i * 0.618) % 1;
        const dist = progress * maxR * (0.55 + amp * 0.65);

        const tailLen = 26 + amp * 90;
        const x2 = Math.cos(angle) * dist;
        const y2 = Math.sin(angle) * dist;
        const backDist = Math.max(0, dist - tailLen);
        const x1 = Math.cos(angle) * backDist;
        const y1 = Math.sin(angle) * backDist;

        const fade = Math.max(0, 1 - progress);

        const grad = ctxBg.createLinearGradient(x1, y1, x2, y2);
        grad.addColorStop(0, 'transparent');
        grad.addColorStop(1, userSettings.themeColor);

        ctxBg.beginPath();
        ctxBg.moveTo(x1, y1);
        ctxBg.lineTo(x2, y2);
        ctxBg.strokeStyle = grad;
        ctxBg.lineWidth = 1.4 + amp * 3.4;
        ctxBg.lineCap = 'round';
        ctxBg.globalAlpha = fade * (0.35 + amp * 0.55);
        ctxBg.stroke();

        // Bright comet head
        ctxBg.beginPath();
        ctxBg.fillStyle = '#ffffff';
        ctxBg.globalAlpha = fade * (0.5 + amp * 0.5);
        ctxBg.arc(x2, y2, 1 + amp * 2.2, 0, Math.PI * 2);
        ctxBg.fill();
    }

    ctxBg.restore();
}


        }
        drawVisualizer();

        // --- LRC PARSER & RENDERER ---
        // applyToPlayer=false parses/validates the text WITHOUT touching the live
        // `lyrics` array or the on-screen scroller — used while a local file is just
        // staged (selected but not yet Applied) so a currently playing library track's
        // lyrics aren't disturbed until the user actually hits Apply.
        function parseLRC(text, applyToPlayer = true) {
            const parsed = [];

            if (text && text.trim()) {
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
                            parsed.push({ time: min * 60 + sec + ms / 1000, content });
                        });
                    }
                });

                if (!timestamped) {
                    const cleanLines = lines.filter(l => l.trim() !== '');
                    const step = (audio.duration && !isNaN(audio.duration)) ? audio.duration / cleanLines.length : 3.5;
                    cleanLines.forEach((content, i) => {
                        parsed.push({ time: i * step, content: content.trim() });
                    });
                }

                parsed.sort((a, b) => a.time - b.time);
            }

            if (!applyToPlayer) return parsed;

            lyrics = parsed;
            renderLyrics();
            return parsed;
        }

        // Message shown on the main lyric stage whenever there are no lyric lines
        // loaded. Defaults to the generic "nothing loaded" message, but is swapped
        // to "Finding lyrics..." while an online lookup is in flight, and to
        // "Lyrics not found" if that lookup comes back empty/fails — so the stage
        // never shows the plain "not loaded" text while a search is actually happening.
        let lyricsEmptyMessage = 'No synchronized lyrics loaded';

        function setLyricsEmptyMessage(msg) {
            lyricsEmptyMessage = msg;
            if (lyrics.length === 0) renderLyrics();
        }

        function renderLyrics() {
            scroller.innerHTML = '';
            if (lyrics.length === 0) {
                scroller.innerHTML = `<div class="lyric-line active">${lyricsEmptyMessage}</div>`;
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
                    updateWakeLockState();
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
        let __mediaSessionPosThrottle = 0;
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

                // লক-স্ক্রিন/নোটিফিকেশনের সিক-বার পজিশন প্রতি ~1 সেকেন্ডে একবার আপডেট
                __mediaSessionPosThrottle++;
                if (__mediaSessionPosThrottle >= 30) {
                    __mediaSessionPosThrottle = 0;
                    updateMediaSessionPosition();
                }

                // ক্রসফেড / গ্যাপলেস প্লেব্যাক: ট্র্যাক শেষ হওয়ার কাছাকাছি এলে ট্রিগার চেক করা
                maybeStartCrossfade();
            }
            drawWaveform();
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
                if (!isAutoScrollLocked) {
                    isAutoScrollLocked = true;
                    updateWakeLockState();
                }
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
            updateWakeLockState();
        }
        resumeSyncBtn.onclick = resumeAutoSync;

        // --- MUSIC LIBRARY RENDERER, SEARCH & TRACK SELECTOR ---
        // Two render targets share one search query & one playlist state:
        // the mobile/tablet bottom-sheet list, and the always-visible desktop
        // right-sidebar list (desktop only — see #playlist-container-desktop).
        const playlistContainer = document.getElementById('playlist-container');
        const searchInput = document.getElementById('library-search-input');
        const clearSearchBtn = document.getElementById('btn-clear-library-search');
        const playlistContainerDesktop = document.getElementById('playlist-container-desktop');
        const searchInputDesktop = document.getElementById('library-search-input-desktop');
        const clearSearchBtnDesktop = document.getElementById('btn-clear-library-search-desktop');

        // --- AUTO COVER ART (iTunes Search API) ---
        // Manual coverUrl/cover fields in musicData.js are no longer used. Every song's
        // artwork is fetched automatically by title+artist and cached, so the default
        // cover only shows while a lookup is pending or if the lookup fails.
        const DEFAULT_COVER_SRC = 'Data/covers/default-cover.jpg';
        const autoCoverCache = {};

        function autoCoverCacheKey(song) {
            return `${(song.title || '').trim()}::${(song.artist || '').trim()}`.toLowerCase();
        }

        async function fetchAutoCover(song) {
            const key = autoCoverCacheKey(song);
            if (Object.prototype.hasOwnProperty.call(autoCoverCache, key)) {
                return autoCoverCache[key];
            }

            try {
                const stored = localStorage.getItem('autoCover:' + key);
                if (stored) {
                    autoCoverCache[key] = stored;
                    return stored;
                }
            } catch (e) { /* localStorage unavailable, ignore */ }

            try {
                const term = encodeURIComponent(`${song.title || ''} ${song.artist || ''}`.trim());
                const res = await fetch(`https://itunes.apple.com/search?term=${term}&media=music&limit=1`);
                if (!res.ok) throw new Error('iTunes search failed');
                const data = await res.json();
                const raw = data.results && data.results[0] && data.results[0].artworkUrl100;
                const hiRes = raw ? raw.replace('100x100bb', '600x600bb') : null;

                autoCoverCache[key] = hiRes;
                if (hiRes) {
                    try { localStorage.setItem('autoCover:' + key, hiRes); } catch (e) { /* ignore quota errors */ }
                }
                return hiRes;
            } catch (e) {
                autoCoverCache[key] = null;
                return null;
            }
        }

        // Fetches (or reuses the cached) auto cover for a song and applies it to an <img>,
        // but only if the img is still displaying this same song by the time it resolves.
        function applyAutoCover(imgEl, song) {
            if (!imgEl || !song) return;
            imgEl.src = DEFAULT_COVER_SRC;

            const key = autoCoverCacheKey(song);
            if (Object.prototype.hasOwnProperty.call(autoCoverCache, key)) {
                if (autoCoverCache[key]) imgEl.src = autoCoverCache[key];
                return;
            }

            fetchAutoCover(song).then(url => {
                if (url && imgEl.dataset.songKey === key) {
                    imgEl.src = url;
                }
            });
            imgEl.dataset.songKey = key;
        }

        window.renderLibraryPlaylist = renderLibraryPlaylist;
        function renderLibraryPlaylist() {
            const renderTargets = [playlistContainer, playlistContainerDesktop].filter(Boolean);
            if (!renderTargets.length) return;

            const playlist = window.PLAYLIST_DATA || [];

            const query = searchQuery.toLowerCase().trim();
            const filtered = playlist.filter(song => {
                if (!query) return true;
                return song.title.toLowerCase().includes(query) || song.artist.toLowerCase().includes(query);
            });

            [document.getElementById('library-track-count'), document.getElementById('library-track-count-desktop')].forEach(countBadge => {
                if (!countBadge) return;
                if (searchQuery.trim()) {
                    countBadge.innerText = `${filtered.length} of ${playlist.length}`;
                } else {
                    countBadge.innerText = `${playlist.length} ${playlist.length === 1 ? 'track' : 'tracks'}`;
                }
            });

            renderTargets.forEach(target => {
                target.innerHTML = '';

                if (filtered.length === 0) {
                    target.innerHTML = `
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
                            <div class="relative w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden ${isSelected ? '' : 'text-slate-400'}" style="${avatarStyle}">
                                <img class="library-track-cover absolute inset-0 w-full h-full object-cover" alt="">
                                ${isSelected ? `<div class="relative z-10 flex items-center justify-center w-full h-full" style="background-color: rgba(var(--m3-primary-rgb), 0.5);">${activeIconHtml}</div>` : `<span class="library-track-index relative z-10 text-[10px] font-mono font-bold" style="text-shadow: 0 1px 3px rgba(0,0,0,0.8);">${String(index + 1).padStart(2, '0')}</span>`}
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
                    target.appendChild(card);

                    const cardCoverImg = card.querySelector('.library-track-cover');
                    applyAutoCover(cardCoverImg, song);
                });
            });
        }

        window.scrollToActiveTrack = function() {
            requestAnimationFrame(() => {
                setTimeout(() => {
                    if (!activeSongId) return;
                    [playlistContainer, playlistContainerDesktop].forEach(target => {
                        if (!target) return;
                        const activeCard = target.querySelector(`[data-song-id="${activeSongId}"]`);
                        if (activeCard) {
                            activeCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    });
                }, 450);
            });
        };

        // A single search query drives both lists — typing in either the desktop
        // sidebar search box or the mobile library-sheet search box keeps the
        // other one in sync.
        function handleLibrarySearchInput(value) {
            searchQuery = value;
            if (searchInput && searchInput.value !== value) searchInput.value = value;
            if (searchInputDesktop && searchInputDesktop.value !== value) searchInputDesktop.value = value;
            if (clearSearchBtn) clearSearchBtn.classList.toggle('hidden', !value);
            if (clearSearchBtnDesktop) clearSearchBtnDesktop.classList.toggle('hidden', !value);
            renderLibraryPlaylist();
        }

        if (searchInput) searchInput.oninput = (e) => handleLibrarySearchInput(e.target.value);
        if (clearSearchBtn) clearSearchBtn.onclick = () => handleLibrarySearchInput('');
        if (searchInputDesktop) searchInputDesktop.oninput = (e) => handleLibrarySearchInput(e.target.value);
        if (clearSearchBtnDesktop) clearSearchBtnDesktop.onclick = () => handleLibrarySearchInput('');

        // Desktop "Tracks" quick-nav button target: scrolls the always-visible
        // right-sidebar playlist dock into view and briefly highlights it,
        // rather than opening the mobile-style library modal (which is hidden
        // at the lg breakpoint now that the sidebar list replaces it there).
        window.jumpToDesktopPlaylist = function() {
            const card = playlistContainerDesktop && playlistContainerDesktop.closest('.dt-playlist-card');
            if (!card) {
                const fallbackBtn = document.getElementById('open-library-btn');
                if (fallbackBtn) fallbackBtn.click();
                return;
            }
            card.scrollIntoView({ behavior: 'smooth', block: 'start' });
            card.classList.add('dt-playlist-flash');
            setTimeout(() => card.classList.remove('dt-playlist-flash'), 900);
            setTimeout(() => {
                if (searchInputDesktop) searchInputDesktop.focus();
            }, 350);
        };

                async function loadTrackFromLibrary(song, options = {}) {
            const { autoplay = true, resumeTime = null, keepPendingLocalFile = false, __fromCrossfade = false } = options;

            // এই কলটি ক্রসফেড হ্যান্ডঅফের অংশ না হলে, আগের যেকোনো চলমান ক্রসফেড
            // বাফার সাথে সাথে বন্ধ করে দাও (ব্যবহারকারী নিজে অন্য ট্র্যাক বেছে নিলে)
            if (!__fromCrossfade) stopCrossfadeBuffer();

            const wasStagedLocalFile = !!pendingLocalAudioFile;
            const wasAppliedLocalFile = (activeSongId === 'custom-file');

            // Explicitly choosing a library track cancels any staged (not-yet-applied) local
            // file, and also clears the local-file selector's label if a local file was
            // either staged OR already applied/playing — otherwise the old filename lingers
            // in the selector even though a library track is now active. An automatic
            // advance (song ended, playlist moves on) passes keepPendingLocalFile so the
            // user's staged-but-not-applied selection survives until they either apply it
            // or pick a track themselves.
            if (wasStagedLocalFile && !keepPendingLocalFile) {
                pendingLocalAudioFile = null;
            }

            if ((wasStagedLocalFile && !keepPendingLocalFile) || wasAppliedLocalFile) {
                const lblAudioReset = document.getElementById('lbl-audio-name');
                if (lblAudioReset) lblAudioReset.innerText = 'Choose Local MP3 / WAV Track';
                const dtLblAudioReset = document.getElementById('dt-lbl-audio-name');
                if (dtLblAudioReset) dtLblAudioReset.innerText = 'Open Audio MP3';
            }

            const coverImg = document.getElementById('desktop-cover-img');
            if (coverImg) {
                delete coverImg.dataset.fallback;
                applyAutoCover(coverImg, song);
            }

            if (song.id === activeSongId) {
                // Tapping the already-playing track to pause it should keep the library
                // open (the user likely wants to browse for something else next); only
                // starting playback closes the sheet, matching what tapping a new track does.
                if (audio.paused) {
                    await triggerPlay();
                    closeSheet(document.getElementById('library-sheet'));
                } else {
                    audio.pause();
                }
                return;
            }

            activeSongId = song.id;

            onlineTrackTitle = song.title;
            onlineArtistName = song.artist;
            fileTrackTitle = '';
            fileArtistName = '';
            updateHeaderTitle();

            await setAudioSource(song.audioUrl);
            // ওয়েভফর্মের জন্য অডিও ফাইলটা আলাদাভাবে আবার fetch করে ডিকোড করতে হয়;
            // এটা মূল গানের বাফারিং-এর সাথে সাথে শুরু হলে নেটওয়ার্ক ব্যান্ডউইথ ভাগ হয়ে
            // গান লোড হতে/পরের গানে যেতে দেরি হয়। তাই আগে গান বাজা শুরু হওয়ার একটু
            // সুযোগ দিয়ে (canplay ইভেন্টের পর, বা সর্বোচ্চ ৮০০ms পর) ওয়েভফর্ম আনা হচ্ছে।
            scheduleWaveformGeneration(song.id, song.audioUrl);
            schedulePreloadAdjacentTracks();

            if (songInput) songInput.value = song.title;
            if (artistInput) artistInput.value = song.artist;

            if (song.lrcText) {
                const rawInput = document.getElementById('raw-lrc-input');
                if (rawInput) rawInput.value = song.lrcText;
                parseLRC(song.lrcText);
            } else {
                // Clear old lyrics before searching, so a failed online lookup for this
                // track leaves "no lyrics" instead of the previous song's lyrics.
                const rawInput = document.getElementById('raw-lrc-input');
                if (rawInput) rawInput.value = '';
                parseLRC('');
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
        // Desktop sidebar mirror of the status line above — updated directly alongside
        // fetchStatus everywhere below instead of via a MutationObserver, so both stay
        // in sync through one code path.
        const dtFetchStatus = document.getElementById('dt-online-fetch-status');

        function setFetchStatusUI(className, html) {
            fetchStatus.className = className;
            fetchStatus.innerHTML = html;
            if (dtFetchStatus) {
                dtFetchStatus.className = className + ' text-center';
                dtFetchStatus.innerHTML = html;
            }
        }

        // applyToPlayer=false fetches/stages the LRC (fills the raw-lrc-input box and
        // remembers the matched title/artist for later) WITHOUT touching the live
        // lyrics scroller or the main-page header — used when a local file is only
        // staged, so it doesn't interrupt a library track that's currently playing.
        async function executeOnlineSync(silent = false, applyToPlayer = true) {
            const song = songInput.value.trim();
            const artist = artistInput.value.trim();

            if (!song) {
                if (!silent) {
                    setFetchStatusUI('text-[10px] font-semibold text-red-400 block', '✕ Please enter a song title to search online.');
                }
                return;
            }

            // Only the call that's actually meant to land on the main stage
            // (applyToPlayer) should change what the stage shows while it searches.
            if (applyToPlayer) setLyricsEmptyMessage('Finding lyrics...');

            setFetchStatusUI(
                'text-[10px] font-semibold text-sky-400 block',
                `<i class="fa-solid fa-spinner animate-spin mr-1"></i> Searching LRCLIB database for "${escapeHTML(song)}"...`
            );

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

                        onlineTrackTitle = match.trackName;
                        onlineArtistName = match.artistName || 'Unknown Artist';

                        document.getElementById('lbl-lrc-name').innerText = "✓ Online Synced: " + match.trackName;

                        setFetchStatusUI(
                            'text-[10px] font-semibold text-emerald-400 block',
                            `✓ Synced LRC Loaded for "${escapeHTML(match.trackName)}"!`
                        );

                        if (applyToPlayer) {
                            parseLRC(lrcText);
                            updateHeaderTitle();
                            resumeAutoSync();
                        }
                    } else {
                        throw new Error("Found track but no synced timestamps available.");
                    }
                } else {
                    throw new Error("No lyrics found online for this track.");
                }
            } catch (err) {
                setFetchStatusUI(
                    'text-[10px] font-semibold text-red-400 block',
                    `✕ ${escapeHTML(err.message || "Failed to fetch online lyrics.")}`
                );
                if (applyToPlayer) setLyricsEmptyMessage('Lyrics not found');
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
    setMediaSessionPlaybackState('playing');
    updateWakeLockState();
};

audio.onpause = () => {
    document.querySelectorAll('#play-icon, .play-icon-target').forEach(el => el.classList.remove('hidden'));
    document.querySelectorAll('#pause-icon, .pause-icon-target').forEach(el => el.classList.add('hidden'));
    
    document.querySelectorAll('#track-art-icon, .desktop-art-spin').forEach(el => {
        el.classList.remove('playing');
    });

    renderLibraryPlaylist();
    saveLastTrackState();
    // ক্রসফেড চলাকালীন হ্যান্ডঅফের জন্য যে সংক্ষিপ্ত pause() কল হয়, সেটাকে
    // "paused" হিসেবে লক-স্ক্রিনে না দেখানোর জন্য এই গার্ড
    if (!crossfadeTriggered) setMediaSessionPlaybackState('paused');
    updateWakeLockState();
};

setInterval(() => {
    if (!audio.paused) saveLastTrackState();
}, 8000);

window.addEventListener('beforeunload', saveLastTrackState);




        audio.onloadedmetadata = () => {
            durTimeLbl.innerText = formatTime(audio.duration);
            updateMediaSessionPosition();
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

            const speedIndDt = document.getElementById('speed-indicator-dt');
            if (speedIndDt) speedIndDt.innerText = val.toFixed(1) + 'x';

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
                    toggleRepeatMode();
                    break;
                case 'KeyS':
                    toggleShuffle();
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
        const sleepMobBtn = document.getElementById('btn-sleep-mob');
        const sleepMobIcon = document.getElementById('sleep-mob-icon');
        const sleepMobText = document.getElementById('sleep-mob-countdown-text');
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

            if (sleepMobBtn && sleepMobIcon && sleepMobText) {
                sleepMobIcon.classList.add('hidden');
                sleepMobText.innerText = formatted;
                sleepMobText.classList.remove('hidden');
                sleepMobBtn.classList.remove('w-8');
                sleepMobBtn.classList.add('px-2', 'gap-1');
            }

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

            if (sleepMobBtn && sleepMobIcon && sleepMobText) {
                sleepMobText.classList.add('hidden');
                sleepMobIcon.classList.remove('hidden');
                sleepMobBtn.classList.add('w-8');
                sleepMobBtn.classList.remove('px-2', 'gap-1');
            }

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
        // Search fields from the filename, and auto-fetches matching lyrics from LRCLIB
        // in the background — but only into the raw-LRC textbox (applyToPlayer=false),
        // NOT onto the main-page lyrics scroller or header. The audio, lyrics, and title
        // are only actually loaded/switched to and auto-played once the user taps an
        // Apply button (mobile "Apply & Done" or the desktop "Apply & Auto-Play" button),
        // via loadPendingLocalFile() below — so a currently playing library track's audio,
        // lyrics, and title are never interrupted just by selecting a file.
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

                // Stage only (applyToPlayer=false): fills the raw-LRC box and remembers
                // the matched title for when Apply is pressed, but does NOT touch the
                // main-page lyrics scroller or header — so a library track currently
                // playing keeps showing its own lyrics/title until Apply is clicked.
                executeOnlineSync(true, false);
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
            generateWaveform('custom-file', file);

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

            // Local files carry no embedded cover art, so look up an auto cover using
            // whichever title/artist we have (the matched online track name if the
            // LRCLIB lookup at selection time found one, otherwise the filename guess).
            // applyAutoCover() itself shows the default cover immediately and swaps in
            // the fetched artwork only if a match is found, so this degrades gracefully.
            const coverImg = document.getElementById('desktop-cover-img');
            if (coverImg) {
                delete coverImg.dataset.fallback;
                applyAutoCover(coverImg, {
                    title: onlineTrackTitle || fileTrackTitle,
                    artist: onlineArtistName || fileArtistName
                });
            }

            updateHeaderTitle();
            renderLibraryPlaylist();

            // Applying a new local file must never leave the previous song's lyrics on
            // screen. Clear the live scroller first, then reuse lyrics already fetched at
            // selection time; only hit LRCLIB now if that earlier auto-fetch found nothing.
            // If the fresh online lookup also fails, the clear above is what's left showing
            // ("no lyrics"), instead of stale lyrics from the track played before this one.
            parseLRC('');

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
            setLyricsEmptyMessage('No synchronized lyrics loaded');
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
            if (btn.id === 'theme-swatch-auto') return; // এটির নিজস্ব হ্যান্ডলার নিচে যুক্ত করা হয়েছে
            btn.onclick = () => {
                userSettings.autoThemeFromCover = false;
                userSettings.themeColor = btn.dataset.color;
                userSettings.themeRgb = btn.dataset.rgb;
                userSettings.themeName = btn.dataset.name;
                saveSettings();

                document.documentElement.style.setProperty('--m3-primary', userSettings.themeColor);
                document.documentElement.style.setProperty('--m3-primary-rgb', userSettings.themeRgb);

                document.querySelectorAll('#theme-picker .theme-swatch').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');

                updateRepeatModeUI();
                updateShuffleUI();
                updateMobileComboUI();
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

            // ডিফল্ট থিম এখন "Adaptive Cover" — কিন্তু কভার আর্টের ইমেজ এলিমেন্টটা
            // যদি ইতিমধ্যে লোড হয়ে থাকে (নতুন করে লোড না হওয়ায়), তার 'load' ইভেন্ট
            // আর ফায়ার হবে না, ফলে asli রঙ বের না হয়ে ফলব্যাক রঙ (#38BDF8, যেটা
            // "CYBER CYAN" সোয়াচের রঙের সাথে হুবহু মিলে যায়) থেকে যেত এবং দেখতে মনে
            // হতো দুই নম্বর সোয়াচটাই সিলেক্ট হয়ে আছে। তাই রিসেটের পরপরই বর্তমান
            // কভার থেকে সরাসরি রঙ বের করে নেওয়া হচ্ছে।
            const coverImgOnReset = document.getElementById('desktop-cover-img');
            if (coverImgOnReset && coverImgOnReset.src && coverImgOnReset.src.indexOf('default-cover') === -1 && coverImgOnReset.complete) {
                applyAdaptiveTheme(coverImgOnReset);
            }
        };

        applySettingsToUI();
        renderLibraryPlaylist();

        // --- RESUME PLAYBACK CONFIRMATION (only asked when the app has been
        // closed/backgrounded for 5 minutes/300000ms or more; below that, the saved
        // position is silently restored regardless of how far into the song it was) ---
        const RESUME_PROMPT_GAP_MS = 1 * 60 * 1000;
        const resumeDialog = document.getElementById('resume-dialog');
        const resumeDialogTimeEl = document.getElementById('resume-dialog-time');
        const resumeDialogTrackEl = document.getElementById('resume-dialog-track');

        function showResumeDialog(track, savedTime) {
            if (resumeDialogTimeEl) resumeDialogTimeEl.innerText = formatTime(savedTime);
            if (resumeDialogTrackEl) resumeDialogTrackEl.innerText = track.title || 'this track';
            resumeDialog.classList.add('open');

            document.getElementById('btn-resume-yes').onclick = async () => {
                seekAudioTo(savedTime);
                resumeDialog.classList.remove('open');
                await triggerPlay();
            };
            document.getElementById('btn-resume-no').onclick = async () => {
                // Position stays at 0 (never seeked); persist that so a reload doesn't
                // keep re-prompting for the same old position.
                saveLastTrackState();
                resumeDialog.classList.remove('open');
                await triggerPlay();
            };
        }

        // --- RESTORE LAST PLAYED TRACK ON RELOAD (loads track + position, no autoplay) ---
        (function restoreLastTrack() {
            const last = loadLastTrackState();
            if (!last || !last.id) return;
            const playlist = window.PLAYLIST_DATA || [];
            const track = playlist.find(s => s.id === last.id);
            if (!track) return;

            const savedTime = last.time || 0;
            // If we don't have a savedAt timestamp (data saved before this feature
            // existed), we can't measure the closed-duration gap — fall back to the
            // old silent-restore behavior rather than guessing.
            const gapMs = last.savedAt ? (Date.now() - last.savedAt) : 0;

            if (last.savedAt && gapMs >= RESUME_PROMPT_GAP_MS && savedTime > 0) {
                // Load the track paused at the start; only jump to the saved position if
                // the user confirms via the Resume Playback popup.
                loadTrackFromLibrary(track, { autoplay: false });
                showResumeDialog(track, savedTime);
            } else {
                loadTrackFromLibrary(track, { autoplay: false, resumeTime: savedTime });
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

        document.querySelectorAll('.close-sheet-btn').forEach(btn => {
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

        /* =========================================================================
           NEW FEATURE BLOCK
           1) Lock Screen / Notification Media Controls  — MediaSession API
           2) Crossfade / Gapless Playback                — dual-buffer smooth handoff
           3) Auto Theme From Cover Art                    — dominant color extraction
           4) Waveform Scrubber                             — decoded-audio peak canvas
           ========================================================================= */

        // ---------------------------------------------------------------------
        // 1) MEDIA SESSION API — লক স্ক্রিন / নোটিফিকেশন মিডিয়া কন্ট্রোল
        // ---------------------------------------------------------------------
        function updateMediaSessionMetadata(titleOverride, artistOverride) {
            if (!('mediaSession' in navigator)) return;
            try {
                const titleEl = document.getElementById('track-title');
                const artistEl = document.getElementById('track-artist');
                const coverImg = document.getElementById('desktop-cover-img');

                const title = titleOverride || (titleEl && titleEl.innerText) || 'Lyrics Flow Pro';
                const artist = artistOverride || (artistEl && artistEl.innerText) || '';

                let artworkSrc = coverImg ? coverImg.src : '';
                if (!artworkSrc) artworkSrc = new URL('Data/covers/default-cover.jpg', document.baseURI).href;

                navigator.mediaSession.metadata = new MediaMetadata({
                    title: title,
                    artist: artist,
                    album: 'Lyrics Flow Pro — Studio Edition',
                    artwork: [
                        { src: artworkSrc, sizes: '96x96', type: 'image/jpeg' },
                        { src: artworkSrc, sizes: '192x192', type: 'image/jpeg' },
                        { src: artworkSrc, sizes: '256x256', type: 'image/jpeg' },
                        { src: artworkSrc, sizes: '384x384', type: 'image/jpeg' },
                        { src: artworkSrc, sizes: '512x512', type: 'image/jpeg' }
                    ]
                });
            } catch (e) {
                console.log('MediaSession metadata error:', e);
            }
        }

        function setMediaSessionPlaybackState(state) {
            if ('mediaSession' in navigator) {
                try { navigator.mediaSession.playbackState = state; } catch (e) { /* ignore */ }
            }
        }

        function updateMediaSessionPosition() {
            if (!('mediaSession' in navigator) || typeof navigator.mediaSession.setPositionState !== 'function') return;
            if (!audio.duration || isNaN(audio.duration) || !isFinite(audio.duration)) return;
            try {
                navigator.mediaSession.setPositionState({
                    duration: audio.duration,
                    playbackRate: audio.playbackRate || 1,
                    position: Math.max(0, Math.min(audio.currentTime, audio.duration))
                });
            } catch (e) { /* কিছু ব্রাউজারে সাপোর্ট নাও থাকতে পারে */ }
        }

        if ('mediaSession' in navigator) {
            navigator.mediaSession.setActionHandler('play', () => { triggerPlay(); });
            navigator.mediaSession.setActionHandler('pause', () => { audio.pause(); });
            navigator.mediaSession.setActionHandler('previoustrack', () => { playPreviousTrack(); });
            navigator.mediaSession.setActionHandler('nexttrack', () => { playNextTrack(); });
            try { navigator.mediaSession.setActionHandler('stop', () => { audio.pause(); seekAudioTo(0); }); } catch (e) {}
            try {
                navigator.mediaSession.setActionHandler('seekto', (details) => {
                    if (details.fastSeek && typeof audio.fastSeek === 'function') { audio.fastSeek(details.seekTime); return; }
                    seekAudioTo(details.seekTime);
                });
            } catch (e) { /* seekto অসমর্থিত হতে পারে */ }
            try {
                navigator.mediaSession.setActionHandler('seekbackward', (details) => {
                    seekAudioTo((audio.currentTime || 0) - (details.seekOffset || 10));
                });
                navigator.mediaSession.setActionHandler('seekforward', (details) => {
                    seekAudioTo((audio.currentTime || 0) + (details.seekOffset || 10));
                });
            } catch (e) { /* seekbackward/forward অসমর্থিত হতে পারে */ }
        }

        // Track load-time metadata refresh — cover art may resolve slightly after the
        // header title, so re-push metadata once the artwork actually loads too.
        (function bindCoverToMediaSessionAndAdaptiveTheme() {
            const coverImg = document.getElementById('desktop-cover-img');
            if (!coverImg) return;
            coverImg.addEventListener('load', () => {
                updateMediaSessionMetadata();
                if (coverImg.src.indexOf('default-cover') === -1) {
                    applyAdaptiveTheme(coverImg);
                }
            });
        })();

        // ---------------------------------------------------------------------
        // 3) AUTO THEME FROM COVER ART — কভার আর্ট থেকে ডমিন্যান্ট কালার তুলে থিম বদল
        // ---------------------------------------------------------------------
        function rgbToHex(r, g, b) {
            return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
        }

        function rgbToHsl(r, g, b) {
            r /= 255; g /= 255; b /= 255;
            const max = Math.max(r, g, b), min = Math.min(r, g, b);
            let h, s, l = (max + min) / 2;
            if (max === min) {
                h = s = 0;
            } else {
                const d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    default: h = (r - g) / d + 4; break;
                }
                h /= 6;
            }
            return [h * 360, s * 100, l * 100];
        }

        function hslToRgb(h, s, l) {
            h /= 360; s /= 100; l /= 100;
            let r, g, b;
            if (s === 0) {
                r = g = b = l;
            } else {
                const hue2rgb = (p, q, t) => {
                    if (t < 0) t += 1;
                    if (t > 1) t -= 1;
                    if (t < 1 / 6) return p + (q - p) * 6 * t;
                    if (t < 1 / 2) return q;
                    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                    return p;
                };
                const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                const p = 2 * l - q;
                r = hue2rgb(p, q, h + 1 / 3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1 / 3);
            }
            return [r * 255, g * 255, b * 255];
        }

        // ছোট ক্যানভাসে কভার আঁকা হয়, তারপর সবচেয়ে ভাইব্র্যান্ট (saturated) পিক্সেলকে
        // অগ্রাধিকার দিয়ে একটি ডমিন্যান্ট কালার বাছাই করা হয়, এরপর অ্যাপের নিয়ন-থিম
        // স্টাইলের সাথে মানানসই করতে saturation/lightness একটু বুস্ট করা হয়।
        function extractDominantColor(imgEl) {
            try {
                const size = 32;
                const cnv = document.createElement('canvas');
                cnv.width = size; cnv.height = size;
                const cx = cnv.getContext('2d', { willReadFrequently: true });
                cx.drawImage(imgEl, 0, 0, size, size);
                const data = cx.getImageData(0, 0, size, size).data;

                let rSum = 0, gSum = 0, bSum = 0, count = 0;
                let bestSat = -1, bestColor = null;

                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
                    if (a < 128) continue;
                    const [, s, l] = rgbToHsl(r, g, b);
                    if (l > 8 && l < 92) { rSum += r; gSum += g; bSum += b; count++; }
                    if (s > bestSat && l > 15 && l < 85) { bestSat = s; bestColor = [r, g, b]; }
                }

                if (!count) return null;

                let [r, g, b] = (bestColor && bestSat > 20) ? bestColor : [rSum / count, gSum / count, bSum / count];
                let [h, s, l] = rgbToHsl(r, g, b);
                s = Math.max(s, 55);
                l = Math.min(Math.max(l, 42), 62);
                [r, g, b] = hslToRgb(h, s, l);

                return { hex: rgbToHex(r, g, b), rgb: `${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}` };
            } catch (e) {
                // ক্রস-অরিজিন ইমেজে ক্যানভাস "tainted" হয়ে গেলে এখানে ধরা পড়বে
                console.log('Adaptive cover-color extraction blocked:', e);
                return null;
            }
        }

        function applyAdaptiveTheme(imgEl) {
            if (!userSettings.autoThemeFromCover) return;
            const color = extractDominantColor(imgEl);
            if (!color) return;

            userSettings.themeColor = color.hex;
            userSettings.themeRgb = color.rgb;
            userSettings.themeName = 'ADAPTIVE COVER';
            saveSettings();

            document.documentElement.style.setProperty('--m3-primary', color.hex);
            document.documentElement.style.setProperty('--m3-primary-rgb', color.rgb);
            const themeTag = document.getElementById('theme-tag');
            if (themeTag) { themeTag.innerText = userSettings.themeName; themeTag.style.color = color.hex; }

            document.querySelectorAll('#theme-picker .theme-swatch').forEach(b => b.classList.remove('selected'));
            const autoChip = document.getElementById('theme-swatch-auto');
            if (autoChip) autoChip.classList.add('selected');
        }

        const themeSwatchAuto = document.getElementById('theme-swatch-auto');
        if (themeSwatchAuto) {
            themeSwatchAuto.onclick = () => {
                userSettings.autoThemeFromCover = true;
                saveSettings();
                const coverImg = document.getElementById('desktop-cover-img');
                if (coverImg && coverImg.src && coverImg.src.indexOf('default-cover') === -1 && coverImg.complete) {
                    applyAdaptiveTheme(coverImg);
                } else {
                    // কভার এখনো লোড না হলে অন্তত সিলেকশন-ইন্ডিকেটরটা আপডেট করো;
                    // কভার লোড হওয়ার পর load ইভেন্ট হ্যান্ডলারই আসল রঙ বসাবে
                    document.querySelectorAll('#theme-picker .theme-swatch').forEach(b => b.classList.remove('selected'));
                    themeSwatchAuto.classList.add('selected');
                    const themeTag = document.getElementById('theme-tag');
                    if (themeTag) themeTag.innerText = 'ADAPTIVE COVER (WAITING...)';
                }
            };
        }

        // ---------------------------------------------------------------------
        // 4) WAVEFORM SCRUBBER — ডিকোড করা অডিও থেকে পিক ওয়েভফর্ম আঁকা
        // ---------------------------------------------------------------------
        const waveformPeakCache = {}; // key -> Float32Array of normalized 0..1 peaks
        let currentWaveformPeaks = null;
        let waveformDecodeToken = 0; // রেস কন্ডিশন এড়াতে (দ্রুত ট্র্যাক পরিবর্তনে পুরনো ডিকোড আটকানো)
        let waveformDecodeCtx = null;

        function getWaveformDecodeContext() {
            if (!waveformDecodeCtx) {
                try {
                    waveformDecodeCtx = new (window.AudioContext || window.webkitAudioContext)();
                } catch (e) {
                    waveformDecodeCtx = null;
                }
            }
            return waveformDecodeCtx;
        }

        function resizeWaveformCanvas() {
            if (!waveformCanvas) return;
            const dpr = window.devicePixelRatio || 1;
            const rect = waveformCanvas.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return;
            waveformCanvas.width = rect.width * dpr;
            waveformCanvas.height = rect.height * dpr;
            if (waveformCtx) waveformCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
        window.addEventListener('resize', resizeWaveformCanvas);
        resizeWaveformCanvas();

        // মূল গানের অডিও বাফারিং শেষ না হওয়া পর্যন্ত ওয়েভফর্মের আলাদা fetch/decode
        // শুরু না করার জন্য — audio.canplay ইভেন্টের অপেক্ষা করা হয়, তবে নেটওয়ার্ক
        // ধীর হলেও গান খুব বেশি দেরি না করে যেন ওয়েভফর্ম আসে, তার জন্য ৮০০ms এর একটা
        // সর্বোচ্চ সীমাও রাখা আছে।
        let waveformScheduleTimer = null;
        let waveformScheduleListener = null;

        function scheduleWaveformGeneration(cacheKey, source) {
            if (waveformScheduleTimer) {
                clearTimeout(waveformScheduleTimer);
                waveformScheduleTimer = null;
            }
            if (waveformScheduleListener) {
                audio.removeEventListener('canplay', waveformScheduleListener);
                waveformScheduleListener = null;
            }

            let started = false;
            const start = () => {
                if (started) return;
                started = true;
                if (waveformScheduleTimer) { clearTimeout(waveformScheduleTimer); waveformScheduleTimer = null; }
                if (waveformScheduleListener) { audio.removeEventListener('canplay', waveformScheduleListener); waveformScheduleListener = null; }
                generateWaveform(cacheKey, source);
            };

            waveformScheduleListener = start;
            audio.addEventListener('canplay', waveformScheduleListener, { once: true });
            waveformScheduleTimer = setTimeout(start, 800);
        }

        async function generateWaveform(cacheKey, source) {
            if (!waveformCanvas || !waveformCtx) return;

            currentWaveformPeaks = null;
            scrubber.classList.remove('waveform-active');
            drawWaveform();

            if (Object.prototype.hasOwnProperty.call(waveformPeakCache, cacheKey)) {
                currentWaveformPeaks = waveformPeakCache[cacheKey];
                if (currentWaveformPeaks) scrubber.classList.add('waveform-active');
                drawWaveform();
                return;
            }

            const myToken = ++waveformDecodeToken;

            try {
                let arrayBuffer;
                if (source instanceof File || source instanceof Blob) {
                    arrayBuffer = await source.arrayBuffer();
                } else if (typeof source === 'string') {
                    const res = await fetch(source);
                    if (!res.ok) throw new Error('Waveform source fetch failed');
                    arrayBuffer = await res.arrayBuffer();
                } else {
                    return;
                }

                const ctx = getWaveformDecodeContext();
                if (!ctx) return;

                // decodeAudioData মূল অ্যারে-বাফারটি "detach" করে ফেলে, তাই একটি কপি ব্যবহার করা হচ্ছে
                const audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));

                if (myToken !== waveformDecodeToken) return; // ইতিমধ্যে অন্য ট্র্যাকে চলে গেছে

                const BAR_COUNT = 140;
                const channelData = audioBuffer.getChannelData(0);
                const samplesPerBar = Math.max(1, Math.floor(channelData.length / BAR_COUNT));
                const peaks = new Float32Array(BAR_COUNT);

                for (let i = 0; i < BAR_COUNT; i++) {
                    const start = i * samplesPerBar;
                    const end = Math.min(channelData.length, start + samplesPerBar);
                    let max = 0;
                    for (let j = start; j < end; j++) {
                        const v = Math.abs(channelData[j]);
                        if (v > max) max = v;
                    }
                    peaks[i] = max;
                }

                // 0..1 রেঞ্জে নরমালাইজ করা (খুব নিচু-ভলিউমের ট্র্যাকও দৃশ্যমান হওয়ার জন্য)
                let peakMax = 0;
                for (let i = 0; i < peaks.length; i++) if (peaks[i] > peakMax) peakMax = peaks[i];
                if (peakMax > 0.001) {
                    for (let i = 0; i < peaks.length; i++) peaks[i] = peaks[i] / peakMax;
                }

                waveformPeakCache[cacheKey] = peaks;
                if (myToken === waveformDecodeToken) {
                    currentWaveformPeaks = peaks;
                    scrubber.classList.add('waveform-active');
                    drawWaveform();
                }
            } catch (e) {
                // ডিকোড ব্যর্থ হলে (CORS, ফরম্যাট, ইত্যাদি) — স্বাভাবিক প্লেন স্লাইডারে থেকে যাওয়াই ঠিক
                console.log('Waveform generation skipped:', e && e.message ? e.message : e);
                waveformPeakCache[cacheKey] = null;
            }
        }

        function drawWaveform() {
            if (!waveformCanvas || !waveformCtx) return;
            if (waveformCanvas.width === 0 || waveformCanvas.height === 0) resizeWaveformCanvas();
            const dpr = window.devicePixelRatio || 1;
            const w = waveformCanvas.width / dpr;
            const h = waveformCanvas.height / dpr;
            if (w === 0 || h === 0) return;

            waveformCtx.clearRect(0, 0, w, h);
            if (!currentWaveformPeaks || !currentWaveformPeaks.length) return;

            const progress = (audio.duration && !isNaN(audio.duration)) ? (audio.currentTime / audio.duration) : 0;
            const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--m3-primary').trim() || '#38BDF8';

            const barCountW = currentWaveformPeaks.length;
            const gap = 2;
            const barWidth = Math.max(1.5, (w - gap * (barCountW - 1)) / barCountW);
            const midY = h / 2;

            for (let i = 0; i < barCountW; i++) {
                const x = i * (barWidth + gap);
                const played = (x / w) <= progress;
                const amp = Math.max(0.06, currentWaveformPeaks[i]);
                const barH = Math.max(2, amp * h);

                waveformCtx.fillStyle = played ? primaryColor : 'rgba(255, 255, 255, 0.18)';
                const radius = Math.min(barWidth / 2, 2);
                const y = midY - barH / 2;

                waveformCtx.beginPath();
                if (typeof waveformCtx.roundRect === 'function') {
                    waveformCtx.roundRect(x, y, barWidth, barH, radius);
                } else {
                    waveformCtx.rect(x, y, barWidth, barH);
                }
                waveformCtx.fill();
            }
        }

        // ---------------------------------------------------------------------
        // 2) CROSSFADE / GAPLESS PLAYBACK — ট্র্যাক বদলের সময় মসৃণ ট্রানজিশন
        // ---------------------------------------------------------------------
        function stopCrossfadeBuffer() {
            crossfadeTriggered = false;
            if (!crossfadeAudio) return;
            try {
                if (!crossfadeAudio.paused) crossfadeAudio.pause();
                crossfadeAudio.volume = 0;
                crossfadeAudio.removeAttribute('src');
                crossfadeAudio.load();
            } catch (e) { /* ignore */ }
        }

        function getUpcomingTrack() {
            const playlist = window.PLAYLIST_DATA || [];
            if (!playlist.length || activeSongId === 'custom-file' || !activeSongId) return null;

            if (userSettings.shuffleEnabled) return pickShuffleTrack(playlist, activeSongId);

            const currentIndex = playlist.findIndex(s => s.id === activeSongId);
            if (currentIndex === -1) return null;
            const isLastTrack = currentIndex === playlist.length - 1;
            if (isLastTrack && userSettings.repeatMode !== 'all') return null;
            return playlist[(currentIndex + 1) % playlist.length];
        }

        function rampDualVolume(fromA, toA, fromB, toB, durationMs) {
            return new Promise(resolve => {
                if (durationMs <= 0) {
                    audio.volume = toA;
                    if (crossfadeAudio) crossfadeAudio.volume = toB;
                    resolve();
                    return;
                }
                const start = performance.now();
                function step(now) {
                    const t = Math.min(1, (now - start) / durationMs);
                    audio.volume = fromA + (toA - fromA) * t;
                    if (crossfadeAudio) crossfadeAudio.volume = fromB + (toB - fromB) * t;
                    if (t < 1 && crossfadeTriggered) {
                        requestAnimationFrame(step);
                    } else {
                        resolve();
                    }
                }
                requestAnimationFrame(step);
            });
        }

        async function runCrossfade(nextTrack, fadeSecs) {
            if (!crossfadeAudio) { crossfadeTriggered = false; return; }
            const targetVol = userSettings.muted ? 0 : userSettings.volume;
            const startVolA = audio.volume;

            try {
                crossfadeAudio.crossOrigin = 'anonymous';
                crossfadeAudio.src = nextTrack.audioUrl;
                crossfadeAudio.currentTime = 0;
                crossfadeAudio.volume = 0;
                await crossfadeAudio.play();
            } catch (e) {
                stopCrossfadeBuffer();
                return; // স্বাভাবিক audio.onended এখন সাধারণ অ্যাডভান্স হিসেবে কাজ করবে
            }

            // ধাপ ১: বর্তমান ট্র্যাক ফেড-আউট + পরের ট্র্যাক ফেড-ইন (বাফার এলিমেন্টে)
            await rampDualVolume(startVolA, 0, 0, targetVol, fadeSecs * 1000 * 0.6);
            if (!crossfadeTriggered) return; // মাঝপথে ব্যবহারকারী অন্য কিছু করেছে

            // ধাপ ২: মূল <audio> এলিমেন্টেই পরের ট্র্যাক লোড করা হচ্ছে (যাতে EQ,
            // ভিজুয়ালাইজার, লিরিক্স সিঙ্ক ও মিডিয়া সেশন — সবকিছু স্বাভাবিকভাবে কাজ করে)
            const handoffTime = crossfadeAudio.currentTime;
            audio.pause();
            audio.volume = 0;

            await loadTrackFromLibrary(nextTrack, {
                autoplay: false,
                keepPendingLocalFile: true,
                resumeTime: handoffTime,
                __fromCrossfade: true
            });

            if (!crossfadeTriggered) { stopCrossfadeBuffer(); return; }

            await triggerPlay();

            // ধাপ ৩: মূল এলিমেন্ট ফেড-ইন + বাফার এলিমেন্ট ফেড-আউট
            await rampDualVolume(0, targetVol, crossfadeAudio.volume, 0, fadeSecs * 1000 * 0.4);

            stopCrossfadeBuffer();
        }

        function maybeStartCrossfade() {
            if (!userSettings.crossfadeEnabled || crossfadeTriggered) return;
            if (userSettings.repeatMode === 'one') return;
            if (!audio.duration || isNaN(audio.duration) || !isFinite(audio.duration)) return;

            const fadeSecs = Math.max(0.5, Math.min(12, parseFloat(userSettings.crossfadeDuration) || 4));
            if (audio.duration - audio.currentTime > fadeSecs) return;

            const nextTrack = getUpcomingTrack();
            if (!nextTrack) return;

            crossfadeTriggered = true;
            runCrossfade(nextTrack, fadeSecs).catch(err => {
                console.log('Crossfade error, falling back to normal auto-advance:', err);
                stopCrossfadeBuffer();
            });
        }

        // --- Crossfade Preferences UI wiring ---
        const crossfadeToggle = document.getElementById('crossfade-toggle');
        const crossfadeDurationSlider = document.getElementById('crossfade-duration-slider');
        const crossfadeDurationLbl = document.getElementById('crossfade-duration-lbl');

        if (crossfadeToggle) {
            crossfadeToggle.checked = !!userSettings.crossfadeEnabled;
            crossfadeToggle.onchange = (e) => {
                userSettings.crossfadeEnabled = e.target.checked;
                saveSettings();
                if (!userSettings.crossfadeEnabled) stopCrossfadeBuffer();
            };
        }
        if (crossfadeDurationSlider) {
            crossfadeDurationSlider.value = userSettings.crossfadeDuration;
            if (crossfadeDurationLbl) crossfadeDurationLbl.innerText = parseFloat(userSettings.crossfadeDuration).toFixed(1) + 's';
            crossfadeDurationSlider.oninput = (e) => {
                const val = parseFloat(e.target.value);
                userSettings.crossfadeDuration = val;
                if (crossfadeDurationLbl) crossfadeDurationLbl.innerText = val.toFixed(1) + 's';
                saveSettings();
            };
        }