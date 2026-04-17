// Remove anti-FOUC hidden state right before JS animations start
document.documentElement.classList.remove('js-loading');

// GSAP Animation for header entrance - with error handling
// Smoothly slides the header from the top on load
if (typeof gsap !== 'undefined') {
    try {
        gsap.from('.header', { y: -50, opacity: 0, duration: 1, ease: 'expo.out', clearProps: 'all' });
    } catch (error) {
        console.warn('GSAP animation failed, continuing without animations:', error);
    }
} else {
    console.warn('GSAP not loaded, skipping animations');
}

// Entrance animations for main content sections - with error handling
// Creates staggered entrance animations for main sections
if (typeof gsap !== 'undefined') {
    try {
        gsap.from([".left-section", ".right-section", ".terminal-container"], {
            opacity: 0,
            y: 30,
            duration: 1.0,
            ease: "power2.out",
            stagger: 0.15,
            clearProps: "all"
        });
    } catch (error) {
        console.warn('GSAP content animations failed:', error);
    }
}

// Particle.js configuration - Optimized for maximum performance
// Defines the base configuration for the particles.js background animation
const particleConfigBase = {
    particles: {
        number: { value: 120, density: { enable: true, value_area: 1200 } }, // Reduced particles for performance
        shape: { type: 'circle' }, // Particle shape
        opacity: {
            value: 0.6, // Slightly reduced for better performance
            random: false, // Disable random for performance
            anim: { enable: false } // Disable opacity animation for performance
        },
        size: { value: 2.2, random: true, anim: { enable: false } }, // Disable size animation
        line_linked: { enable: true, distance: 100, opacity: 0.4, width: 1 }, // Reduced distance and opacity
        move: { 
            enable: true, 
            speed: 1.2, // Slightly slower for smoother performance
            direction: 'none', 
            random: false, // More predictable movement
            straight: false,
            out_mode: 'bounce',
            bounce: false // Disable bounce calculations
        }
    },
    interactivity: {
        detect_on: 'window',
        events: {
            onhover: { enable: true, mode: 'grab' },
            onclick: { enable: true, mode: 'push' },
            resize: true
        },
        modes: {
            grab: { distance: 60, line_linked: { opacity: 0.6 } }, // Reduced grab distance
            push: { particles_nb: 1 }
        }
    },
    retina_detect: true,
    fps_limit: 30 // Increased FPS for smoother experience
};

let initialWindowArea; // Yeniden boyutlandırma hesaplamaları için başlangıç pencere alanını depolar
let initialParticleCanvasArea; // Yoğunluk ölçeklemesi için başlangıç particles.js canvas alanını depolar

/**
 * Initializes or updates particles.js with the given color.
 * Dynamically adjusts particle count, size, and line distance based on screen size and device capabilities.
 * Ensures the canvas does not block pointer events and interaction settings are applied correctly.
 * @param {string} particleColor - Color value to apply to particles/lines.
 */
