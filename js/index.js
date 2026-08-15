document.open();
document.write(`
    <!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    <title>Lyrics Flow Music Player Online</title>
    
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        m3: {
                            bg: '#0F131C',
                            surface: '#171C28',
                            surfaceVariant: '#202636',
                            surfaceHigh: '#2B3245',
                            primary: 'var(--m3-primary)',
                            primaryRgb: 'var(--m3-primary-rgb)',
                            onPrimary: '#0B0F19',
                            outline: 'rgba(255, 255, 255, 0.08)'
                        }
                    },
                    fontFamily: {
                        sans: ['Outfit', 'system-ui', 'sans-serif'],
                        mono: ['JetBrains Mono', 'monospace']
                    }
                }
            }
        }
    </script>

    <!-- FontAwesome & Google Fonts -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">

    <style>
        :root {
            --m3-primary: #38BDF8;
            --m3-primary-rgb: 56, 189, 248;
            --m3-glow: rgba(56, 189, 248, 0.25);
            --font-scale: 1;
            --lyric-base-size: 1.5rem;
        }

        * {
            -webkit-tap-highlight-color: transparent;
            user-select: none;
            -webkit-user-select: none;
            box-sizing: border-box;
        }

        html, body {
            height: 100%;
            height: 100dvh;
            margin: 0;
            padding: 0;
            overflow: hidden;
            background-color: #0A0D14;
            color: #F1F5F9;
            font-family: 'Outfit', sans-serif;
            display: flex;
            flex-direction: column;
        }

        /* Android Material 3 Clean Preloader (No Card Style) */
        #preloader {
            position: fixed;
            inset: 0;
            background-color: #0A0D14;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.6s;
        }

        #preloader.fade-out {
            opacity: 0;
            visibility: hidden;
        }

        .loader-ring {
            width: 72px;
            height: 72px;
            border-radius: 50%;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .loader-ring::before {
            content: "";
            position: absolute;
            inset: 0;
            border-radius: 50%;
            border: 3.5px solid rgba(var(--m3-primary-rgb), 0.15);
        }

        .loader-ring::after {
            content: "";
            position: absolute;
            inset: 0;
            border-radius: 50%;
            border: 3.5px solid transparent;
            border-top-color: var(--m3-primary);
            border-right-color: var(--m3-primary);
            animation: m3Spinner 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        @keyframes m3Spinner {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .loader-progress-bar {
            width: 140px;
            height: 3px;
            background: rgba(255, 255, 255, 0.08);
            border-radius: 4px;
            overflow: hidden;
            position: relative;
        }

        .loader-progress-fill {
            height: 100%;
            width: 0%;
            background: var(--m3-primary);
            box-shadow: 0 0 10px var(--m3-glow);
            border-radius: 4px;
            transition: width 0.1s linear;
        }

        /* Ambient Dynamic Background */
        .ambient-bg {
            position: fixed;
            inset: -20%;
            background: radial-gradient(circle at 50% 35%, rgba(var(--m3-primary-rgb), 0.16) 0%, rgba(15, 23, 42, 0.85) 60%, #0A0D14 100%);
            z-index: 0;
            pointer-events: none;
            transition: background 0.8s ease;
            filter: blur(60px);
        }

                        /* Rotating Vinyl Disc Animation for Mobile & Desktop */
        #track-art-icon,
        .desktop-art-spin {
            display: inline-block;
            animation: spinDisk 16s linear infinite;
            animation-play-state: paused;
            will-change: transform;
        }

        #track-art-icon.playing,
        .desktop-art-spin.playing {
            animation-play-state: running;
        }

        @keyframes spinDisk {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }



        /* Equalizer Animation */
        .equalizer-icon {
            display: inline-flex;
            align-items: flex-end;
            gap: 2.5px;
            height: 16px;
            width: 16px;
            justify-content: center;
        }

        .equalizer-bar {
            width: 3px;
            background-color: var(--m3-primary);
            border-radius: 2px;
            height: 30%;
            animation: bounceBar 0.8s ease-in-out infinite alternate;
        }

        .equalizer-bar:nth-child(1) { animation-delay: 0.1s; }
        .equalizer-bar:nth-child(2) { animation-delay: 0.4s; }
        .equalizer-bar:nth-child(3) { animation-delay: 0.25s; }

        .equalizer-icon.paused .equalizer-bar {
            animation-play-state: paused;
            height: 30% !important;
        }

        @keyframes bounceBar {
            0% { height: 25%; }
            50% { height: 100%; }
            100% { height: 40%; }
        }

        /* Main Viewport & Lyrics Container */
        #lyrics-container {
            flex: 1;
            width: 100%;
            overflow: hidden;
            position: relative;
            z-index: 10;
            mask-image: linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%);
            -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%);
            cursor: grab;
            touch-action: none;
        }

        #lyrics-container:active {
            cursor: grabbing;
        }

        #lyrics-scroller {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            will-change: transform;
            transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* Lyrics Formatting */
        .lyric-line {
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease, color 0.3s ease, text-shadow 0.3s ease, font-size 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            opacity: 0.35;
            transform: scale(0.75);
            transform-origin: center center;
            text-align: center;
            padding: 12px 24px;
            font-size: calc(var(--lyric-base-size) * var(--font-scale));
            line-height: 1.45;
            font-weight: 700;
            color: #94A3B8;
            word-wrap: break-word;
            margin: 4px auto;
            max-width: calc(100% - 25px);
            cursor: pointer;
            will-change: transform, opacity;
        }

        .lyric-line:hover {
            opacity: 0.75;
            color: #F8FAFC;
        }

        .lyric-line.active {
            opacity: 1;
            transform: scale(1.1);
            color: var(--m3-primary);
            text-shadow: 0 0 25px var(--m3-glow);
        }

        @media (min-width: 640px) {
            :root { --lyric-base-size: 1.7rem; }
            .lyric-line { padding: 14px 28px; margin: 6px auto; }
        }

        @media (min-width: 1024px) {
            :root { --lyric-base-size: 3rem; }
            .lyric-line { padding: 24px 40px; margin: 12px auto; max-width: 90%; }
        }

        @media (min-width: 1400px) {
            :root { --lyric-base-size: 2.3rem; }
        }

        /* Material 3 Bottom Surface Control Bar */
        .m3-footer-surface {
            background: rgba(18, 23, 34, 0.95);
            backdrop-filter: blur(30px);
            -webkit-backdrop-filter: blur(30px);
            border-top: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 28px 28px 0 0;
            z-index: 40;
            padding-bottom: max(0.8rem, env(safe-area-inset-bottom));
        }

        @media (min-width: 1024px) {
            .m3-footer-surface {
                border-radius: 20px;
                margin: 0 1rem 0.75rem 1rem;
                border: 1px solid rgba(255, 255, 255, 0.1);
                box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
            }
        }

        /* Material Slider */
        .m3-slider {
            -webkit-appearance: none;
            appearance: none;
            width: 100%;
            height: 6px;
            border-radius: 3px;
            background: rgba(255, 255, 255, 0.12);
            outline: none;
            cursor: pointer;
        }

        .m3-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: var(--m3-primary);
            box-shadow: 0 0 10px var(--m3-primary);
            cursor: pointer;
            transition: transform 0.15s ease;
        }

        .m3-slider::-webkit-slider-thumb:hover { transform: scale(1.25); }

        /* Visualizer Canvases */
        #viz-canvas-bg {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 2;
            opacity: 0.35;
        }

        
        #viz-canvas-bar {
            width: 100%;
            height: 50px;
            pointer-events: none;
        }

@media (min-width: 1024px) {
        #viz-canvas-bar {
            height: 80px;
    }
}

        /* Responsive Bottom Sheet System */
        .sheet-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.75);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            z-index: 100;
            display: flex;
            align-items: flex-end;
            justify-content: center;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @media (min-width: 640px) {
            .sheet-overlay {
                align-items: center;
                padding: 20px;
            }
        }

        .sheet-overlay.open {
            opacity: 1;
            pointer-events: auto;
        }

        .m3-bottom-sheet {
            background: #141824;
            border-top: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 36px 36px 0 0;
            width: 100%;
            max-width: 680px;
            max-height: 88vh;
            display: flex;
            flex-direction: column;
            transform: translateY(100%);
            transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
            box-shadow: 0 -20px 60px rgba(0, 0, 0, 0.9);
        }

        @media (min-width: 640px) {
            .m3-bottom-sheet {
                border: 1px solid rgba(255, 255, 255, 0.12);
                border-radius: 32px;
                transform: scale(0.95) translateY(20px);
            }
            .sheet-overlay.open .m3-bottom-sheet {
                transform: scale(1) translateY(0);
            }
        }

        .sheet-overlay.open .m3-bottom-sheet { transform: translateY(0); }

        /* Modal Dialog Popup */
        .dialog-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.75);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            z-index: 150;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.25s ease;
            padding: 20px;
        }

        .dialog-overlay.open { opacity: 1; pointer-events: auto; }

        .m3-dialog {
            background: #171C28;
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 28px;
            width: 100%;
            max-width: 380px;
            padding: 24px;
            transform: scale(0.9);
            transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
        }

        .dialog-overlay.open .m3-dialog { transform: scale(1); }

        /* Android Segmented Tab Pills */
        .m3-tab-pill {
            padding: 9px 16px;
            font-size: 0.75rem;
            font-weight: 700;
            color: #94A3B8;
            border-radius: 20px;
            transition: all 0.25s ease;
            white-space: nowrap;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: transparent;
            cursor: pointer;
        }

        .m3-tab-pill.active {
            color: #0F172A;
            background: var(--m3-primary);
            box-shadow: 0 4px 15px var(--m3-glow);
        }

        /* Control Bar Buttons Styling */
        .ctrl-btn {
            color: #94A3B8;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 18px;
        }

        .ctrl-btn:hover {
            color: #F8FAFC;
            background: rgba(255, 255, 255, 0.08);
        }

        .ctrl-btn:active {
            transform: scale(0.92);
        }

        .ctrl-btn.active-mode {
            color: var(--m3-primary);
            background: rgba(var(--m3-primary-rgb), 0.12);
            border: 1px solid rgba(var(--m3-primary-rgb), 0.25);
        }

        /* Profile Avatar */
        .profile-avatar-bg {
            width: 76px;
            height: 76px;
            border-radius: 50%;
            background-image: url('Data/img/profile.jpg'), radial-gradient(circle, rgba(var(--m3-primary-rgb), 0.6) 0%, rgba(15, 23, 42, 0.9) 100%);
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            pointer-events: none;
            user-select: none;
            -webkit-user-select: none;
            box-shadow: 0 0 25px var(--m3-glow);
            border: 2px solid var(--m3-primary);
            transition: border-color 0.4s ease, box-shadow 0.4s ease;
        }

        /* Dynamic Theme Adaptive Utilities */
        .theme-accent-color {
            color: var(--m3-primary) !important;
            transition: color 0.3s ease;
        }

        .theme-accent-bg {
            background-color: var(--m3-primary) !important;
            transition: background-color 0.3s ease;
        }

        .theme-glass-card {
            background: linear-gradient(135deg, rgba(var(--m3-primary-rgb), 0.08) 0%, rgba(255, 255, 255, 0.02) 100%);
            border: 1px solid rgba(var(--m3-primary-rgb), 0.2);
            backdrop-filter: blur(16px);
            transition: all 0.3s ease;
        }

        .theme-glass-card:hover {
            border-color: rgba(var(--m3-primary-rgb), 0.4);
            box-shadow: 0 10px 30px -10px rgba(var(--m3-primary-rgb), 0.2);
        }

        /* Custom Desktop Card Glass Polish */
        .dt-panel-card {
            background: rgba(18, 23, 36, 0.65);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 20px;
            transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .dt-panel-card:hover {
            border-color: rgba(var(--m3-primary-rgb), 0.3);
            box-shadow: 0 12px 32px -10px rgba(0, 0, 0, 0.5);
        }

        /* Seamless List Row */
        .m3-list-row {
            padding: 12px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
        }

        .m3-list-row:last-child { border-bottom: none; }

        .m3-input {
            width: 100%;
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 14px;
            padding: 10px 14px;
            font-size: 0.8rem;
            color: #F8FAFC;
            outline: none;
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .m3-input:focus { 
            border-color: var(--m3-primary);
            box-shadow: 0 0 12px rgba(var(--m3-primary-rgb), 0.25);
        }

        /* Custom Scrollbar */
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.18); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.35); }
    </style>
</head>
<body>

    <!-- Professional Android M3 Preloader (No Card Style) -->
    <div id="preloader">
        <div class="flex flex-col items-center gap-6">
            <div class="loader-ring">
                <i class="fa-solid fa-music text-2xl text-m3-primary"></i>
            </div>
            
            <div class="flex flex-col items-center gap-2">
                <h2 class="text-sm font-black uppercase tracking-widest text-slate-200">Lyrics Flow Pro</h2>
                <div class="loader-progress-bar">
                    <div class="loader-progress-fill" id="loader-progress"></div>
                </div>
            </div>
        </div>
    </div>

    <!-- Ambient Dynamic Glow Backdrop -->
    <div class="ambient-bg" id="ambient-bg"></div>

    <!-- Orbit Visualizer Canvas Overlay -->
    <canvas id="viz-canvas-bg"></canvas>

    <!-- Material Top App Header -->
    <header class="w-full max-w-[1700px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between z-20 flex-shrink-0 relative">
        <div class="flex items-center gap-3.5 min-w-0">
            <!-- Vinyl Artwork Badge (Mobile/Tablet View) -->
            <div id="track-art" class="shrink-0 flex items-center justify-center lg:hidden">
                <i class="fa-solid fa-compact-disc text-4xl sm:text-5xl text-m3-primary" id="track-art-icon"></i>
            </div>
            
            <div class="min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                    <span class="text-[9px] font-extrabold uppercase tracking-widest text-m3-primary hidden lg:inline-flex items-center gap-1.5 bg-sky-500/10 px-2.5 py-0.5 rounded-full border border-sky-500/20 shadow-sm">
                        <i class="fa-solid fa-sliders text-[8px]"></i> Studio Workstation
                    </span>
                    <span id="theme-tag" class="text-[9px] md:text-[10px] font-extrabold uppercase tracking-widest text-m3-primary">CYBER CYAN</span>
                    <span id="offset-tag" class="text-[9px] md:text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white/70">0.0s</span>
                    
                    <!-- Sleep Timer Countdown Badge -->
                    <span id="sleep-countdown-badge" class="hidden text-[9px] md:text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 animate-pulse">
                        <i class="fa-solid fa-moon text-[8px]"></i>
                        <span id="sleep-countdown-text">00:00</span>
                    </span>
                </div>
                <h1 id="track-title" class="text-xs sm:text-sm md:text-base lg:text-lg font-black truncate text-slate-100 leading-tight">No Track Loaded</h1>
                <p id="track-artist" class="text-[11px] md:text-xs text-slate-400 truncate">Tap music library button or studio controls</p>
            </div>
        </div>

        <!-- Synchronized Lyrics Stage Bar (Desktop Top Header Alignment) -->
        <div class="hidden lg:flex items-center gap-4 px-8 py-3 rounded-2xl bg-slate-950/40 border border-white/10">
            <div class="flex items-center gap-2.5">
                <i class="fa-solid fa-align-center text-xs text-m3-primary"></i>
                <span class="text-xs font-bold text-slate-200 tracking-wide">Synchronized Lyrics Stage</span>
            </div>
            <div class="flex items-center gap-2">
                <div class="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-xl border border-white/10 text-[11px] font-mono">
                    <span class="text-slate-400">Scale:</span>
                    <span id="dt-font-scale-lbl" class="text-sky-400 font-bold">1.0x</span>
                </div>
                <button id="dt-font-down" class="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 flex items-center justify-center text-xs font-bold active:scale-95 transition-all border border-white/5" title="Decrease Font Size">-</button>
                <button id="dt-font-up" class="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 flex items-center justify-center text-xs font-bold active:scale-95 transition-all border border-white/5" title="Increase Font Size">+</button>
            </div>
        </div>

        <div class="flex items-center gap-2.5 shrink-0">
            <!-- Music Library Button -->
            <button id="open-library-btn" class="px-5 py-2.5 sm:py-2 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-300 hover:text-white transition-all text-xs font-bold flex items-center gap-2 active:scale-95 border border-white/10 shadow-sm" title="Music Library">
                <i class="fa-solid fa-music text-sky-400"></i>
                <span class="hidden sm:inline">Library</span>
            </button>

            <!-- Studio Control Sheet Button -->
            <button id="open-studio-btn" class="px-5 py-2.5 sm:py-2 bg-m3-primary/10 hover:bg-m3-primary/20 border border-m3-primary/30 rounded-2xl text-m3-primary transition-all text-xs font-bold flex items-center gap-2 active:scale-95 shadow-sm" title="Studio Dashboard">
                <i class="fa-solid fa-sliders"></i>
                <span class="hidden sm:inline">Studio</span>
            </button>
        </div>
    </header>

    <!-- MAIN RESPONSIVE WORKSPACE CONTAINER -->
    <div class="flex-1 w-full max-w-[1700px] mx-auto px-2 sm:px-4 lg:px-6 flex flex-col lg:flex-row gap-4 min-h-0 relative z-10 overflow-hidden pb-1">

        <!-- DESKTOP LEFT SIDEBAR (Vinyl Showcase & Studio Status Dock) -->
        <aside class="hidden lg:flex lg:w-72 xl:w-80 flex-col gap-3.5 flex-shrink-0 h-full overflow-y-auto pr-0.5 pb-24">

            
           <!-- Elevated Vinyl Artwork Showcase Card -->
            <div class="p-4 rounded-2xl theme-glass-card relative overflow-hidden flex flex-col items-center text-center group shrink-0">
                
                <!-- Real Rotating Vinyl Disc Container with Cover Art Image -->
<div class="w-36 h-36 xl:w-44 xl:h-44 rounded-full bg-slate-950 border-4 border-white/10 shadow-2xl flex items-center justify-center relative my-1 overflow-hidden shrink-0">
    
    <!-- Spinning Vinyl Body -->
    <div id="desktop-vinyl-disc" class="w-full h-full rounded-full desktop-art-spin relative overflow-hidden flex items-center justify-center">
        
        <!-- Song Dynamic Cover Image -->
        <img id="desktop-cover-img" src="Data/img/default-cover.jpg" alt="Song Cover" class="w-full h-full object-cover transition-opacity duration-300" onerror="this.src='Data/img/default-cover.jpg';">
        
        <!-- Clean Disc Edge Vignette Overlay -->
<div class="absolute inset-0 rounded-full pointer-events-none ring-1 ring-inset ring-white/15 shadow-[inset_0_0_20px_rgba(0,0,0,0.6)]"></div>

        
        <!-- Reflection / Gloss Effect -->
        <div class="absolute inset-0 rounded-full opacity-30 bg-gradient-to-tr from-transparent via-white/40 to-transparent pointer-events-none"></div>
        
        <!-- Center Hole & Ring -->
        <div class="w-10 h-10 xl:w-12 xl:h-12 rounded-full border-2 border-slate-950 shadow-2xl flex items-center justify-center absolute z-10 bg-slate-950/90 backdrop-blur-xs">
            <div class="w-3 h-3 rounded-full bg-slate-900 border border-white/20"></div>
        </div>
    </div>

    <!-- Center Spindle Pin -->
    <div class="w-3 h-3 rounded-full bg-slate-200 border border-slate-800 absolute z-20 shadow-md"></div>
</div>



                <div class="w-full pt-2 space-y-1">
                    <span class="text-[9px] font-extrabold uppercase tracking-widest text-m3-primary block">NOW PLAYING</span>
                    <h2 class="text-xs xl:text-sm font-black text-white truncate px-1" id="desktop-side-title">Lyrics Flow Pro</h2>
                    <p class="text-[11px] text-slate-400 truncate px-1" id="desktop-side-artist">Studio Lyrics Engine</p>
                </div>
            </div>

            <!-- Desktop Quick Controls Widget -->
            <div class="p-3.5 dt-panel-card space-y-2.5">
                <div class="flex items-center justify-between">
                    <span class="text-[11px] font-bold text-slate-200 flex items-center gap-2">
                        <i class="fa-solid fa-wand-magic-sparkles text-m3-primary text-[11px]"></i> Studio Navigation
                    </span>
                    <span class="text-[9px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded-full">Quick Access</span>
                </div>
                <div class="grid grid-cols-2 gap-2 text-[11px] font-bold">
                    <button class="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm" onclick="document.getElementById('open-library-btn').click()">
                        <i class="fa-solid fa-list-ul text-sky-400 text-xs"></i> Tracks
                    </button>
                    <button class="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm" onclick="openStudioTab('tab-eq')">
    <i class="fa-solid fa-sliders text-purple-400 text-xs"></i> EQ / FX
</button>

                </div>
            </div>

            <!-- Developer Quick Info (Next to Studio Navigation Quick Access) -->
            <div class="p-3 rounded-2xl bg-slate-900/40 border border-white/5 space-y-1.5 mt-auto">
                <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-m3-primary font-bold text-xs">
                        TI
                    </div>
                    <div>
                        <h4 class="text-xs font-extrabold text-white">Tabib Imran</h4>
                        <p class="text-[9px] text-slate-400">Studio Audio Architect</p>
                    </div>
                </div>
            </div>

        </aside>

        <!-- CENTER PANEL: Synchronized Lyrics Viewport Container -->
        <main id="lyrics-container" class="flex-1 h-full min-w-0 bg-transparent lg:border lg:border-white/10 lg:rounded-2xl relative overflow-hidden flex flex-col shadow-2xl lg:py-6">

            <div id="lyrics-scroller">
                <div class="lyric-line active">Welcome to Lyrics Flow Pro</div>
                <div class="lyric-line">Tap music library <i class="fa-solid fa-music mx-1"></i> or studio <i class="fa-solid fa-sliders mx-1"></i> to play tracks</div>
            </div>

            <!-- Floating Auto-Sync Resume Pill -->
            <button id="resume-sync-btn" class="hidden absolute bottom-5 left-1/2 -translate-x-1/2 z-30 px-5 py-2.5 rounded-full bg-slate-900/90 border border-sky-400/40 text-sky-400 text-xs font-bold shadow-2xl flex items-center gap-2 backdrop-blur-md active:scale-95 transition-all">
                <i class="fa-solid fa-arrows-rotate animate-spin text-xs"></i>
                Resume Auto-Sync
            </button>
        </main>

        <!-- DESKTOP RIGHT SIDEBAR (Online LRC Search, Local Media & Equalizer Dock) -->
        <aside class="hidden lg:flex lg:w-72 xl:w-80 flex-col gap-3.5 flex-shrink-0 h-full overflow-y-auto pl-0.5 pb-24">
            
            <!-- 1. ONLINE LRC FINDER CARD (DESKTOP RIGHT SIDEBAR INTEGRATION) -->
            <div class="p-3.5 dt-panel-card space-y-3">
                <div class="flex items-center justify-between">
                    <span class="text-[11px] font-extrabold text-white flex items-center gap-1.5">
                        <i class="fa-solid fa-wand-magic-sparkles text-m3-primary text-xs"></i> Online LRC Search
                    </span>
                    <span class="text-[9px] bg-sky-500/20 text-sky-300 font-extrabold px-2 py-0.5 rounded-full border border-sky-500/30">LRCLIB</span>
                </div>

                <div class="space-y-2">
                    <input type="text" id="dt-online-song-input" placeholder="Track Name *" class="m3-input py-2 text-xs">
                    <input type="text" id="dt-online-artist-input" placeholder="Artist Name (Optional)" class="m3-input py-2 text-xs">
                </div>

                <button id="dt-btn-fetch-online-lrc" class="w-full py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95">
                    <i class="fa-solid fa-magnifying-glass text-xs"></i> Fetch & Auto-Sync Lyrics
                </button>

                <p id="dt-online-fetch-status" class="text-[10px] font-semibold text-slate-400 hidden text-center"></p>
            </div>

            <!-- 2. LOCAL FILE & LYRICS LOADER DOCK -->
            <div class="p-3.5 dt-panel-card space-y-2.5">
                <div class="flex items-center justify-between">
                    <span class="text-[11px] font-extrabold text-white flex items-center gap-1.5">
                        <i class="fa-solid fa-folder-open text-m3-primary text-xs"></i> Local Audio & LRC
                    </span>
                    <span class="text-[9px] bg-white/5 text-slate-400 font-bold px-2 py-0.5 rounded-full">Local Files</span>
                </div>
                
                <div class="space-y-2 text-xs">
                    <!-- Quick Local Audio Button -->
                    <button class="w-full py-2.5 px-3 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 rounded-xl text-[11px] font-bold flex items-center justify-between transition-all active:scale-95 shadow-sm" onclick="document.getElementById('audio-file-input').click()">
                        <span class="truncate flex items-center gap-2">
                            <i class="fa-solid fa-music text-sky-400"></i> Open Audio MP3
                        </span>
                        <i class="fa-solid fa-plus text-[10px] text-slate-400"></i>
                    </button>

                    <!-- Quick Local LRC Button -->
                    <button class="w-full py-2.5 px-3 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 rounded-xl text-[11px] font-bold flex items-center justify-between transition-all active:scale-95 shadow-sm" onclick="document.getElementById('lrc-file-input').click()">
                        <span class="truncate flex items-center gap-2">
                            <i class="fa-solid fa-file-lines text-purple-400"></i> Load .LRC File
                        </span>
                        <i class="fa-solid fa-upload text-[10px] text-slate-400"></i>
                    </button>
                </div>
            </div>

            <!-- 3. Equalizer Quick Sliders Widget -->
            <div class="p-3.5 dt-panel-card space-y-2.5">
                <div class="flex items-center justify-between">
                    <span class="text-[11px] font-extrabold text-white flex items-center gap-1.5">
                        <i class="fa-solid fa-wave-square text-m3-primary text-xs"></i> 5-Band Acoustic EQ
                    </span>
                    <span class="text-[9px] text-slate-400 font-mono">DSP</span>
                </div>
                
                <div class="grid grid-cols-5 gap-1.5 text-center text-[9px] font-mono pt-1">
                    <div class="space-y-1">
                        <input type="range" class="dt-eq-band m3-slider" data-band="0" min="-12" max="12" value="0">
                        <span class="text-slate-400 block text-[8px]">60Hz</span>
                    </div>
                    <div class="space-y-1">
                        <input type="range" class="dt-eq-band m3-slider" data-band="1" min="-12" max="12" value="0">
                        <span class="text-slate-400 block text-[8px]">230Hz</span>
                    </div>
                    <div class="space-y-1">
                        <input type="range" class="dt-eq-band m3-slider" data-band="2" min="-12" max="12" value="0">
                        <span class="text-slate-400 block text-[8px]">910Hz</span>
                    </div>
                    <div class="space-y-1">
                        <input type="range" class="dt-eq-band m3-slider" data-band="3" min="-12" max="12" value="0">
                        <span class="text-slate-400 block text-[8px]">4kHz</span>
                    </div>
                    <div class="space-y-1">
                        <input type="range" class="dt-eq-band m3-slider" data-band="4" min="-12" max="12" value="0">
                        <span class="text-slate-400 block text-[8px]">14kHz</span>
                    </div>
                </div>
            </div>

        </aside>

    </div>

    <!-- Soft Spectrum Visualizer Bar Strip -->
    <div class="w-full flex-shrink-0 z-20 px-0 pointer-events-none -mb-1" id="bar-viz-wrapper">
        <canvas id="viz-canvas-bar"></canvas>
    </div>

    <!-- Material Player Control Footer Console -->
    <footer class="m3-footer-surface px-4 sm:px-6 pt-2.5 pb-3 max-w-[1700px] mx-auto w-full">
    <div class="max-w-6xl mx-auto space-y-3">
        
        <!-- Time Scrubber -->
        <div class="space-y-0.5">
            <input type="range" id="audio-scrubber" class="m3-slider" value="0" min="0" max="100" step="0.1">
            <div class="flex justify-between text-[10px] md:text-xs font-mono font-bold text-slate-400 px-0.5">
                <span id="curr-time">00:00</span>
                <span id="dur-time">00:00</span>
            </div>
        </div>

        <!-- MOBILE-ONLY TOP ROW (Loop Mode Left, Sync Offset Right Above Next Track) -->
        <div class="flex sm:hidden items-center justify-between px-1">
            <button id="btn-loop-mode" class="ctrl-btn px-3 py-1.5 text-xs font-semibold gap-1.5 relative bg-white/5 border border-white/10">
                <i class="fa-solid fa-repeat text-xs" id="loop-mode-icon"></i>
                <span id="loop-mode-text" class="text-[10px] font-bold">Off</span>
                <span id="loop-mode-badge" class="hidden absolute -top-1 -right-1 w-3.5 h-3.5 bg-sky-400 text-slate-950 rounded-full text-[8px] font-extrabold items-center justify-center">1</span>
            </button>

            <!-- Offset shifted right side above Next Track button -->
            <button id="btn-offset-modal" class="ctrl-btn px-3 py-1.5 text-xs font-mono font-bold gap-1.5 bg-white/5 border border-white/10 active:scale-95">
                <i class="fa-solid fa-clock-rotate-left text-xs text-m3-primary"></i>
                <span id="offset-indicator" class="text-[11px]">0.0s</span>
            </button>
        </div>

                                <!-- DESKTOP ONE-LINE ROW CONTROLS (Strictly Centered Grid) -->
        <div class="hidden sm:grid sm:grid-cols-3 items-center gap-4 px-2 w-full">
            
            <!-- 1. Left Corner: Shuffle / Repeat Button -->
            <div class="flex items-center justify-start">
                <button id="btn-loop-mode-dt" class="ctrl-btn w-28 min-w-[7rem] py-2 text-xs font-semibold gap-2 bg-white/5 border border-white/10 hover:bg-white/10 justify-center shrink-0" onclick="document.getElementById('btn-loop-mode').click()">
                    <i class="fa-solid fa-repeat text-sm" id="loop-mode-icon-dt"></i>
                    <span class="text-xs font-bold" id="loop-mode-text-dt">Off</span>
                </button>
            </div>

            <!-- 2. Center: Playback Buttons (Strictly Centered) -->
            <div class="flex items-center justify-center gap-3">
                <button id="btn-prev-track" class="ctrl-btn w-10 h-10 text-slate-200 hover:scale-105 active:scale-95" title="Previous Track">
                    <i class="fa-solid fa-backward-step text-base"></i>
                </button>

                <button id="btn-rewind" class="ctrl-btn w-10 h-10 text-slate-300 hover:text-white hover:scale-105 active:scale-95" title="Rewind 5s">
                    -5s
                </button>

                <button id="btn-play-pause" class="w-12 h-12 rounded-2xl bg-m3-primary text-slate-950 font-bold flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all" title="Play / Pause">
                    <i class="fa-solid fa-play text-lg play-icon-target" id="play-icon"></i>
                    <i class="fa-solid fa-pause text-lg pause-icon-target hidden" id="pause-icon"></i>
                </button>

                <button id="btn-forward" class="ctrl-btn w-10 h-10 text-slate-300 hover:text-white hover:scale-105 active:scale-95" title="Forward 5s">
                    +5s
                </button>

                <button id="btn-next-track" class="ctrl-btn w-10 h-10 text-slate-200 hover:scale-105 active:scale-95" title="Next Track">
                    <i class="fa-solid fa-forward-step text-base"></i>
                </button>
            </div>

            <!-- 3. Right Corner: Offset & Volume Controls -->
            <div class="flex items-center justify-end gap-3">
                <!-- Sync Offset Modal Trigger -->
                <button id="btn-offset-modal" class="ctrl-btn px-3 py-2 text-xs font-mono font-bold gap-1.5 bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95">
                    <i class="fa-solid fa-clock-rotate-left text-xs text-m3-primary"></i>
                    <span id="offset-indicator" class="text-[11px]">0.0s</span>
                </button>

                <!-- Volume Slider Control -->
                <div class="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                    <button id="btn-mute" class="text-slate-300 hover:text-white flex items-center justify-center">
                        <i class="fa-solid fa-volume-high text-sky-400 text-xs" id="vol-icon"></i>
                    </button>
                    <input type="range" id="volume-slider" class="m3-slider w-20" min="0" max="1" step="0.01" value="1">
                </div>
            </div>

        </div>


        <!-- MOBILE PLAYBACK CONTROLS -->
        <div class="flex sm:hidden items-center justify-between px-2 pt-1">
            <button id="btn-prev-track-mob" class="ctrl-btn w-11 h-11 text-slate-200" onclick="document.getElementById('btn-prev-track').click()">
                <i class="fa-solid fa-backward-step text-base"></i>
            </button>
            <button id="btn-rewind-mob" class="ctrl-btn w-11 h-11 font-mono text-xs font-extrabold text-slate-300" onclick="document.getElementById('btn-rewind').click()">-5s</button>
            
            <button id="btn-play-pause-mob" class="w-14 h-14 rounded-full bg-m3-primary text-slate-950 flex items-center justify-center shadow-lg active:scale-90" onclick="document.getElementById('btn-play-pause').click()">
    <i class="fa-solid fa-play text-lg ml-0.5 play-icon-target"></i>
    <i class="fa-solid fa-pause text-lg hidden pause-icon-target"></i>
</button>


            <button id="btn-forward-mob" class="ctrl-btn w-11 h-11 font-mono text-xs font-extrabold text-slate-300" onclick="document.getElementById('btn-forward').click()">+5s</button>
            <button id="btn-next-track-mob" class="ctrl-btn w-11 h-11 text-slate-200" onclick="document.getElementById('btn-next-track').click()">
                <i class="fa-solid fa-forward-step text-base"></i>
            </button>
        </div>

    </div>
</footer>

    <!-- MUSIC LIBRARY BOTTOM SHEET MODAL WITH SEARCH -->
    <div id="library-sheet" class="sheet-overlay">
        <div class="m3-bottom-sheet">
            <div class="w-12 h-1.5 bg-white/20 rounded-full mx-auto my-3 shrink-0 sm:hidden"></div>
            
            <div class="px-6 py-3 sm:pt-5 flex items-center justify-between border-b border-white/10 shrink-0">
                <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                        <i class="fa-solid fa-music text-xs"></i>
                    </div>
                    <div>
                        <h2 class="text-sm md:text-base font-extrabold text-white tracking-tight">Music Library</h2>
                        <p class="text-[10px] md:text-xs text-slate-400">Select a song to load audio & synced lyrics</p>
                    </div>
                </div>
                <button class="close-library-btn w-8 h-8 rounded-full bg-white/5 text-slate-400 hover:text-white flex items-center justify-center">
                    <i class="fa-solid fa-xmark text-sm"></i>
                </button>
            </div>

            <!-- Library Search Bar -->
            <div class="px-6 py-3 border-b border-white/5 bg-slate-900/40 shrink-0">
                <div class="relative flex items-center">
                    <i class="fa-solid fa-magnifying-glass absolute left-3.5 text-xs text-slate-400"></i>
                    <input type="text" id="library-search-input" placeholder="Search track name or artist..." class="m3-input pl-9 pr-8 py-2 text-xs">
                    <button id="btn-clear-library-search" class="hidden absolute right-3 text-xs text-slate-400 hover:text-white">
                        <i class="fa-solid fa-circle-xmark"></i>
                    </button>
                </div>
            </div>

            <!-- Library Song List View -->
            <div class="px-6 py-4 overflow-y-auto space-y-2 flex-1" id="playlist-container">
                <!-- Dynamically Populated by JS -->
            </div>
        </div>
    </div>

    <!-- STUDIO MATERIAL BOTTOM SHEET MODAL -->
    <div id="studio-sheet" class="sheet-overlay">
        <div class="m3-bottom-sheet">
            
            <!-- Android Sheet Drag Pill Handle -->
            <div class="w-12 h-1.5 bg-white/20 rounded-full mx-auto my-3 shrink-0 sm:hidden"></div>

            <!-- Sheet Title Header -->
            <div class="px-6 py-3 sm:pt-5 flex items-center justify-between border-b border-white/10 shrink-0">
                <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                        <i class="fa-solid fa-sliders text-xs"></i>
                    </div>
                    <div>
                        <h2 class="text-sm md:text-base font-extrabold text-white tracking-tight">Studio Dashboard</h2>
                        <p class="text-[10px] md:text-xs text-slate-400">Lyrics, Online Auto-Sync, EQ & DSP</p>
                    </div>
                </div>
                <button class="close-sheet-btn w-8 h-8 rounded-full bg-white/5 text-slate-400 hover:text-white flex items-center justify-center">
                    <i class="fa-solid fa-xmark text-sm"></i>
                </button>
            </div>

            <!-- Segmented Android Tab Bar -->
            <div class="px-6 py-2.5 bg-slate-900/60 border-b border-white/5 flex gap-2 overflow-x-auto shrink-0">
                <button class="m3-tab-pill active" data-tab="tab-source">
                    <i class="fa-solid fa-music"></i> Lyrics & Media
                </button>
                <button class="m3-tab-pill" data-tab="tab-dsp">
                    <i class="fa-solid fa-wave-square"></i> Audio FX & EQ
                </button>
                <button class="m3-tab-pill" data-tab="tab-editor">
                    <i class="fa-solid fa-file-export"></i> Export & Copy
                </button>
                <button class="m3-tab-pill" data-tab="tab-prefs">
                    <i class="fa-solid fa-gear"></i> Preferences
                </button>
                <button class="m3-tab-pill" data-tab="tab-about">
                    <i class="fa-solid fa-circle-info"></i> About
                </button>
            </div>

            <!-- Tab Content Container -->
            <div id="studio-tab-container" class="px-6 py-4 overflow-y-auto space-y-2 flex-1">

                <!-- TAB 1: LYRICS & MEDIA -->
                <div id="tab-source" class="tab-pane space-y-4">
                    
                    <!-- 1. Audio Track Chooser -->
                    <div class="m3-list-row">
                        <div class="min-w-0 flex-1">
                            <span class="text-[10px] font-bold text-sky-400 uppercase tracking-wider block">1. Audio Source</span>
                            <p id="lbl-audio-name" class="text-xs font-semibold text-slate-200 truncate">Choose Local MP3 / WAV Track</p>
                        </div>
                        <label class="px-4 py-2 bg-sky-500 text-slate-950 font-extrabold rounded-xl text-xs cursor-pointer shrink-0">
                            <input type="file" id="audio-file-input" accept="audio/*" class="hidden">
                            Browse
                        </label>
                    </div>

                    <!-- 2. Auto Online Synced LRC Finder -->
                    <div class="py-3 border-b border-white/10 space-y-2.5">
                        <div class="flex items-center justify-between">
                            <span class="text-[10px] font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                                <i class="fa-solid fa-wand-magic-sparkles"></i> 2. Auto Online Synced LRC Finder
                            </span>
                            <span class="text-[9px] bg-sky-500/20 text-sky-300 font-extrabold px-2 py-0.5 rounded-full">LRCLIB Engine</span>
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input type="text" id="online-song-input" placeholder="Track Name *" class="m3-input">
                            <input type="text" id="online-artist-input" placeholder="Artist Name (Optional)" class="m3-input">
                        </div>

                        <button id="btn-fetch-online-lrc" class="w-full py-3 bg-sky-500 text-slate-950 font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98">
                            <i class="fa-solid fa-magnifying-glass text-xs"></i> Fetch & Auto-Sync Lyrics
                        </button>

                        <p id="online-fetch-status" class="text-[10px] font-semibold text-slate-400 hidden"></p>
                    </div>

                    <!-- 3. Local LRC File Upload -->
                    <div class="m3-list-row">
                        <div class="min-w-0 flex-1">
                            <span class="text-[10px] font-bold text-sky-400 uppercase tracking-wider block">3. Local LRC File</span>
                            <p id="lbl-lrc-name" class="text-xs font-semibold text-slate-200 truncate">Choose Local .lrc or .txt File</p>
                        </div>
                        <label class="px-4 py-2 bg-white/10 text-slate-200 font-extrabold rounded-xl text-xs cursor-pointer shrink-0">
                            <input type="file" id="lrc-file-input" accept=".lrc,.txt" class="hidden">
                            Upload
                        </label>
                    </div>

                    <!-- 4. Direct Text Input -->
                    <div class="py-2 space-y-1.5">
                        <div class="flex justify-between items-center">
                            <span class="text-[10px] font-bold text-sky-400 uppercase tracking-wider block">4. Raw Lyrics Text Editor</span>
                            <button id="btn-clear-lyrics" class="text-[10px] text-slate-500 hover:text-slate-300 underline">Clear</button>
                        </div>
                        <textarea id="raw-lrc-input" rows="3" placeholder="[00:02.00] Paste lyrics text with or without timestamps..." class="m3-input font-mono text-xs resize-none"></textarea>
                    </div>

                    <!-- 5. Demo Loader -->
                    <button id="btn-load-demo" class="w-full py-3 bg-white/5 hover:bg-white/10 text-slate-200 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all">
                        <i class="fa-solid fa-circle-play text-sky-400"></i> Load Demo Music & Synced Lyrics
                    </button>

                </div>

                <!-- TAB 2: DSP AUDIO EQUALIZER & EFFECTS -->
                <div id="tab-dsp" class="tab-pane hidden space-y-4">
                    
                    <!-- Presets Selector -->
                    <div class="space-y-2">
                        <span class="text-[10px] font-bold text-sky-400 uppercase tracking-wider block">Equalizer Presets</span>
                        <div class="grid grid-cols-3 gap-2" id="eq-presets">
                            <button class="eq-preset-btn m3-tab-pill active justify-center" data-preset="flat">Flat</button>
                            <button class="eq-preset-btn m3-tab-pill justify-center" data-preset="bass">Bass Boost</button>
                            <button class="eq-preset-btn m3-tab-pill justify-center" data-preset="vocal">Vocal Clarity</button>
                            <button class="eq-preset-btn m3-tab-pill justify-center" data-preset="treble">Treble Boost</button>
                            <button class="eq-preset-btn m3-tab-pill justify-center" data-preset="electronic">Electronic</button>
                            <button class="eq-preset-btn m3-tab-pill justify-center" data-preset="rock">Rock / Pop</button>
                        </div>
                    </div>

                    <!-- 5-Band Equalizer Sliders -->
                    <div class="py-3 border-y border-white/10 space-y-3">
                        <span class="text-xs font-extrabold text-slate-200 block">5-Band Equalizer (dB)</span>
                        
                        <div class="grid grid-cols-5 gap-2 text-center text-[10px] font-mono">
                            <div class="space-y-1">
                                <input type="range" class="eq-band m3-slider" data-band="0" min="-12" max="12" value="0">
                                <span class="text-slate-400 block mt-1">60Hz</span>
                            </div>
                            <div class="space-y-1">
                                <input type="range" class="eq-band m3-slider" data-band="1" min="-12" max="12" value="0">
                                <span class="text-slate-400 block mt-1">230Hz</span>
                            </div>
                            <div class="space-y-1">
                                <input type="range" class="eq-band m3-slider" data-band="2" min="-12" max="12" value="0">
                                <span class="text-slate-400 block mt-1">910Hz</span>
                            </div>
                            <div class="space-y-1">
                                <input type="range" class="eq-band m3-slider" data-band="3" min="-12" max="12" value="0">
                                <span class="text-slate-400 block mt-1">4kHz</span>
                            </div>
                            <div class="space-y-1">
                                <input type="range" class="eq-band m3-slider" data-band="4" min="-12" max="12" value="0">
                                <span class="text-slate-400 block mt-1">14kHz</span>
                            </div>
                        </div>
                    </div>

                    <!-- Pitch / Speed Controls -->
                    <div class="py-2 space-y-2">
                        <div class="flex justify-between items-center text-xs font-bold text-slate-200">
                            <span>Playback Speed</span>
                            <span id="speed-val" class="font-mono text-sky-400">1.0x</span>
                        </div>
                        <input type="range" id="speed-slider" class="m3-slider" min="0.5" max="2.0" step="0.05" value="1.0">
                    </div>

                </div>

                <!-- TAB 3: EXPORT & COPY LRC TOOL -->
                <div id="tab-editor" class="tab-pane hidden space-y-4">
                    <div class="py-2 space-y-3">
                        <div class="flex justify-between items-center">
                            <span class="text-xs font-extrabold text-sky-400">LRC Export & Copy Tools</span>
                            <span class="text-[9px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full font-bold">LRC Studio</span>
                        </div>
                        <p class="text-[11px] text-slate-400 leading-relaxed">
                            Export your synchronized lyrics to a standard <strong>.LRC</strong> file or copy the raw timestamped text to your clipboard.
                        </p>

                        <div class="flex gap-2 pt-2">
                            <button id="btn-export-lrc" class="flex-1 py-3 bg-sky-500 text-slate-950 text-xs font-extrabold rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2">
                                <i class="fa-solid fa-download text-sm"></i> Export .LRC
                            </button>
                            <button id="btn-copy-lrc" class="flex-1 py-3 bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-bold rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-95">
                                <i class="fa-solid fa-copy text-sm"></i> Copy Text
                            </button>
                        </div>
                    </div>
                </div>

                <!-- TAB 4: PREFERENCES, SLEEP TIMER & THEMES -->
                <div id="tab-prefs" class="tab-pane hidden space-y-4">
                    
                    <!-- 1. ALWAYS DISPLAY ON FEATURE -->
                    <div class="m3-list-row">
                        <div class="min-w-0 flex-1">
                            <span class="text-xs font-bold text-slate-200 block">Always Display On</span>
                            <p class="text-[10px] text-slate-400">Keep screen awake while viewing lyrics</p>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer shrink-0">
                            <input type="checkbox" id="wake-lock-toggle" class="sr-only peer" checked>
                            <div class="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
                        </label>
                    </div>

                    <!-- 2. SLEEP TIMER SECTION -->
                    <div class="py-3 border-y border-white/10 space-y-3">
                        <div class="flex justify-between items-center">
                            <div>
                                <span class="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                                    <i class="fa-solid fa-moon text-sky-400"></i> Sleep Mode Timer
                                </span>
                                <p id="pref-sleep-status" class="text-[10px] text-slate-400 mt-0.5">Automatically pauses playback when expired</p>
                            </div>
                            <span id="pref-sleep-countdown" class="hidden text-xs font-mono font-extrabold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">00:00</span>
                        </div>

                        <div class="grid grid-cols-4 gap-2" id="sleep-options">
                            <button class="m3-tab-pill justify-center text-xs py-2 sleep-btn" data-time="15">15 Min</button>
                            <button class="m3-tab-pill justify-center text-xs py-2 sleep-btn" data-time="30">30 Min</button>
                            <button class="m3-tab-pill justify-center text-xs py-2 sleep-btn" data-time="45">45 Min</button>
                            <button class="m3-tab-pill justify-center text-xs py-2 sleep-btn" data-time="60">60 Min</button>
                        </div>

                        <!-- Custom Sleep Time Input & Cancel -->
                        <div class="flex gap-2">
                            <input type="number" id="custom-sleep-min" placeholder="Custom mins" class="m3-input py-2 text-xs font-mono flex-1" min="1" max="300">
                            <button id="btn-set-custom-sleep" class="px-3 py-2 bg-sky-500 text-slate-950 font-extrabold text-xs rounded-xl">Set</button>
                            <button id="btn-cancel-sleep" class="px-3 py-2 bg-red-500/20 text-red-400 font-bold text-xs rounded-xl hover:bg-red-500/30 transition-all">Off</button>
                        </div>
                    </div>

                    <!-- Visualizer Mode -->
                    <div class="space-y-2 pt-1">
                        <span class="text-[10px] font-bold text-sky-400 uppercase tracking-wider block">Visualizer Style</span>
                        <div class="grid grid-cols-3 gap-2">
                            <button class="viz-style-chip m3-tab-pill active justify-center" data-style="bars">Soft Bars</button>
                            <button class="viz-style-chip m3-tab-pill justify-center" data-style="circle">Galaxy Orbit</button>
                            <button class="viz-style-chip m3-tab-pill justify-center" data-style="off">Disabled</button>
                        </div>
                    </div>

                    <!-- Material Theme Palette Picker -->
                    <div class="m3-list-row">
                        <span class="text-xs font-bold text-slate-200">Material Theme Accent</span>
                        <div class="flex items-center gap-2" id="theme-picker">
                            <button class="w-8 h-8 rounded-xl bg-cyan-400 active:scale-90 transition-transform" data-color="#38BDF8" data-rgb="56, 189, 248" data-name="CYBER CYAN"></button>
                            <button class="w-8 h-8 rounded-xl bg-purple-500 active:scale-90 transition-transform" data-color="#A855F7" data-rgb="168, 85, 247" data-name="PLASMA PURPLE"></button>
                            <button class="w-8 h-8 rounded-xl bg-orange-500 active:scale-90 transition-transform" data-color="#F97316" data-rgb="249, 115, 22" data-name="SUNSET AMBER"></button>
                            <button class="w-8 h-8 rounded-xl bg-emerald-400 active:scale-90 transition-transform" data-color="#34D399" data-rgb="52, 211, 153" data-name="MATRIX GREEN"></button>
                            <button class="w-8 h-8 rounded-xl bg-rose-500 active:scale-90 transition-transform" data-color="#F43F5E" data-rgb="244, 63, 94" data-name="NEON ROSE"></button>
                        </div>
                    </div>

                    <!-- Typography Font Scale Slider -->
                    <div class="py-2 space-y-2">
                        <div class="flex justify-between items-center text-xs font-bold text-slate-200">
                            <span>Lyrics Typography Size</span>
                            <span id="font-scale-lbl" class="font-mono text-sky-400">1.0x</span>
                        </div>
                        <input type="range" id="font-scale-slider" class="m3-slider" min="0.7" max="1.8" step="0.05" value="1.0">
                    </div>

                    <!-- Global Sync Offset Adjustment -->
                    <div id="offset-settings-container" class="py-2 space-y-3">
                        <div class="flex justify-between items-center text-xs font-bold text-slate-200">
                            <span>Sync Offset Adjustment</span>
                            <span id="offset-val-display" class="font-mono text-sky-400">0.0s</span>
                        </div>
                        <div class="flex items-center gap-3">
                            <button id="btn-offset-minus" class="px-4 py-2 bg-white/10 text-slate-200 text-xs font-bold rounded-xl">-0.1s</button>
                            <button id="btn-offset-reset" class="flex-1 py-2 bg-white/5 text-slate-400 text-xs font-bold rounded-xl">Reset Offset</button>
                            <button id="btn-offset-plus" class="px-4 py-2 bg-white/10 text-slate-200 text-xs font-bold rounded-xl">+0.1s</button>
                        </div>
                    </div>

                    <!-- RESET PREFERENCES BUTTON -->
                    <div class="pt-3 border-t border-white/10">
                        <button id="btn-open-reset-modal" class="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-extrabold text-xs rounded-2xl border border-red-500/20 transition-all flex items-center justify-center gap-2 active:scale-98">
                            <i class="fa-solid fa-rotate-left"></i> Reset Preferences to Defaults
                        </button>
                    </div>

                </div>

                <!-- TAB 5: ABOUT & DEVELOPER INFO -->
                <div id="tab-about" class="tab-pane hidden space-y-4">
                    
                    <!-- 1. Hero Developer Profile Card -->
                    <div class="p-5 rounded-3xl theme-glass-card relative overflow-hidden flex flex-col items-center text-center space-y-3">
                        
                        <div class="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-30 pointer-events-none filter blur-2xl" style="background-color: var(--m3-primary);"></div>
                        <div class="absolute -bottom-12 -left-12 w-32 h-32 rounded-full opacity-20 pointer-events-none filter blur-2xl" style="background-color: var(--m3-primary);"></div>

                        <!-- Profile Avatar -->
                        <div class="relative group my-1">
                            <div class="profile-avatar-bg relative z-10 flex items-center justify-center"></div>
                            <div class="absolute -inset-1 rounded-full opacity-40 blur-md pointer-events-none" style="background-color: var(--m3-primary);"></div>
                        </div>

                        <!-- Developer Info -->
                        <div class="space-y-1 z-10">
                            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase border" style="background-color: rgba(var(--m3-primary-rgb), 0.12); border-color: rgba(var(--m3-primary-rgb), 0.3); color: var(--m3-primary);">
                                <i class="fa-solid fa-code text-[9px]"></i> Lead Developer & Architect
                            </div>
                            <h3 class="text-lg font-black text-white tracking-tight pt-1">Tabib Imran</h3>
                            <p class="text-xs text-slate-300 max-w-md leading-relaxed">
                                Crafting immersive, ultra-responsive web audio environments and studio-grade lyrics engine architectures.
                            </p>
                        </div>

                        <!-- System Pills -->
                        <div class="flex items-center gap-2 pt-1 z-10 flex-wrap justify-center">
                            <span class="px-3 py-1 rounded-xl text-[10px] font-bold bg-white/5 border border-white/10 text-slate-300 flex items-center gap-1.5">
                                <i class="fa-solid fa-bolt text-amber-400"></i> Web Audio API
                            </span>
                            <span class="px-3 py-1 rounded-xl text-[10px] font-bold bg-white/5 border border-white/10 text-slate-300 flex items-center gap-1.5">
                                <i class="fa-solid fa-layer-group text-sky-400"></i> Material 3
                            </span>
                            <span class="px-3 py-1 rounded-xl text-[10px] font-bold bg-white/5 border border-white/10 text-slate-300 flex items-center gap-1.5">
                                <i class="fa-solid fa-wand-magic-sparkles text-purple-400"></i> DSP Audio FX
                            </span>
                        </div>
                    </div>

                    <!-- 2. Studio Application Overview -->
                    <div class="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
                        <div class="flex items-center justify-between">
                            <span class="text-xs font-black uppercase tracking-wider flex items-center gap-2" style="color: var(--m3-primary);">
                                <i class="fa-solid fa-sliders"></i> Lyrics Flow Pro - Studio Edition
                            </span>
                            <span class="text-[9px] font-mono font-bold px-2 py-0.5 rounded-md bg-white/10 text-slate-300">v2.5.0 Pro</span>
                        </div>
                        <p class="text-xs text-slate-300 leading-relaxed">
                            A state-of-the-art Web Audio Player engineered for high-precision timestamped LRC synchronization, live frequency spectrum visualization, multi-preset 5-band parametric equalizer, and customizable dynamic color themes.
                        </p>
                    </div>

                    <!-- 3. Feature Highlights Matrix -->
                    <div class="space-y-2">
                        <span class="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block px-0.5">Core System Capabilities</span>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            
                            <div class="p-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/15 transition-all flex items-start gap-3">
                                <div class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style="background-color: rgba(var(--m3-primary-rgb), 0.15); color: var(--m3-primary);">
                                    <i class="fa-solid fa-cloud-arrow-down text-xs"></i>
                                </div>
                                <div class="space-y-0.5">
                                    <h4 class="font-bold text-slate-100">LRCLIB Cloud Sync</h4>
                                    <p class="text-[10px] text-slate-400 leading-normal">Automatic fetching & alignment for synchronized song lyrics.</p>
                                </div>
                            </div>

                            <div class="p-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/15 transition-all flex items-start gap-3">
                                <div class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style="background-color: rgba(var(--m3-primary-rgb), 0.15); color: var(--m3-primary);">
                                    <i class="fa-solid fa-wave-square text-xs"></i>
                                </div>
                                <div class="space-y-0.5">
                                    <h4 class="font-bold text-slate-100">5-Band Acoustic EQ</h4>
                                    <p class="text-[10px] text-slate-400 leading-normal">Biquad filter DSP processing with custom presets.</p>
                                </div>
                            </div>

                            <div class="p-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/15 transition-all flex items-start gap-3">
                                <div class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style="background-color: rgba(var(--m3-primary-rgb), 0.15); color: var(--m3-primary);">
                                    <i class="fa-solid fa-palette text-xs"></i>
                                </div>
                                <div class="space-y-0.5">
                                    <h4 class="font-bold text-slate-100">Dynamic Material Themes</h4>
                                    <p class="text-[10px] text-slate-400 leading-normal">Adaptive palette shifting with responsive neon accents.</p>
                                </div>
                            </div>

                            <div class="p-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/15 transition-all flex items-start gap-3">
                                <div class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style="background-color: rgba(var(--m3-primary-rgb), 0.15); color: var(--m3-primary);">
                                    <i class="fa-solid fa-moon text-xs"></i>
                                </div>
                                <div class="space-y-0.5">
                                    <h4 class="font-bold text-slate-100">Sleep Mode Timer</h4>
                                    <p class="text-[10px] text-slate-400 leading-normal">Automated playback timeout with visual countdown badge.</p>
                                </div>
                            </div>

                        </div>
                    </div>

                    <!-- 4. Studio Technical Engine Specs -->
                    <div class="pt-3 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span class="flex items-center gap-1">
                            <i class="fa-solid fa-microchip text-[9px]" style="color: var(--m3-primary);"></i> HTML5 / WebAudio DSP
                        </span>
                        <span>Designed by Tabib Imran</span>
                    </div>

                </div>

            </div>

            <!-- Apply CTA Button -->
            <div class="p-4 border-t border-white/10 shrink-0">
                <button id="btn-apply-done" class="w-full py-3.5 bg-sky-500 text-slate-950 font-extrabold uppercase tracking-wider text-xs rounded-2xl shadow-lg active:scale-98 transition-all">
                    Apply & Done
                </button>
            </div>

        </div>
    </div>

    <!-- RESET CONFIRMATION MODAL DIALOG -->
    <div id="reset-dialog" class="dialog-overlay">
        <div class="m3-dialog space-y-4">
            <div class="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 text-xl mx-auto">
                <i class="fa-solid fa-triangle-exclamation"></i>
            </div>
            <div class="text-center space-y-1">
                <h3 class="text-base font-extrabold text-white">Reset Preferences?</h3>
                <p class="text-xs text-slate-400 leading-relaxed">
                    This will restore all default preferences, theme colors, equalizer gains, and clear stored preferences.
                </p>
            </div>
            <div class="flex gap-2 pt-2">
                <button id="btn-cancel-reset" class="flex-1 py-2.5 bg-white/10 hover:bg-white/15 text-slate-300 font-bold text-xs rounded-xl transition-all">
                    Cancel
                </button>
                <button id="btn-confirm-reset" class="flex-1 py-2.5 bg-red-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-red-500/25 active:scale-95 transition-all">
                    Yes, Reset
                </button>
            </div>
        </div>
    </div>

    <audio id="audio-player" crossorigin="anonymous"></audio>

    <script src="Data/musicData.js"></script>

    <!-- Preloader Minimum 3-Seconds Logic Script -->
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const preloader = document.getElementById('preloader');
            const progressFill = document.getElementById('loader-progress');
            const startTime = Date.now();
            const minDuration = 3000; // Minimum 3 seconds

            const updateProgress = () => {
                const elapsedTime = Date.now() - startTime;
                const percentage = Math.min((elapsedTime / minDuration) * 100, 100);
                if (progressFill) progressFill.style.width = percentage + '%';

                if (elapsedTime < minDuration) {
                    requestAnimationFrame(updateProgress);
                } else {
                    if (preloader) {
                        preloader.classList.add('fade-out');
                        setTimeout(() => preloader.remove(), 600);
                    }
                }
            };

            requestAnimationFrame(updateProgress);
        });
    </script>

    <!-- MAIN APP ENGINE -->
    <script src="js/engine.js"></script>

</body>
</html>
`);
document.close();




