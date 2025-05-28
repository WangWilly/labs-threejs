// --- UI Functions ---

// Create HTML overlay for resume content
function createResumeOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'resume-overlay';
    document.body.appendChild(overlay);
    updateResumeContent(currentShapeIndex);
    
    // Add touch events with improved handling for scrolling vs swiping
    overlay.addEventListener('touchstart', handleOverlayTouchStart, { passive: true });
    overlay.addEventListener('touchmove', handleOverlayTouchMove, { passive: false });
    overlay.addEventListener('touchend', handleOverlayTouchEnd, { passive: true });
}

// Variables for tracking touches
let touchStartX = 0;
let touchStartY = 0;
let isScrolling = false;
let touchStartTime = 0;

// Handle touch start specifically for the overlay
function handleOverlayTouchStart(event) {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
    touchStartTime = Date.now();
    isScrolling = false;
}

// Handle touch move specifically for the overlay
function handleOverlayTouchMove(event) {
    if (isMorphing) return;
    
    // Don't do anything if we've already determined this is a scroll action
    if (isScrolling) return;
    
    if (!touchStartX || !touchStartY) return;
    
    const touchCurrentX = event.touches[0].clientX;
    const touchCurrentY = event.touches[0].clientY;
    
    const diffX = touchStartX - touchCurrentX;
    const diffY = touchStartY - touchCurrentY;
    
    // If vertical movement is greater than horizontal, this is likely a scroll
    if (Math.abs(diffY) > Math.abs(diffX)) {
        isScrolling = true;
        return;
    }
    
    // If horizontal swipe is significant and exceeds threshold, handle as navigation
    if (Math.abs(diffX) > 50) {
        const overlay = document.getElementById('resume-overlay');
        
        // Only process swipe if the overlay doesn't need scrolling or we're at the top/bottom
        if (overlay.scrollHeight <= overlay.clientHeight || 
            (overlay.scrollTop === 0 && diffY < 0) || 
            (overlay.scrollTop + overlay.clientHeight >= overlay.scrollHeight - 5 && diffY > 0)) {
            
            lastAutoChangeTime = clock.getElapsedTime();
            
            if (diffX > 0) {
                // Swipe left - next section
                goToSection((currentShapeIndex + 1) % shapes.length);
            } else {
                // Swipe right - previous section
                goToSection((currentShapeIndex - 1 + shapes.length) % shapes.length);
            }
            
            // Reset touch tracking
            touchStartX = 0;
            touchStartY = 0;
            
            // Prevent default to avoid any unexpected behavior
            event.preventDefault();
        }
    }
}

// Handle touch end for the overlay
function handleOverlayTouchEnd(event) {
    // Reset flags and coordinates
    touchStartX = 0;
    touchStartY = 0;
    isScrolling = false;
}

// Add global touch handlers for page-level navigation
document.addEventListener('touchstart', handleTouchStart, { passive: true });
document.addEventListener('touchmove', handleTouchMove, { passive: false });

// Handle touch start event for the whole page
function handleTouchStart(event) {
    // Skip if touch is inside the resume overlay (handled by its own events)
    if (event.target.closest('#resume-overlay')) return;
    
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
}

// Handle touch move event for swipe navigation on the whole page
function handleTouchMove(event) {
    // Skip if touch is inside the resume overlay (handled by its own events)
    if (event.target.closest('#resume-overlay')) return;
    
    if (!touchStartX || !touchStartY || isMorphing) {
        return;
    }
    
    const touchEndX = event.touches[0].clientX;
    const touchEndY = event.touches[0].clientY;
    
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;
    
    // If horizontal swipe is greater than vertical and exceeds threshold
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        lastAutoChangeTime = clock.getElapsedTime();
        if (diffX > 0) {
            // Swipe left - next section
            goToSection((currentShapeIndex + 1) % shapes.length);
        } else {
            // Swipe right - previous section
            goToSection((currentShapeIndex - 1 + shapes.length) % shapes.length);
        }
        
        // Reset touch start position
        touchStartX = 0;
        touchStartY = 0;
        
        // Prevent default to stop page scrolling
        event.preventDefault();
    }
}

// Update resume content in the overlay
function updateResumeContent(sectionIndex) {
    const overlay = document.getElementById('resume-overlay');
    const section = resumeSections[sectionIndex];
    
    let html = `<h2 style="color:#8a2be2;margin-top:0;border-bottom:1px solid #4169e1;padding-bottom:10px">
                ${section.title}</h2>`;
                
    html += '<div style="line-height:1.5">';
    section.content.forEach(line => {
        if (line === "") {
            html += '<br>';
        } else if (line.startsWith('-')) {
            html += `<div style="padding-left:15px;color:#bbd">${line}</div>`;
        } else if (line.match(/^\d+\./)) {
            html += `<div style="margin-top:12px;color:#3cb371;font-weight:bold">${line}</div>`;
        } else {
            html += `<div>${line}</div>`;
        }
    });
    html += '</div>';
    
    // Add navigation hint with mobile-friendly instructions including gyroscope
    const isMobile = window.innerWidth <= 768 || typeof window.orientation !== 'undefined';
    
    if (isMobile) {
        html += `<div style="margin-top:20px;font-size:12px;color:#aaa;text-align:center">
                Swipe to navigate • Tilt phone to rotate • Shake for next section<br>
                Section ${sectionIndex + 1} of ${shapes.length}</div>`;
    } else {
        html += `<div style="margin-top:20px;font-size:12px;color:#aaa;text-align:center">
                Use arrow keys or swipe to navigate • Section ${sectionIndex + 1} of ${shapes.length}</div>`;
    }
    
    overlay.innerHTML = html;
}

