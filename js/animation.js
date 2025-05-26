// --- Animation Functions ---

// Main animation loop
function animate() {
    requestAnimationFrame(animate);

    const deltaTime = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

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

    // Optional: Slow rotation for background stars
    if (stars) {
        stars.rotation.y += deltaTime * 0.005;
    }

    renderer.render(scene, camera);
}

// Update morphing animation
function updateMorph(deltaTime) {
    if (!isMorphing) return;

    // Ensure morphDuration is positive
    if (morphDuration <= 0) {
        console.error("morphDuration must be positive!");
        isMorphing = false;
        shapeInfoElement.textContent = `Error: Invalid morph duration`;
        return;
    }

    morphProgress += deltaTime;
    // 1. Calculate the raw progress based on time elapsed
    let rawProgressRatio = morphProgress / morphDuration;

    // 2. Clamp the RAW progress ratio between 0 and 1
    // This value will determine if the animation time is complete
    const clampedRawProgressRatio = Math.max(0.0, Math.min(rawProgressRatio, 1.0));

    // 3. Apply easing function ONLY to the clamped ratio for interpolation
    let easedProgressRatio = clampedRawProgressRatio < 0.5 ? 2 * clampedRawProgressRatio * clampedRawProgressRatio : 1 - Math.pow(-2 * clampedRawProgressRatio + 2, 2) / 2;
    // Optional: Clamp eased value too, just to be safe (though shouldn't be needed now)
    easedProgressRatio = Math.max(0.0, Math.min(easedProgressRatio, 1.0));

    const currentPosAttr = particlesGeometry.attributes.position;
    const startPositions = particlesGeometry.attributes.startPosition.array;
    const targetShapeName = shapes[currentShapeIndex];
    const target = targetPositions[targetShapeName];

    // --- Crucial Checks ---
    if (!target) {
        console.error(`Target positions for shape "${targetShapeName}" (index ${currentShapeIndex}) not found!`);
        isMorphing = false;
        shapeInfoElement.textContent = `Error: Target shape data missing`;
        return;
    }
    if (target.length !== currentPosAttr.count * 3 || startPositions.length !== currentPosAttr.count * 3) {
        console.error(`Array length mismatch! Morphing to "${targetShapeName}".`);
        isMorphing = false;
        shapeInfoElement.textContent = `Error: Shape data size mismatch`;
        return;
    }
    // --- End Crucial Checks ---

    // 4. Interpolate using the EASED progress ratio
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const startX = startPositions[i3], startY = startPositions[i3 + 1], startZ = startPositions[i3 + 2];
        const targetX = target[i3], targetY = target[i3 + 1], targetZ = target[i3 + 2];

        currentPosAttr.array[i3] = THREE.MathUtils.lerp(startX, targetX, easedProgressRatio);
        currentPosAttr.array[i3 + 1] = THREE.MathUtils.lerp(startY, targetY, easedProgressRatio);
        currentPosAttr.array[i3 + 2] = THREE.MathUtils.lerp(startZ, targetZ, easedProgressRatio);
    }
    currentPosAttr.needsUpdate = true;

    // Apply color-2 scheme while morphing
    applyColorScheme(currentColorScheme);

    // 5. Check for completion using the CLAMPED RAW progress ratio
    if (clampedRawProgressRatio >= 1.0) {
        isMorphing = false; // Reset flag FIRST
        morphProgress = 0;  // Reset progress time

        try {
            // Snap precisely to the final target position
            setShape(currentShapeIndex, false); // updateText = false
        } catch (e) {
            console.error("Error during setShape in morph completion:", e);
        }

        // Update UI elements AFTER resetting isMorphing flag
        updateShapeInfo();
        updateResumeContent(currentShapeIndex); // Update resume section

        // Apply color-2 scheme precisely
        try {
            applyColorScheme(currentColorScheme);
        } catch(e) {
            console.error("Error during final applyColorScheme:", e);
        }
    }
}
