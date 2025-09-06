// Error handling for Chrome extensions
/* k: VGhlIHNpdGUgd2FzIGNyZWF0ZWQgYnkgVHlwaG9uNjQsIHdobyBvd25zIHRoZSBtYWluIGlkZWEgYW5kIGNvZGU6IGh0dHBzOi8vdHlwaG9uNjQuZ2l0aHViLmlvIGdpdGh1Yi5jb20vdHlwaG9uNjQ= */
// Suppress extension-related console errors
window.addEventListener('error', function(e) {
    if (e.message && e.message.includes('runtime.lastError')) {
        e.preventDefault();
        return false;
    }
});

// GSAP Animation for header entrance - with error handling
// Smoothly slides the header from the top on load
if (typeof gsap !== 'undefined') {
    try {
        gsap.from('.header', { y: -50, opacity: 0, duration: 1, ease: 'expo.out' });
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
        gsap.from(".left-section", { opacity: 0, y: 50, duration: 1.2, ease: "expo.out", delay: 0.2 });
        gsap.from(".right-section", { opacity: 0, y: 50, duration: 1.2, ease: "expo.out", delay: 0.4 });
        gsap.from(".terminal-container", { opacity: 0, y: 50, duration: 1.2, ease: "expo.out", delay: 0.6 });
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

    // Initialize particlesJS with error handling
    try {
        particlesJS('particles-js', currentParticleConfig);
    } catch (error) {
        console.warn('Particles.js failed to initialize, falling back to CSS animation:', error);
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
            // Varsayılan renkler (resume.js'deki gibi)
            initializeParticles(theme === 'light' ? '#A0522D' : '#c4b5fd');
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

// DOM hazır olduğunda ana başlatma
document.addEventListener('DOMContentLoaded', () => {
    initialWindowArea = window.innerWidth * window.innerHeight;

    const savedTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(savedTheme, true);

    // Set offline title if hidden
    if (document.hidden) {
        document.title = 'System Offline!';
    }

    // Terminal buttons mock functionality with focus management
    const terminalRedBtn = document.getElementById('terminal-btn-red');
    const terminalYellowBtn = document.getElementById('terminal-btn-yellow');
    const terminalGreenBtn = document.getElementById('terminal-btn-green');

    function handleTerminalButtonClick(button, action) {
        console.log(action);
        // Force blur to remove focus state immediately after click
        button.blur();
        // Also remove any lingering active states
        setTimeout(() => {
            button.blur();
        }, 10);
    }

    if (terminalRedBtn) {
        terminalRedBtn.addEventListener('click', (e) => {
            handleTerminalButtonClick(terminalRedBtn, 'Clicked red terminal button (close simulation)');
        });
        terminalRedBtn.addEventListener('mouseup', () => {
            terminalRedBtn.blur();
        });
    }
    if (terminalYellowBtn) {
        terminalYellowBtn.addEventListener('click', (e) => {
            handleTerminalButtonClick(terminalYellowBtn, 'Clicked yellow terminal button (minimize simulation)');
        });
        terminalYellowBtn.addEventListener('mouseup', () => {
            terminalYellowBtn.blur();
        });
    }
    if (terminalGreenBtn) {
        terminalGreenBtn.addEventListener('click', (e) => {
            handleTerminalButtonClick(terminalGreenBtn, 'Clicked green terminal button (fullscreen simulation)');
        });
        terminalGreenBtn.addEventListener('mouseup', () => {
            terminalGreenBtn.blur();
        });
    }

    // Altbilgideki geçerli yıl bilgisini güncelle
    const currentYearElement = document.getElementById('current-year');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }

    // Session ID copy button behavior with focus management
    const sessionCopyBtn = document.querySelector('.session-btn');
    if (sessionCopyBtn) {
        sessionCopyBtn.addEventListener('click', (e) => {
            copySessionID();
            sessionCopyBtn.blur();
        });
        sessionCopyBtn.addEventListener('mouseup', () => {
            sessionCopyBtn.blur();
        });
    }

    // Theme toggle button focus management - enhanced
    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', () => {
            // Force immediate blur after theme change
            setTimeout(() => {
                themeToggleButton.blur();
                document.activeElement.blur();
            }, 50);
        });
        themeToggleButton.addEventListener('mouseup', () => {
            themeToggleButton.blur();
        });
        themeToggleButton.addEventListener('mouseleave', () => {
            themeToggleButton.blur();
        });
    }

    // Audio control focus management
    const audioControl = document.getElementById('audio-control');
    if (audioControl) {
        audioControl.addEventListener('mouseup', () => {
            audioControl.blur();
        });
    }

    /**
     * Copies a predefined Session ID to clipboard and shows a brief confirmation.
     */
    function copySessionID() {
        const sessionID = '0500d49ca2b7d6e4149e53e8eba080f0b3795af952810f19bc21882121a7a4e760';
        navigator.clipboard.writeText(sessionID).then(function() {
            const el = document.getElementById('session-copied');
            if (el) {
                el.style.display = 'inline';
                setTimeout(() => { el.style.display = 'none'; }, 2000);
            }
        }).catch(function(err) {
            console.error('Failed to copy Session ID: ', err);
        });
    }

    // Tech items tooltip logic - single tap on mobile
    const techItems = document.querySelectorAll('.tech-item');
    let activeTooltip = null;

    // Tek tıklama/dokunma ile tooltip aç/kapat
    techItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            handleTooltipClick(item);
        });
    });

    function handleTooltipClick(item) {
        // Eğer başka bir tooltip açıksa onu kapat
        if (activeTooltip && activeTooltip !== item) {
            activeTooltip.classList.remove('tooltip-visible');
        }
        
        // Ensure tooltip uses static English text
        const tooltipText = item.getAttribute('data-tooltip') || '';
        item.setAttribute('data-tooltip', tooltipText);
        
        // Tıklanan öğenin tooltip'ini aç/kapat
        item.classList.toggle('tooltip-visible');
        activeTooltip = item.classList.contains('tooltip-visible') ? item : null;
    }

    // Sayfa başka bir yerine tıklandığında tooltip'leri kapat
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.tech-item') && activeTooltip) {
            activeTooltip.classList.remove('tooltip-visible');
            activeTooltip = null;
        }
    });
    
    // Touch için de aynı mantık
    document.addEventListener('touchstart', (e) => {
        if (!e.target.closest('.tech-item') && activeTooltip) {
            activeTooltip.classList.remove('tooltip-visible');
            activeTooltip = null;
        }
    }, { passive: true });

    // Mobile tap feedback for profile/interactive cards to mimic hover - click to momentary lift
    // Profile-card HARİÇ diğer elementler için tıklama animasyonu
    const interactiveTapSelectors = ['.card', '.skill-category', '.project-item', '.contact-btn'];
    const interactiveTapElements = document.querySelectorAll(interactiveTapSelectors.join(','));

    interactiveTapElements.forEach((el) => {
        el.addEventListener('click', () => {
            el.classList.add('active-tap');
            setTimeout(() => el.classList.remove('active-tap'), 300); // 300ms momentary animation
        });
    });
});
