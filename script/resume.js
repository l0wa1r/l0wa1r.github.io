// Optimized Particle.js configuration for resume page
/* k: VGhlIHNpdGUgd2FzIGNyZWF0ZWQgYnkgVHlwaG9uNjQsIHdobyBvd25zIHRoZSBtYWluIGlkZWEgYW5kIGNvZGU6IGh0dHBzOi8vdHlwaG9uNjQuZ2l0aHViLmlvIGdpdGh1Yi5jb20vdHlwaG9uNjQ= */
const particleConfigBaseResume = {
    particles: {
        number: { value: 100, density: { enable: true, value_area: 1200 } }, // Reduced for performance
        shape: { type: 'circle' },
        opacity: {
            value: 0.5, // Reduced for better performance
            random: false, // Disable random for performance
            anim: { enable: false } // Disable animation for performance
        },
        size: { value: 2.0, random: true, anim: { enable: false } }, // Disable size animation
        line_linked: { enable: true, distance: 90, opacity: 0.3, width: 1 }, // Reduced for performance
        move: { 
            enable: true, 
            speed: 1.0, // Slower for better performance
            direction: 'none', 
            random: false, // More predictable
            straight: false,
            out_mode: 'bounce',
            bounce: false
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
            grab: { distance: 50, line_linked: { opacity: 0.5 } }, // Reduced grab distance
            push: { particles_nb: 1 }
        }
    },
    retina_detect: true,
    fps_limit: 30 // Increased for smoother experience
};

let initialWindowArea; // Yeniden boyutlandırma hesaplamaları için başlangıç pencere alanını depolar
let initialParticleCanvasArea; // Yoğunluk ölçeklemesi için başlangıç particles.js canvas alanını depolar

/**
 * Verilen renk ile particles.js örneğini başlatır veya günceller ve ekran boyutuna ve cihaz donanımına
 * göre parçacık sayısını, boyutunu ve çizgi mesafesini dinamik olarak ayarlar. Bu fonksiyon ayrıca canvas'ın
 * fare olaylarını engellememesini ve etkileşim ayarlarını doğru şekilde uygulamasını sağlar.
 * @param {string} particleColor - Parçacıklara uygulanacak renk.
 */
