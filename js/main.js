// --- Global Variables ---
let scene, camera, renderer, controls;
let particles, particlesGeometry;
let stars, starsGeometry;
let targetPositions = {};
let currentShapeIndex = 0;
let isMorphing = false;
let morphProgress = 0;
const morphDuration = 2.0; // seconds
const particleCount = 15000;
const shapeInfoElement = document.getElementById('shape-info');
let currentColorScheme = 2; // Set to color-2 scheme
const clock = new THREE.Clock();
let lavaBackground; // Lava lamp background

// Auto-change and mouse following variables
let autoChangeInterval = 15; // seconds between automatic shape changes
let lastAutoChangeTime = 0; // track when we last auto-changed
let mousePosition = new THREE.Vector2(0, 0); // to track mouse position
let targetRotation = new THREE.Euler(0, 0, 0); // target rotation for shape
let currentRotation = new THREE.Euler(0, 0, 0); // current rotation
let rotationSpeed = 2.0; // how quickly the shape rotates to follow mouse
let autoChangeEnabled = true; // toggle for auto-changing

// Device motion and orientation variables
let gyroscopeEnabled = false;
let deviceMotionEnabled = false;
let shakeThreshold = 15; // Threshold for shake detection
let lastAcceleration = { x: 0, y: 0, z: 0 };
let shakeTimeout = null;
let lastShakeTime = 0;
let minTimeBetweenShakes = 1000; // Minimum time between shake events (ms)

// --- Initialization ---
function init() {
    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 2.8;

    // Renderer
    renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true // Enable alpha for transparent background
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.autoClear = false; // Important for rendering background first
    document.body.appendChild(renderer.domElement);

    // Orbit Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Enable smooth damping (inertia)
    controls.dampingFactor = 0.05; // Adjust damping intensity
    
    // Creating text overlay for resume content
    createResumeOverlay();
    
    // Particles Geometry
    particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const startPositions = new Float32Array(particleCount * 3); // For morphing
    const randomFactors = new Float32Array(particleCount); // For galaxy/wave variation

    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 5;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 5;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 5;
        randomFactors[i] = Math.random();
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particlesGeometry.setAttribute('startPosition', new THREE.BufferAttribute(startPositions, 3));
    particlesGeometry.setAttribute('randomFactor', new THREE.BufferAttribute(randomFactors, 1));

    // Particles Material
    const particleMaterial = new THREE.PointsMaterial({
        size: 0.02,
        vertexColors: true,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    // Particles Object
    particles = new THREE.Points(particlesGeometry, particleMaterial);
    scene.add(particles);

    // Initialize techno lava lamp background with darker, eye-friendly colors
    lavaBackground = new LavaLampBackground({
        colorA: new THREE.Color(0x050510), // Much darker background
        colorB: new THREE.Color(0x003333), // Darker teal
        colorC: new THREE.Color(0x330033), // Darker purple
        speed: 0.5, // Slower for more relaxing effect
        blobScale: isMobileDevice() ? 1.2 : 1.5, // Smaller blobs
        glitchIntensity: 0.03 // Much less glitch
    });
    lavaBackground.init(renderer);

    // Background Stars - Make them more cyberpunk
    starsGeometry = new THREE.BufferGeometry();
    const starPositions = [];
    const starColors = [];
    const starCount = 1500; // Reduced for performance
    
    for (let i = 0; i < starCount; i++) {
        const x = THREE.MathUtils.randFloatSpread(200);
        const y = THREE.MathUtils.randFloatSpread(200);
        const z = THREE.MathUtils.randFloatSpread(200);
        const d = Math.sqrt(x*x + y*y + z*z);
         if (d < 50) {
            const scale = 50 / d;
            starPositions.push(x*scale, y*scale, z*scale);
         } else {
            starPositions.push(x, y, z);
         }
        
        // Cyberpunk star colors
        const colorChoice = Math.random();
        if (colorChoice < 0.4) {
            starColors.push(0.0, 1.0, 1.0); // Cyan
        } else if (colorChoice < 0.7) {
            starColors.push(1.0, 0.0, 1.0); // Magenta
        } else {
            starColors.push(0.9, 0.9, 1.0); // White-blue
        }
    }
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
    starsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));
    const starsMaterial = new THREE.PointsMaterial({
        size: 0.15, // Slightly larger for more visibility
        vertexColors: true,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending // Add glow effect
     });
    stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    // Pre-calculate all target positions
    generateShapePositions();
    
    // Set initial shape to Education
    currentShapeIndex = 0;
    setShape(currentShapeIndex, true);
    applyColorScheme(currentColorScheme);
    updateResumeContent(currentShapeIndex);
    
    // Event Listeners
    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('mousemove', onMouseMove, false);
    shapeInfoElement.addEventListener('click', toggleAutoChange);
    
    // Add touch events for mobile
    window.addEventListener('touchmove', handleTouchRotation, { passive: false });
    shapeInfoElement.addEventListener('touchstart', toggleAutoChange);
    
    // Add keyboard navigation for resume sections
    window.addEventListener('keydown', handleKeyNavigation);
    
    // Add gyroscope and motion detection for mobile
    setupDeviceOrientation();
    
    // Update particle size for mobile
    if (window.innerWidth <= 768) {
        // Smaller screens need larger particles for visibility
        particleMaterial.size = 0.03;
        // Adjust camera for better mobile view
        camera.position.z = 3;
    }
    
    updateShapeInfo();
    
    // Start animation loop
    animate();
}

