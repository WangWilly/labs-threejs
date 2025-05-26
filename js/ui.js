// --- UI Functions ---

// Create HTML overlay for resume content
function createResumeOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'resume-overlay';
    document.body.appendChild(overlay);
    updateResumeContent(currentShapeIndex);
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
    
    // Add navigation hint
    html += `<div style="margin-top:20px;font-size:12px;color:#aaa;text-align:center">
            Press arrow keys or click section title to navigate • Section ${sectionIndex + 1} of 4</div>`;
    
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
    if (autoChangeEnabled) {
        shapeInfoElement.textContent = `${resumeSections[currentShapeIndex].title} (Auto-changing)`;
    } else {
        shapeInfoElement.textContent = `${resumeSections[currentShapeIndex].title} (Click to toggle auto-change)`;
    }
}

// Go to a specific section
function goToSection(index) {
    if (isMorphing || index === currentShapeIndex) return;
    
    // Store current position for morphing
    const currentPositions = particlesGeometry.attributes.position.array;
    const startPositionsAttribute = particlesGeometry.attributes.startPosition;
    for(let i=0; i < currentPositions.length; i++) {
        startPositionsAttribute.array[i] = currentPositions[i];
    }
    startPositionsAttribute.needsUpdate = true;
    
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

// Window resize handler
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