function initializeParticles(particleColor) {
    let pJSInstance;

    // particles.js zaten başlatıldı mı kontrol et
    if (window.pJSDom && window.pJSDom[0] && window.pJSDom[0].pJS) {
        pJSInstance = window.pJSDom[0].pJS;
        // Parçacık ve çizgi rengini güncelle
        pJSInstance.particles.color.value = particleColor;
        if (pJSInstance.particles.line_linked) {
            pJSInstance.particles.line_linked.color = particleColor;
        }

        // --- Mevcut örnek için Etkileşim Ayarlarını Güncelle ---
        pJSInstance.interactivity.events.onclick.enable = particleConfigBaseResume.interactivity.events.onclick.enable;
        pJSInstance.interactivity.modes.push.particles_nb = particleConfigBaseResume.interactivity.modes.push.particles_nb;
        pJSInstance.interactivity.events.onhover.enable = particleConfigBaseResume.interactivity.events.onhover.enable;
        pJSInstance.interactivity.modes.grab.distance = particleConfigBaseResume.interactivity.modes.grab.distance;
        pJSInstance.interactivity.modes.grab.line_linked.opacity = particleConfigBaseResume.interactivity.modes.grab.line_linked.opacity;

        // Kullanıcının istediği opaklık artışını burada uygula
        pJSInstance.particles.opacity.value = particleConfigBaseResume.particles.opacity.value;
        if (pJSInstance.particles.line_linked) {
            pJSInstance.particles.line_linked.opacity = particleConfigBaseResume.particles.line_linked.opacity;
        }

        let targetParticleCount = 0;
        let targetParticleSize = particleConfigBaseResume.particles.size.value; // Base config'den alınsın
        let targetLineDistance = particleConfigBaseResume.particles.line_linked.distance; // Base config'den alınsın

        // Optimized particle settings for resume page performance
        const screenWidth = window.innerWidth;
        if (screenWidth >= 1920) {
            targetParticleCount = 140; // Reduced for performance
            targetParticleSize = 2.0;
            targetLineDistance = 90;
        } else if (screenWidth >= 1440) {
            targetParticleCount = 120;
            targetParticleSize = 1.9;
            targetLineDistance = 85;
        } else if (screenWidth >= 1024) {
            targetParticleCount = 100;
            targetParticleSize = 1.8;
            targetLineDistance = 80;
        } else if (screenWidth >= 768) {
            targetParticleCount = 80; // Optimized for tablets
            targetParticleSize = 1.6;
            targetLineDistance = 70;
        } else if (screenWidth >= 480) {
            targetParticleCount = 60; // Reduced for mobile
            targetParticleSize = 1.4;
            targetLineDistance = 60;
        } else if (screenWidth >= 320) {
            targetParticleCount = 40; // Minimal for small screens
            targetParticleSize = 1.2;
            targetLineDistance = 50;
        } else { // Very small screens
            targetParticleCount = 30; // Minimal particles
            targetParticleSize = 1.0;
            targetLineDistance = 40;
        }

        // Donanım performansına göre parçacık sayısını ayarla (daha az agresif)
        const cores = navigator.hardwareConcurrency;
        const memory = navigator.deviceMemory;
        if (cores && memory) { // Sadece her iki bilgi de mevcutsa ayarla
            if (cores < 2 && memory < 2) {
                // Çok düşük seviye cihazlar için %40 azaltma
                targetParticleCount = Math.floor(targetParticleCount * 0.6);
            } else if (cores < 4 || memory < 4) {
                // Düşük-orta seviye cihazlar için %20 azaltma
                targetParticleCount = Math.floor(targetParticleCount * 0.8);
            }
        }

        // Optimized particle count limits for resume page
        if (targetParticleCount > 0) {
            targetParticleCount = Math.max(30, Math.min(targetParticleCount, 140));
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

        // --- Yakınlaştırma/Yeniden Boyutlandırma için Dinamik Yoğunluk Ayarı ---
        const currentParticleCanvasArea = pJSInstance.canvas.w * pJSInstance.canvas.h;
        if (initialParticleCanvasArea === undefined || initialParticleCanvasArea === 0) {
            initialParticleCanvasArea = currentParticleCanvasArea;
            if (initialParticleCanvasArea === 0) initialParticleCanvasArea = 1; // Sıfıra bölünmeyi önle
        }

        if (currentParticleCanvasArea > 0) {
            const baseDensityArea = particleConfigBaseResume.particles.number.density.value_area;
            let calculatedDensityArea = baseDensityArea * (currentParticleCanvasArea / initialParticleCanvasArea);

            calculatedDensityArea = Math.max(calculatedDensityArea, 200); // Minimum yoğunluk alanı
            calculatedDensityArea = Math.min(calculatedDensityArea, 5000); // Maksimum yoğunluk alanı

            if (pJSInstance.particles.number.density.value_area !== calculatedDensityArea) {
                pJSInstance.particles.number.density.value_area = calculatedDensityArea;
                pJSInstance.fn.particlesRefresh();
            }
        } else {
            pJSInstance.fn.particlesRefresh();
        }
        return;
    }

    // particles.js'in ilk kez başlatılması
    let currentParticleConfig = JSON.parse(JSON.stringify(particleConfigBaseResume));
    currentParticleConfig.particles.color = { value: particleColor };
    currentParticleConfig.particles.line_linked.color = particleColor;

    // Kullanıcının istediği opaklık artışını burada uygula
    currentParticleConfig.particles.opacity.value = particleConfigBaseResume.particles.opacity.value;
    currentParticleConfig.particles.line_linked.opacity = particleConfigBaseResume.particles.line_linked.opacity;

    // İlk yüklemede ekran boyutuna ve donanıma göre başlangıç parçacık sayısı, boyutu ve çizgi mesafesi
    let initialParticleCount = 0;
    let initialParticleSize = particleConfigBaseResume.particles.size.value;
    let initialLineDistance = particleConfigBaseResume.particles.line_linked.distance;

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
        initialParticleCount = 150; // Tabletler için artırıldı
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
    } else { // Çok küçük mobil cihazlar
        initialParticleCount = 150; // En küçük ekranlar için ayarlandı
        initialParticleSize = 1.3; // Mobil için boyut artırıldı
        initialLineDistance = 60;
    }

    // Donanım performansına göre parçacık sayısını ayarla (daha az agresif)
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

    // Optimized initial particle limits for resume page
    if (initialParticleCount > 0) {
        initialParticleCount = Math.max(30, Math.min(initialParticleCount, 140));
    }

    currentParticleConfig.particles.number.value = initialParticleCount;
    currentParticleConfig.particles.size.value = initialParticleSize;
    currentParticleConfig.particles.line_linked.distance = initialLineDistance;
    currentParticleConfig.particles.number.density.enable = true;

    // particlesJS'i başlat - with error handling
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

    // Başlatmadan sonra, fare etkileşimlerini engellememek için canvas'a pointer-events ve z-index uygula
    if (window.pJSDom && window.pJSDom[0] && window.pJSDom[0].pJS) {
        pJSInstance = window.pJSDom[0].pJS;

        // Dinamik yoğunluk hesaplamaları için başlangıç canvas alanını yakala
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
        console.error("particles.js başlatılamadı!");
    }
}