// Request permission for device motion/orientation (especially for iOS)
function setupDeviceOrientation() {
    // Check if device orientation is available
    if (window.DeviceOrientationEvent) {
        // For iOS 13+ devices that require permission
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            // Create a button to request permission
            const permissionBtn = document.createElement('button');
            permissionBtn.id = 'motion-permission';
            permissionBtn.textContent = 'Enable Motion Control';
            permissionBtn.style.position = 'fixed';
            permissionBtn.style.bottom = '20px';
            permissionBtn.style.left = '50%';
            permissionBtn.style.transform = 'translateX(-50%)';
            permissionBtn.style.padding = '10px 15px';
            permissionBtn.style.backgroundColor = '#8a2be2';
            permissionBtn.style.color = 'white';
            permissionBtn.style.border = 'none';
            permissionBtn.style.borderRadius = '5px';
            permissionBtn.style.zIndex = '1000';
            
            permissionBtn.addEventListener('click', requestMotionPermission);
            document.body.appendChild(permissionBtn);
        } else {
            // For non-iOS devices or older iOS that don't require permission
            window.addEventListener('deviceorientation', handleDeviceOrientation);
            gyroscopeEnabled = true;
        }
    }
    
    // Setup device motion for shake detection
    if (window.DeviceMotionEvent) {
        if (typeof DeviceMotionEvent.requestPermission === 'function') {
            // Permission will be requested with the orientation permission
        } else {
            window.addEventListener('devicemotion', handleDeviceMotion);
            deviceMotionEnabled = true;
        }
    }
}

// Request permission for iOS devices
function requestMotionPermission() {
    DeviceOrientationEvent.requestPermission()
        .then(permissionState => {
            if (permissionState === 'granted') {
                // Hide the button
                document.getElementById('motion-permission').style.display = 'none';
                
                // Add the event listeners
                window.addEventListener('deviceorientation', handleDeviceOrientation);
                gyroscopeEnabled = true;
                
                // Also add motion detection for shake
                if (window.DeviceMotionEvent) {
                    DeviceMotionEvent.requestPermission()
                        .then(motionState => {
                            if (motionState === 'granted') {
                                window.addEventListener('devicemotion', handleDeviceMotion);
                                deviceMotionEnabled = true;
                                
                                // Show a brief instruction toast
                                showToast('Motion control active! Tilt to move, shake for next section');
                            }
                        })
                        .catch(console.error);
                }
                
                // Show a brief instruction toast
                showToast('Gyroscope active! Tilt your phone to move the shape');
            }
        })
        .catch(console.error);
}

// Handle device orientation data for gyroscope control
function handleDeviceOrientation(event) {
    // Only use gyroscope when not morphing
    if (isMorphing) return;
    
    // Get the orientation data
    const beta = event.beta;  // X-axis rotation (-180 to 180)
    const gamma = event.gamma; // Y-axis rotation (-90 to 90)
    
    // Normalize to the range we need
    if (beta !== null && gamma !== null) {
        // Map the rotation to our target rotation angles
        // Limit the rotation to reasonable angles
        const maxAngle = Math.PI * 0.3;
        
        // Use gamma (left-right tilt) for Y rotation
        targetRotation.y = THREE.MathUtils.mapLinear(
            THREE.MathUtils.clamp(gamma, -45, 45), 
            -45, 45, 
            maxAngle, -maxAngle
        );
        
        // Use beta (front-back tilt) for X rotation
        targetRotation.x = THREE.MathUtils.mapLinear(
            THREE.MathUtils.clamp(beta - 45, -45, 45), 
            -45, 45, 
            maxAngle, -maxAngle
        );
    }
}