// Toggle auto-change feature
function toggleAutoChange() {
    autoChangeEnabled = !autoChangeEnabled;
    updateShapeInfo();
}

// Update shape info text based on current state
function updateShapeInfo() {
    const currentShape = shapes[currentShapeIndex];
    const isMobile = window.innerWidth <= 768 || typeof window.orientation !== 'undefined';
    
    if (isMobile) {
        if (autoChangeEnabled) {
            shapeInfoElement.textContent = `${resumeSections[currentShapeIndex].title} (Auto)`;
        } else {
            shapeInfoElement.textContent = `${resumeSections[currentShapeIndex].title}`;
        }
    } else {
        if (autoChangeEnabled) {
            shapeInfoElement.textContent = `${resumeSections[currentShapeIndex].title} (Auto-changing)`;
        } else {
            shapeInfoElement.textContent = `${resumeSections[currentShapeIndex].title} (Tap to toggle)`;
        }
    }
}

// Go to a specific section
function goToSection(index) {
    if (isMorphing || index === currentShapeIndex) return;
    
    // Store current position for morphing
    // If breathing is enabled, use basePositions for a stable start to the morph.
    // Otherwise, use the current (potentially already breathed) positions.
    const currentPosArray = (breathingEnabled && basePositions) ? basePositions : particlesGeometry.attributes.position.array;
    
    const startPositionsAttribute = particlesGeometry.attributes.startPosition;
    // Ensure currentPosArray and startPositionsAttribute.array have the same length
    if (currentPosArray.length === startPositionsAttribute.array.length) {
        for(let i=0; i < currentPosArray.length; i++) {
            startPositionsAttribute.array[i] = currentPosArray[i];
        }
        startPositionsAttribute.needsUpdate = true;
    } else {
        console.error("goToSection: Mismatch in position array lengths. Cannot set start positions for morphing.");
        // Potentially fall back to using particlesGeometry.attributes.position.array directly
        // or handle the error appropriately. For now, we'll log and proceed cautiously.
        const fallbackPositions = particlesGeometry.attributes.position.array;
        if (fallbackPositions.length === startPositionsAttribute.array.length) {
            for(let i=0; i < fallbackPositions.length; i++) {
                startPositionsAttribute.array[i] = fallbackPositions[i];
            }
            startPositionsAttribute.needsUpdate = true;
        }
    }
    
    // Set the target section
    isMorphing = true;
    morphProgress = 0;
    currentShapeIndex = index;
    shapeInfoElement.textContent = 'Morphing...';
    
    // Update resume content immediately for better UX
    updateResumeContent(currentShapeIndex);
}

// Handle keyboard navigation between sections
function handleKeyNavigation(event) {
    if (isMorphing) return;
    
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown' || event.key === 'j' || event.key === 'l') {
        // Next section
        lastAutoChangeTime = clock.getElapsedTime();
        goToSection((currentShapeIndex + 1) % shapes.length);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp' || event.key === 'k' || event.key === 'h') {
        // Previous section
        lastAutoChangeTime = clock.getElapsedTime();
        goToSection((currentShapeIndex - 1 + shapes.length) % shapes.length);
    }
}

// Mouse movement handler
function onMouseMove(event) {
    // Calculate normalized device coordinates (-1 to +1) for mouse position
    mousePosition.x = (event.clientX / window.innerWidth) * 2 - 1;
    mousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Map mouse position to rotation angles - X position affects Y rotation
    // and Y position affects X rotation (inverted)
    targetRotation.y = mousePosition.x * Math.PI * 0.5; // 90 degrees max rotation
    targetRotation.x = -mousePosition.y * Math.PI * 0.3; // 60 degrees max rotation
}

// Handle touch movement for rotation on mobile
function handleTouchRotation(event) {
    if (event.touches.length === 1) {
        const touch = event.touches[0];
        mousePosition.x = (touch.clientX / window.innerWidth) * 2 - 1;
        mousePosition.y = -(touch.clientY / window.innerHeight) * 2 + 1;
        
        targetRotation.y = mousePosition.x * Math.PI * 0.5;
        targetRotation.x = -mousePosition.y * Math.PI * 0.3;
        
        // Prevent default to avoid scrolling while rotating
        event.preventDefault();
    }
}

// Window resize handler
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