/**
 * Bir fonksiyonun ne sıklıkta çağrıldığını sınırlamak için debounce fonksiyonu.
 * @param {function} func - Debounce edilecek fonksiyon.
 * @param {number} wait - Beklenecek milisaniye sayısı.
 * @param {boolean} immediate - True ise, fonksiyonu ön kenarda tetikle.
 * @returns {function} - Debounce edilmiş fonksiyon.
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
}

// Heavily optimized resize handler for resume page
const handleResize = debounce(function() {
    // Only update if window area changed significantly (>20%)
    const currentWindowArea = window.innerWidth * window.innerHeight;
    const areaChangePercent = Math.abs(currentWindowArea - initialWindowArea) / initialWindowArea;
    
    if (areaChangePercent > 0.2) {
        const body = document.body;
        const currentTheme = localStorage.getItem('theme') || 'dark';
        const particleColor = getComputedStyle(body).getPropertyValue(
            currentTheme === 'light' ? '--particle-color-light' : '--particle-color-dark'
        ).trim().replace(/'/g, '');
        initializeParticles(particleColor);
        initialWindowArea = currentWindowArea;
    }
}, 600); // Increased debounce for maximum performance

// Yeniden boyutlandırma olay dinleyicisi ekle
window.addEventListener('resize', handleResize);

// DOM Elements and Global Variables
const body = document.body;
const pageTitle = document.querySelector('title');
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const moonIcon = themeToggleBtn ? themeToggleBtn.querySelector('.fa-moon') : null;
const sunIcon = themeToggleBtn ? themeToggleBtn.querySelector('.fa-sun') : null;

let originalPageTitle = document.title; // To store the original page title for visibility changes

// Theme Application
/**
 * Seçilen temayı (açık/koyu) gövdeye uygular ve parçacık renklerini günceller.
 * @param {string} theme - Uygulanacak tema ('light' veya 'dark').
 * @param {boolean} isInitialLoad - Bu ilk sayfa yüklemesi ise true.
 */
function applyTheme(theme, isInitialLoad = false) {
    if (theme === 'light') {
        body.classList.add('light-theme');
        if (sunIcon) sunIcon.style.display = 'inline-block';
        if (moonIcon) moonIcon.style.display = 'none';
    } else {
        body.classList.remove('light-theme');
        if (sunIcon) sunIcon.style.display = 'none';
        if (moonIcon) moonIcon.style.display = 'inline-block';
    }
    localStorage.setItem('theme', theme);

    setTimeout(() => {
        const particleColor = getComputedStyle(body).getPropertyValue(
            theme === 'light' ? '--particle-color-light' : '--particle-color-dark'
        ).trim().replace(/\'/g, '');
         if (particleColor) {
            initializeParticles(particleColor);
        } else {
            initializeParticles(theme === 'light' ? '#A0522D' : '#c4b5fd');
        }
    }, 0);
}

// Tema değiştirme düğmesi için olay dinleyicisi
if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = body.classList.contains('light-theme') ? 'light' : 'dark';
        applyTheme(currentTheme === 'light' ? 'dark' : 'light');
    });
}

// Page visibility: static English offline title
document.addEventListener('visibilitychange', () => {
    document.title = document.hidden ? 'System Offline!' : originalPageTitle;
});