// Handle device motion for shake detection
function handleDeviceMotion(event) {
    const acceleration = event.accelerationIncludingGravity;
    
    if (!acceleration) return;
    
    // Calculate acceleration change
    const deltaX = Math.abs(acceleration.x - lastAcceleration.x);
    const deltaY = Math.abs(acceleration.y - lastAcceleration.y);
    const deltaZ = Math.abs(acceleration.z - lastAcceleration.z);
    
    // Update last acceleration
    lastAcceleration.x = acceleration.x;
    lastAcceleration.y = acceleration.y;
    lastAcceleration.z = acceleration.z;
    
    // Calculate total change
    const totalChange = deltaX + deltaY + deltaZ;
    
    // Check if shake exceeds threshold
    if (totalChange > shakeThreshold) {
        const now = Date.now();
        
        // Prevent multiple shakes in short succession
        if (now - lastShakeTime > minTimeBetweenShakes) {
            detectShake();
            lastShakeTime = now;
        }
    }
}

// Process shake event
function detectShake() {
    // If already processing a shake, ignore
    if (shakeTimeout) return;
    
    // Debounce the shake detection
    shakeTimeout = setTimeout(() => {
        // Go to next section
        lastAutoChangeTime = clock.getElapsedTime();
        if (!isMorphing) {
            goToSection((currentShapeIndex + 1) % shapes.length);
            showToast('Shake detected - Next section');
        }
        shakeTimeout = null;
    }, 300);
}

// Show a temporary toast notification
function showToast(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.position = 'fixed';
    toast.style.bottom = '80px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.backgroundColor = 'rgba(10, 10, 30, 0.9)';
    toast.style.color = 'white';
    toast.style.padding = '10px 20px';
    toast.style.borderRadius = '5px';
    toast.style.zIndex = '1000';
    toast.style.transition = 'opacity 0.5s';
    
    document.body.appendChild(toast);
    
    // Fade out and remove after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 500);
    }, 3000);
}

// Detect if device is mobile
function isMobileDevice() {
    return (window.innerWidth <= 768) || 
           (typeof window.orientation !== 'undefined') ||
           (navigator.userAgent.indexOf('Mobile') !== -1);
}

// Optimize rendering for mobile devices
function optimizeForMobile() {
    if (isMobileDevice()) {
        // Reduce particle count for better performance on mobile
        const mobileParticleCount = Math.min(particleCount, 10000);
        
        // Update renderer settings for mobile
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        // Use simpler materials on mobile
        particleMaterial.size = 0.03;
    }
}

// --- Render Loop ---
function animate() {
    requestAnimationFrame(animate);

    const deltaTime = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    // First, render the techno lava lamp background
    if (lavaBackground) {
        renderer.clear();
        lavaBackground.update();
    }
    
    // Then render the scene with particles
    renderer.clearDepth();

    // Check for auto shape change if enabled and not currently morphing
    if (autoChangeEnabled && !isMorphing && 
        (elapsedTime - lastAutoChangeTime > autoChangeInterval)) {
        lastAutoChangeTime = elapsedTime;
        goToSection((currentShapeIndex + 1) % shapes.length);
    }

    // Update morphing state
    updateMorph(deltaTime);

    // Smooth rotation toward mouse position
    if (!isMorphing) { // Only rotate when not morphing to avoid visual conflicts
        currentRotation.x += (targetRotation.x - currentRotation.x) * rotationSpeed * deltaTime;
        currentRotation.y += (targetRotation.y - currentRotation.y) * rotationSpeed * deltaTime;
        particles.rotation.x = currentRotation.x;
        particles.rotation.y = currentRotation.y;
    }
    
    // Update OrbitControls (handles camera rotation/zoom/pan)
    controls.update(); // Must be called if controls.enableDamping is true

    // Enhanced star rotation for techno effect
    if (stars) {
        stars.rotation.y += deltaTime * 0.01; // Slightly faster
        stars.rotation.z += deltaTime * 0.005; // Add Z rotation
    }

    renderer.render(scene, camera);
}

// Window resize handler
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Update lava background on resize
    if (lavaBackground) {
        lavaBackground.onResize();
    }
}

// Initialize everything when the window loads
window.addEventListener('load', () => {
    init();
    optimizeForMobile();
});