function initializeParticles(particleColor) {
    let pJSInstance;

    // particles.js zaten başlatıldı mı kontrol et
    if (window.pJSDom && window.pJSDom[0] && window.pJSDom[0].pJS) {
        pJSInstance = window.pJSDom[0].pJS;
        // Update particle and line colors
        pJSInstance.particles.color.value = particleColor;
        if (pJSInstance.particles.line_linked) {
            pJSInstance.particles.line_linked.color = particleColor;
        }

        // --- Update interaction settings for the existing instance ---
        pJSInstance.interactivity.events.onclick.enable = particleConfigBase.interactivity.events.onclick.enable;
        pJSInstance.interactivity.modes.push.particles_nb = particleConfigBase.interactivity.modes.push.particles_nb;
        pJSInstance.interactivity.events.onhover.enable = particleConfigBase.interactivity.events.onhover.enable;
        pJSInstance.interactivity.modes.grab.distance = particleConfigBase.interactivity.modes.grab.distance;
        pJSInstance.interactivity.modes.grab.line_linked.opacity = particleConfigBase.interactivity.modes.grab.line_linked.opacity;

        // Apply desired opacity values
        pJSInstance.particles.opacity.value = particleConfigBase.particles.opacity.value;
        if (pJSInstance.particles.line_linked) {
            pJSInstance.particles.line_linked.opacity = particleConfigBase.particles.line_linked.opacity;
        }

        let targetParticleCount = 0;
        let targetParticleSize = particleConfigBase.particles.size.value; // From base config
        let targetLineDistance = particleConfigBase.particles.line_linked.distance; // From base config

        // Optimized particle count/size/line distance for performance
        const screenWidth = window.innerWidth;
        if (screenWidth >= 1920) {
            targetParticleCount = 180; // Reduced for performance
            targetParticleSize = 2.2;
            targetLineDistance = 100;
        } else if (screenWidth >= 1440) {
            targetParticleCount = 150;
            targetParticleSize = 2.1;
            targetLineDistance = 95;
        } else if (screenWidth >= 1024) {
            targetParticleCount = 120;
            targetParticleSize = 2.0;
            targetLineDistance = 90;
        } else if (screenWidth >= 768) {
            targetParticleCount = 100; // Optimized for tablets
            targetParticleSize = 1.8;
            targetLineDistance = 80;
        } else if (screenWidth >= 480) {
            targetParticleCount = 80; // Reduced for mobile performance
            targetParticleSize = 1.6;
            targetLineDistance = 70;
        } else if (screenWidth >= 320) {
            targetParticleCount = 60; // Minimal for small screens
            targetParticleSize = 1.4;
            targetLineDistance = 60;
        } else { // Very small mobile screens
            targetParticleCount = 40; // Minimal particles
            targetParticleSize = 1.2;
            targetLineDistance = 50;
        }

        // Adjust particle count by hardware performance (less aggressive)
        const cores = navigator.hardwareConcurrency;
        const memory = navigator.deviceMemory;
        if (cores && memory) { // Only adjust if both are available
            if (cores < 2 && memory < 2) {
                // 40% reduction for very low-end devices
                targetParticleCount = Math.floor(targetParticleCount * 0.6);
            } else if (cores < 4 || memory < 4) {
                // 20% reduction for low-mid devices
                targetParticleCount = Math.floor(targetParticleCount * 0.8);
            }
        }

        // Optimized particle count limits for performance
        if (targetParticleCount > 0) {
            targetParticleCount = Math.max(40, Math.min(targetParticleCount, 180));
        }

        // Parçacık sayısı, boyutu veya çizgi mesafesi değiştiyse güncelle
        const numChanged = pJSInstance.particles.number.value !== targetParticleCount;
        const sizeChanged = pJSInstance.particles.size.value !== targetParticleSize;
        const lineDistChanged = pJSInstance.particles.line_linked.distance !== targetLineDistance;

        if (numChanged || sizeChanged || lineDistChanged) {
            pJSInstance.particles.number.value = targetParticleCount;
            pJSInstance.particles.size.value = targetParticleSize;
            pJSInstance.particles.line_linked.distance = targetLineDistance;
            pJSInstance.fn.particlesRefresh(); // Sadece yenileme veya yeniden oluşturma
        } else {
            pJSInstance.fn.particlesRefresh(); // Diğer durumlar için yenileme
        }

        // --- Dynamic density adjustment for zoom/resize ---
        const currentParticleCanvasArea = pJSInstance.canvas.w * pJSInstance.canvas.h;
        if (initialParticleCanvasArea === undefined || initialParticleCanvasArea === 0) {
            initialParticleCanvasArea = currentParticleCanvasArea;
            if (initialParticleCanvasArea === 0) initialParticleCanvasArea = 1; // prevent division by zero
        }

        if (currentParticleCanvasArea > 0) {
            const baseDensityArea = particleConfigBase.particles.number.density.value_area;
            let calculatedDensityArea = baseDensityArea * (currentParticleCanvasArea / initialParticleCanvasArea);

            calculatedDensityArea = Math.max(calculatedDensityArea, 200); // Minimum density area
            calculatedDensityArea = Math.min(calculatedDensityArea, 5000); // Maximum density area

            if (pJSInstance.particles.number.density.value_area !== calculatedDensityArea) {
                pJSInstance.particles.number.density.value_area = calculatedDensityArea;
                pJSInstance.fn.particlesRefresh();
            }
        } else {
            pJSInstance.fn.particlesRefresh();
        }
        return;
    }

    // First-time initialization of particles.js
    let currentParticleConfig = JSON.parse(JSON.stringify(particleConfigBase));
    currentParticleConfig.particles.color = { value: particleColor };
    currentParticleConfig.particles.line_linked.color = particleColor;

    // Apply desired opacity values
    currentParticleConfig.particles.opacity.value = particleConfigBase.particles.opacity.value;
    currentParticleConfig.particles.line_linked.opacity = particleConfigBase.particles.line_linked.opacity;

    // Initial particle count/size/line distance based on screen and device
    let initialParticleCount = 0;
    let initialParticleSize = particleConfigBase.particles.size.value;
    let initialLineDistance = particleConfigBase.particles.line_linked.distance;

    const screenWidth = window.innerWidth;
    if (screenWidth >= 1920) {
        initialParticleCount = 260; // Üst limit olarak ayarlandı
        initialParticleSize = 2.2;
        initialLineDistance = 120;
    } else if (screenWidth >= 1440) {
        initialParticleCount = 220;
        initialParticleSize = 2.2;
        initialLineDistance = 110;
    } else if (screenWidth >= 1024) {
        initialParticleCount = 180;
        initialParticleSize = 2.0;
        initialLineDistance = 100;
    } else if (screenWidth >= 768) {
        initialParticleCount = 160; // Tabletler için artırıldı
        initialParticleSize = 1.8;
        initialLineDistance = 90;
    } else if (screenWidth >= 480) {
        initialParticleCount = 200; // Büyük mobil cihazlar için artırıldı
        initialParticleSize = 1.8; // Mobil için boyut artırıldı
        initialLineDistance = 80;
    } else if (screenWidth >= 320) {
        initialParticleCount = 180; // Standart mobil cihazlar için artırıldı
        initialParticleSize = 1.5; // Mobil için boyut artırıldı
        initialLineDistance = 70;
    } else { // Very small mobile screens
        initialParticleCount = 150; // For the smallest screens
        initialParticleSize = 1.3; // Slightly larger on mobile
        initialLineDistance = 60;
    }

    // Adjust particle count by hardware performance (less aggressive)
    const cores = navigator.hardwareConcurrency;
    const memory = navigator.deviceMemory;
    if (cores && memory) { // Sadece her iki bilgi de mevcutsa ayarla
        if (cores < 2 && memory < 2) {
            // Çok düşük seviye cihazlar için %40 azaltma
            initialParticleCount = Math.floor(initialParticleCount * 0.6);
        } else if (cores < 4 || memory < 4) {
            // Düşük-orta seviye cihazlar için %20 azaltma
            initialParticleCount = Math.floor(initialParticleCount * 0.8);
        }
    }
    
    // Optimized initial particle count limits
    if (initialParticleCount > 0) {
        initialParticleCount = Math.max(40, Math.min(initialParticleCount, 180));
    }

    currentParticleConfig.particles.number.value = initialParticleCount;
    currentParticleConfig.particles.size.value = initialParticleSize;
    currentParticleConfig.particles.line_linked.distance = initialLineDistance;
    currentParticleConfig.particles.number.density.enable = true;

    // Initialize particlesJS with error handling and dependency check
    try {
        if (typeof particlesJS === 'undefined') {
            throw new Error('particlesJS library not loaded (possibly blocked by extension)');
        }
        particlesJS('particles-js', currentParticleConfig);
    } catch (error) {
        console.warn('Particles.js fallback triggered:', error.message);
        // Fallback: apply CSS-only animated background
        const particlesContainer = document.getElementById('particles-js');
        if (particlesContainer) {
            particlesContainer.classList.add('fallback-background');
        }
        document.body.classList.add('fallback-mode');
        return;
    }

    // After init, ensure canvas does not block interactions (pointer-events) and sits behind content
    if (window.pJSDom && window.pJSDom[0] && window.pJSDom[0].pJS) {
        pJSInstance = window.pJSDom[0].pJS;

        // Capture initial canvas area for dynamic density calculations
        if (pJSInstance && initialParticleCanvasArea === undefined) {
            initialParticleCanvasArea = pJSInstance.canvas.w * pJSInstance.canvas.h;
        }

        const particlesJSElement = document.getElementById('particles-js');
        if (particlesJSElement && particlesJSElement.style) {
            particlesJSElement.style.pointerEvents = 'none';
            particlesJSElement.style.zIndex = '-1';
            particlesJSElement.style.position = 'fixed';
            particlesJSElement.style.top = '0';
            particlesJSElement.style.left = '0';
            particlesJSElement.style.width = '100%';
            particlesJSElement.style.height = '100%';
        }
    } else {
        console.error("particles.js could not be initialized!");
    }
}