// DOMContentLoaded - Main Initialization when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    initialWindowArea = window.innerWidth * window.innerHeight; // Capture initial window area

    // Capture original page title from the <title> tag on initial load
    if (document.title) {
        originalPageTitle = document.title;
    }

    // First apply theme to ensure particles get the right color and initial setup
    const savedTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(savedTheme, true); // `true` for isInitialLoad

    // Set document title based on initial visibility state
    document.title = document.hidden ? 'System Offline!' : originalPageTitle;

    // Error handling for Chrome extensions
    window.addEventListener('error', function(e) {
        if (e.message && e.message.includes('runtime.lastError')) {
            e.preventDefault();
            return false;
        }
    });

    // Audio control functionality
    const audioControl = document.getElementById('audio-control');
    const audioIcon = document.getElementById('audio-icon');
    let audio = null;
    let isPlaying = false;

    if (audioControl) {
        audioControl.addEventListener('click', toggleAudio);
    }

    function toggleAudio() {
        if (!audio) {
            audio = new Audio('media/hmm.mp3');
            audio.loop = true;
            audio.volume = 0.3;
        }

        if (isPlaying) {
            audio.pause();
            audioIcon.className = 'fas fa-play';
            isPlaying = false;
        } else {
            audio.play().catch(error => {
                console.warn('Audio playback failed:', error);
            });
            audioIcon.className = 'fas fa-pause';
            isPlaying = true;
        }
    }

    // Session ID copy functionality
    function copySessionID() {
        const sessionID = 'TYP-' + Math.random().toString(36).substr(2, 8).toUpperCase();
        navigator.clipboard.writeText(sessionID).then(() => {
            const originalText = document.querySelector('.session-btn').textContent;
            document.querySelector('.session-btn').textContent = 'Copied!';
            setTimeout(() => {
                document.querySelector('.session-btn').textContent = originalText;
            }, 1500);
        }).catch(() => {
            console.warn('Clipboard access failed');
        });
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
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            // Force immediate blur after theme change
            setTimeout(() => {
                themeToggleBtn.blur();
                document.activeElement.blur();
            }, 50);
        });
        themeToggleBtn.addEventListener('mouseup', () => {
            themeToggleBtn.blur();
        });
        themeToggleBtn.addEventListener('mouseleave', () => {
            themeToggleBtn.blur();
        });
    }

    // Audio control focus management
    const audioControlResume = document.getElementById('audio-control');
    if (audioControlResume) {
        audioControlResume.addEventListener('mouseup', () => {
            audioControlResume.blur();
        });
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

    // Update current year in footer
    const currentYearElement = document.getElementById('current-year');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }

    // GSAP Animations (ensure GSAP library is loaded in your HTML)
    if (typeof gsap !== 'undefined') {
        try {
            gsap.from('.header', { y: -30, opacity: 0, duration: 0.8, ease: 'power2.out', delay: 0.1 });
            gsap.from('.resume-sidebar', { x: -50, opacity: 0, duration: 0.8, ease: 'power2.out', delay: 0.3 });
            gsap.from('.resume-main-content > *', {
                opacity: 0,
                y: 30,
                duration: 0.7,
                ease: 'power2.out',
                stagger: 0.1,
                delay: 0.5
            });
        } catch (error) {
            console.warn('GSAP animations failed, continuing without animations:', error);
        }
    } else {
        console.warn("GSAP could not be loaded. Ensure the GSAP library is linked correctly in your HTML.");
    }

    // Section Navigation Logic (for sidebar links and content sections)
    const sidebarLinks = document.querySelectorAll('.resume-sidebar nav a');
    const sections = document.querySelectorAll('.resume-section');

    /**
     * Shows a specific section by its ID and updates active sidebar link.
     * @param {string} sectionId - The ID of the section to show.
     */
    function showSection(sectionId) {
        sections.forEach(section => {
            if (section.id === sectionId) {
                section.classList.add('active-section');
            } else {
                section.classList.remove('active-section');
            }
        });

        sidebarLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
                link.classList.add('active');
            }
        });
    }

    // Add click listeners to sidebar navigation links
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault(); // Prevent default anchor link behavior
            const targetId = this.getAttribute('href').substring(1); // Get section ID from href
            showSection(targetId); // Show the corresponding section
            // Update URL hash without page reload for deep linking
            if (history.pushState) {
                history.pushState(null, null, `#${targetId}`);
            } else {
                window.location.hash = `#${targetId}`;
            }
        });
    });

    /**
     * Shows the initial section based on URL hash or defaults to the first section.
     */
    function showInitialSection() {
        const hash = window.location.hash.substring(1); // Get hash from URL
        const sectionIds = Array.from(sections).map(s => s.id); // Get all section IDs
        let initialSectionId = sectionIds[0] || null; // Default to the first section

        // If hash exists and is a valid section ID, use it
        if (hash && sectionIds.includes(hash)) {
            initialSectionId = hash;
        }

        if (initialSectionId) {
            showSection(initialSectionId); // Display the initial section
        }
    }
    showInitialSection(); // Call on DOMContentLoaded

    /**
     * Updates the current date displayed on the page.
     */
    function updateCurrentDate() {
      const dateElement = document.getElementById('current-date');
      if (dateElement) {
        const today = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        dateElement.textContent = today.toLocaleDateString('en-US', options);
      }
    }
    updateCurrentDate(); // Call on DOMContentLoaded

    // Accordion functionality for collapsible sections
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const accordionItem = header.parentElement;
            const accordionContent = header.nextElementSibling;

            // Close other open accordion items
            accordionHeaders.forEach(otherHeader => {
                if (otherHeader !== header && otherHeader.classList.contains('active')) {
                    otherHeader.classList.remove('active');
                    const otherContent = otherHeader.nextElementSibling;
                    otherContent.style.maxHeight = 0;
                    otherContent.style.padding = "0 20px"; // Reset padding when closing
                }
            });

            header.classList.toggle('active'); // Toggle active class for current header

            if (header.classList.contains('active')) {
                // Expand content
                accordionContent.style.maxHeight = accordionContent.scrollHeight + "px"; // Set max-height to scrollHeight for smooth expansion
                accordionContent.style.padding = "15px 20px"; // Apply padding when open
            } else {
                // Collapse content
                accordionContent.style.maxHeight = 0; // Collapse by setting max-height to 0
                accordionContent.style.padding = "0 20px"; // Reset padding when closing
            }
        });
    });
});