// Tema değiştirme mantığı
const themeToggleButton = document.getElementById('theme-toggle');
const body = document.body;

/**
 * Seçilen temayı (açık/koyu) gövdeye uygular ve parçacık renklerini günceller.
 * @param {string} theme - Uygulanacak tema ('light' veya 'dark').
 * @param {boolean} isInitialLoad - Bu ilk sayfa yüklemesi ise true.
 */
function applyTheme(theme, isInitialLoad = false) {
    if (theme === 'light') {
        body.classList.add('light-theme');
        if (themeToggleButton) themeToggleButton.setAttribute('aria-pressed', 'true');
    } else {
        body.classList.remove('light-theme');
        if (themeToggleButton) themeToggleButton.setAttribute('aria-pressed', 'false');
    }
    localStorage.setItem('theme', theme);

    // Particles.js'i temaya uygun renkle yeniden başlat
    setTimeout(() => {
        const particleColor = getComputedStyle(body).getPropertyValue(
            theme === 'light' ? '--particle-color-light' : '--particle-color-dark'
        ).trim().replace(/\'/g, '');
         if (particleColor) {
            initializeParticles(particleColor);
        } else {
            initializeParticles(theme === 'light' ? '#8B4513' : '#ffffff');
        }
    }, 50);
}

// Tema değiştirme düğmesi için olay dinleyicisi
if (themeToggleButton) {
    themeToggleButton.addEventListener('click', () => {
        const currentTheme = body.classList.contains('light-theme') ? 'light' : 'dark';
        applyTheme(currentTheme === 'light' ? 'dark' : 'light', false);
    });
}

// Page visibility: static English offline title
document.addEventListener('visibilitychange', () => {
    document.title = document.hidden ? 'System Offline!' : 'LowAir';
});

/**
 * Debounce helper to limit how often a function can run.
 * @param {function} func
 * @param {number} wait
 * @param {boolean} immediate
 * @returns {function}
 */
function debounce(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};

// Heavily debounced resize handler for maximum performance
const handleResize = debounce(function() {
    // Only update if window area changed significantly (>15%)
    const currentWindowArea = window.innerWidth * window.innerHeight;
    const areaChangePercent = Math.abs(currentWindowArea - initialWindowArea) / initialWindowArea;
    
    if (areaChangePercent > 0.15) {
        const currentTheme = localStorage.getItem('theme') || 'dark';
        const particleColor = getComputedStyle(body).getPropertyValue(
            currentTheme === 'light' ? '--particle-color-light' : '--particle-color-dark'
        ).trim().replace(/'/g, '');
        initializeParticles(particleColor);
        initialWindowArea = currentWindowArea;
    }
}, 500); // Increased debounce for better performance

// Add resize listener
window.addEventListener('resize', handleResize);



// === Session ID Copy (global — called from onclick in HTML) ===
function copySessionID() {
    const FIXED_SESSION_ID = '0500d49ca2b7d6e4149e53e8eba080f0b3795af952810f19bc21882121a7a4e760';

    navigator.clipboard.writeText(FIXED_SESSION_ID).then(function() {
        const el = document.getElementById('session-copied');
        if (el) {
            el.style.display = 'inline';
            setTimeout(() => { el.style.display = 'none'; }, 2000);
        }
    }).catch(function() {
        // Fallback for older browsers / iOS WebView
        const textArea = document.createElement('textarea');
        textArea.value = FIXED_SESSION_ID;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        const el = document.getElementById('session-copied');
        if (el) {
            el.style.display = 'inline';
            setTimeout(() => { el.style.display = 'none'; }, 2000);
        }
    });
}

// === Audio Player Control (global — called from onclick in HTML) ===
let audioPlaying = false;
let audioElement = null;

function toggleAudio() {
    try {
        if (!audioElement) {
            audioElement = document.getElementById('background-audio');
        }
        if (!audioElement) return;

        const vocalizer = document.getElementById('audio-vocalizer');
        const playBtn = vocalizer ? vocalizer.querySelector('.vocalizer-play-btn') : null;

        const playSVG = `<svg viewBox="0 0 448 512" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L448 256 73 39z"/></svg>`;
        const pauseSVG = `<svg viewBox="0 0 448 512" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M48 64C21.5 64 0 85.5 0 112V400c0 26.5 21.5 48 48 48H144c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zm192 0c-26.5 0-48 21.5-48 48V400c0 26.5 21.5 48 48 48H384c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H288z"/></svg>`;

        if (audioPlaying) {
            audioElement.pause();
            audioPlaying = false;
            if (vocalizer) vocalizer.classList.remove('playing');
            if (playBtn) playBtn.innerHTML = playSVG;
            try {
                localStorage.setItem('audioPlaying', 'false');
                localStorage.setItem('audioCurrentTime', audioElement.currentTime);
            } catch (e) { /* localStorage unavailable */ }
        } else {
            audioElement.volume = 0.3;

            // Resume from saved position
            try {
                const savedTime = localStorage.getItem('audioCurrentTime');
                if (savedTime && !isNaN(parseFloat(savedTime)) && parseFloat(savedTime) >= 0) {
                    audioElement.currentTime = Math.min(parseFloat(savedTime), audioElement.duration || 0);
                }
            } catch (e) { /* localStorage unavailable */ }

            var playPromise = audioElement.play();
            // .then() only exists on modern browsers
            if (playPromise !== undefined && typeof playPromise.then === 'function') {
                playPromise.then(function() {
                    audioPlaying = true;
                    if (vocalizer) vocalizer.classList.add('playing');
                    if (playBtn) playBtn.innerHTML = pauseSVG;
                    try { localStorage.setItem('audioPlaying', 'true'); } catch (e) { /* */ }
                }).catch(function() { /* Autoplay blocked or audio error */ });
            } else {
                // Older browser: assume success
                audioPlaying = true;
                if (vocalizer) vocalizer.classList.add('playing');
                if (playBtn) playBtn.innerHTML = pauseSVG;
            }
        }
    } catch (error) { /* Audio control error */ }
}

// === Main Initialization ===
document.addEventListener('DOMContentLoaded', () => {
    initialWindowArea = window.innerWidth * window.innerHeight;

    // Apply saved theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(savedTheme, true);

    if (document.hidden) {
        document.title = 'System Offline!';
    }

    // Start initial setup
    const staticDateElement = document.getElementById('static-date');
    if (staticDateElement) {
        const now = new Date();
        const istanbulTime = new Date(now.getTime() + (3 * 60 * 60 * 1000));
        const year = istanbulTime.getUTCFullYear();
        const month = String(istanbulTime.getUTCMonth() + 1).padStart(2, '0');
        const day = String(istanbulTime.getUTCDate()).padStart(2, '0');
        const hours = String(istanbulTime.getUTCHours()).padStart(2, '0');
        const minutes = String(istanbulTime.getUTCMinutes()).padStart(2, '0');
        staticDateElement.textContent = `${year}-${month}-${day} ${hours}:${minutes}`;
    }

    if (document.hidden) {
        document.title = 'System Offline!';
    }

    // Initialize audio state
    const audio = document.getElementById('background-audio');
    const vocalizer = document.getElementById('audio-vocalizer');

    if (audio) {
        audio.volume = 0.3;

        // Save current time periodically (throttled)
        let lastSaveTime = 0;
        audio.addEventListener('timeupdate', function() {
            if (audioPlaying && Date.now() - lastSaveTime > 1000) {
                try {
                    localStorage.setItem('audioCurrentTime', audio.currentTime);
                    lastSaveTime = Date.now();
                } catch (e) { /* localStorage unavailable */ }
            }
        });

        // Hide vocalizer if audio fails to load
        audio.addEventListener('error', function() {
            if (vocalizer) vocalizer.style.display = 'none';
        });

        // Restore saved position (don't auto-play)
        try {
            const savedTime = localStorage.getItem('audioCurrentTime');
            if (savedTime && !isNaN(parseFloat(savedTime))) {
                audio.currentTime = parseFloat(savedTime);
            }
        } catch (e) { /* localStorage unavailable */ }
    }



    // Terminal buttons — blur after click
    ['terminal-btn-red', 'terminal-btn-yellow', 'terminal-btn-green'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', () => btn.blur());
            btn.addEventListener('mouseup', () => btn.blur());
        }
    });

    // Footer year
    const currentYearElement = document.getElementById('current-year');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }

    // Session button blur management (click handled by onclick attribute)
    const sessionCopyBtn = document.querySelector('.session-btn');
    if (sessionCopyBtn) {
        sessionCopyBtn.addEventListener('mouseup', () => sessionCopyBtn.blur());
    }

    // Theme toggle blur management
    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', () => {
            setTimeout(() => {
                themeToggleButton.blur();
                document.activeElement.blur();
            }, 50);
        });
        themeToggleButton.addEventListener('mouseup', () => themeToggleButton.blur());
        themeToggleButton.addEventListener('mouseleave', () => themeToggleButton.blur());
    }

    // Tech items tooltips are now handled entirely by CSS :hover

    // Integrated Resume Panel Logic
    // Draggable Window Logic
    function makeDraggable(element, handle) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        
        handle.onmousedown = dragMouseDown;

        function dragMouseDown(e) {
            if (window.innerWidth <= 768) return; // Disable on mobile
            e = e || window.event;
            e.preventDefault();
            // Get mouse position at startup
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
            element.classList.add('dragging');
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            // Calculate new position
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            
            // Set element's new position
            let newTop = element.offsetTop - pos2;
            let newLeft = element.offsetLeft - pos1;

            // Bounds checking (prevent dragging completely off-screen)
            const margin = 40;
            newTop = Math.max(margin, Math.min(newTop, window.innerHeight - margin));
            newLeft = Math.max(margin, Math.min(newLeft, window.innerWidth - margin));

            element.style.top = newTop + "px";
            element.style.left = newLeft + "px";
            element.style.transform = "translate(-50%, -50%)"; // Keep centered relative to new point
        }

        function closeDragElement() {
            // Stop moving when mouse button is released
            document.onmouseup = null;
            document.onmousemove = null;
            element.classList.remove('dragging');
        }
    }

    // Media fallbacks removed for privacy.

    const resumeBtn = document.getElementById('resume-btn');
    const closeResumeBtn = document.getElementById('close-resume');
    const resumePanel = document.getElementById('resume-panel');
    const resumeHeader = document.getElementById('resume-header');
    const panelBackdrop = document.getElementById('panel-backdrop');

    if (resumeBtn && resumePanel && panelBackdrop) {
        const toggleResume = (show) => {
            if (show) {
                // Reset position to center whenever opened
                resumePanel.style.top = "50%";
                resumePanel.style.left = "50%";
                resumePanel.classList.add('active');
                panelBackdrop.classList.add('active');
                document.body.style.overflow = 'hidden';
            } else {
                resumePanel.classList.remove('active');
                panelBackdrop.classList.remove('active');
                document.body.style.overflow = '';
            }
        };

        const mobileCloseResumeBtn = document.getElementById('mobile-close-resume');

        resumeBtn.addEventListener('click', () => toggleResume(true));
        closeResumeBtn.addEventListener('click', () => toggleResume(false));
        if (mobileCloseResumeBtn) {
            mobileCloseResumeBtn.addEventListener('click', () => toggleResume(false));
        }
        panelBackdrop.addEventListener('click', () => toggleResume(false));
        
        // Initialize dragging
        if (resumeHeader) {
            makeDraggable(resumePanel, resumeHeader);
        }

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && resumePanel.classList.contains('active')) {
                toggleResume(false);
            }
        });
    }

    // Mobile tap feedback for interactive elements
    const interactiveTapElements = document.querySelectorAll('.card, .skill-category, .project-item, .contact-btn, .resume-card');
    interactiveTapElements.forEach(el => {
        el.addEventListener('click', () => {
            el.classList.add('active-tap');
            setTimeout(() => el.classList.remove('active-tap'), 300);
        });
    });
});
