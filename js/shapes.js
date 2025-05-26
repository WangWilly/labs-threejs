// --- Shape Generation Functions ---

// Pre-calculate all target positions
function generateShapePositions() {
    targetPositions['Education'] = generateEducationShape();
    targetPositions['Skills'] = generateSkillsShape();
    targetPositions['Projects'] = generateProjectsShape();
    targetPositions['Experience'] = generateExperienceShape();
}

// Generate a shape representing Education (Modified Sphere)
function generateEducationShape() {
    const positions = new Float32Array(particleCount * 3);
    const radius = 1.5;
    const randomFactors = particlesGeometry.attributes.randomFactor.array;
    
    // Create two connected spheres representing two degrees
    for (let i = 0; i < particleCount; i++) {
        const idx = i + 0.5;
        // Determine which sphere this particle belongs to
        const inFirstSphere = i < particleCount * 0.6;
        const phi = Math.acos(1 - 2 * (idx % (particleCount * 0.6)) / (particleCount * 0.6));
        const theta = Math.PI * (1 + Math.sqrt(5)) * idx;
        
        // Base position on sphere
        let x = radius * Math.sin(phi) * Math.cos(theta);
        let y = radius * Math.sin(phi) * Math.sin(theta);
        let z = radius * Math.cos(phi);
        
        // Add perturbation
        const perturbation = (randomFactors[i] - 0.5) * 0.1;
        x += perturbation * x / radius;
        y += perturbation * y / radius;
        z += perturbation * z / radius;
        
        // Offset second sphere
        if (!inFirstSphere) {
            x *= 0.7;
            y *= 0.7;
            z = z - 1.5;
        }
        
        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
    }
    return positions;
}

// Generate a shape representing Skills (Spiral structure)
function generateSkillsShape() {
    const positions = new Float32Array(particleCount * 3);
    const randomFactors = particlesGeometry.attributes.randomFactor.array;
    
    // Create branching structure for different skill categories
    for (let i = 0; i < particleCount; i++) {
        const category = Math.floor(randomFactors[i] * 3); // 3 skill categories
        const t = (i % (particleCount/3)) / (particleCount/3) * Math.PI * 6; // Parameter along spiral
        
        let x, y, z;
        const radius = 0.8 + t * 0.05;
        
        // Different spiral for each category
        switch(category) {
            case 0: // Research interests
                x = radius * Math.cos(t);
                y = t * 0.1;
                z = radius * Math.sin(t);
                break;
            case 1: // Programming skills
                x = radius * Math.cos(t + Math.PI * 2/3);
                y = t * 0.1 - 0.5;
                z = radius * Math.sin(t + Math.PI * 2/3);
                break;
            case 2: // Software skills
                x = radius * Math.cos(t + Math.PI * 4/3);
                y = t * 0.1 - 1.0;
                z = radius * Math.sin(t + Math.PI * 4/3);
                break;
        }
        
        // Add some noise
        const noise = (randomFactors[i] - 0.5) * 0.1;
        x += noise;
        z += noise;
        
        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
    }
    return positions;
}

// Generate a shape representing Projects (4 interconnected nodes)
function generateProjectsShape() {
    const positions = new Float32Array(particleCount * 3);
    const randomFactors = particlesGeometry.attributes.randomFactor.array;
    
    // Create 4 clusters for 4 projects with connecting paths
    for (let i = 0; i < particleCount; i++) {
        const projectIndex = Math.floor(randomFactors[i] * 4); // 4 projects
        const isConnector = randomFactors[i] > 0.85; // Some particles form connectors
        
        let x, y, z;
        
        if (isConnector) {
            // Create connecting paths between project nodes
            const fromProject = Math.floor(randomFactors[i] * 3);
            const toProject = fromProject + 1;
            
            // Get positions of the two projects
            const fromPos = getProjectPosition(fromProject);
            const toPos = getProjectPosition(toProject);
            
            // Interpolate along the path with some randomness
            const t = (randomFactors[(i*13) % particleCount]);
            x = fromPos.x * (1-t) + toPos.x * t;
            y = fromPos.y * (1-t) + toPos.y * t;
            z = fromPos.z * (1-t) + toPos.z * t;
            
            // Add arc to path
            y += Math.sin(t * Math.PI) * 0.5;
            
            // Add some noise
            const noise = (randomFactors[(i*17) % particleCount] - 0.5) * 0.2;
            x += noise;
            z += noise;
        } else {
            // Create project nodes
            const pos = getProjectPosition(projectIndex);
            const phi = Math.acos(1 - 2 * randomFactors[(i*11) % particleCount]);
            const theta = 2 * Math.PI * randomFactors[(i*7) % particleCount];
            
            const radius = 0.4;
            x = pos.x + radius * Math.sin(phi) * Math.cos(theta) * 0.6;
            y = pos.y + radius * Math.sin(phi) * Math.sin(theta) * 0.6;
            z = pos.z + radius * Math.cos(phi) * 0.6;
        }
        
        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
    }
    return positions;
}

// Helper function to get project node positions
function getProjectPosition(index) {
    const positions = [
        { x: -1.2, y: 0.8, z: 0.5 },   // Project 1
        { x: 1.2, y: 0.8, z: 0.5 },    // Project 2
        { x: -1.2, y: -0.8, z: 0.5 },  // Project 3
        { x: 1.2, y: -0.8, z: 0.5 }    // Project 4
    ];
    return positions[index];
}

// Generate a shape representing Work Experience (Timeline structure)
function generateExperienceShape() {
    const positions = new Float32Array(particleCount * 3);
    const randomFactors = particlesGeometry.attributes.randomFactor.array;
    
    // Create a timeline with 3 job nodes
    for (let i = 0; i < particleCount; i++) {
        // Determine which job this particle belongs to
        const jobIndex = Math.floor(randomFactors[i] * 3);
        const isTimeline = randomFactors[i] > 0.9; // Some particles form the timeline
        
        let x, y, z;
        
        if (isTimeline) {
            // Create timeline backbone
            x = (randomFactors[(i*23) % particleCount] - 0.5) * 3;
            y = 0;
            z = -0.5;
            
            // Add some waviness
            y += Math.sin(x * 4) * 0.05;
        } else {
            // Create job nodes expanded vertically
            const jobPosition = -1.5 + jobIndex * 1.5; // Space jobs along x-axis
            const jobSize = 0.4 + (3-jobIndex) * 0.15; // Earlier jobs are slightly larger (more details)
            
            // Base position within job node
            const phi = Math.acos(1 - 2 * randomFactors[(i*31) % particleCount]);
            const theta = 2 * Math.PI * randomFactors[(i*41) % particleCount];
            
            const nodeRadius = jobSize;
            
            // Create vertically expanded cylinder
            const heightFactor = 1.8;
            x = jobPosition + nodeRadius * Math.sin(phi) * Math.cos(theta) * 0.6;
            y = nodeRadius * heightFactor * Math.sin(phi) * Math.sin(theta);
            z = nodeRadius * Math.cos(phi) * 0.6;
            
            // Flatten slightly (more horizontal spread)
            x *= 1.2;
            z *= 0.8;
        }
        
        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
    }
    return positions;
}

// Apply color scheme to particles
function applyColorScheme(scheme) {
    // Always use color-2 scheme (purple/blue/green gradient)
    scheme = 2;
    
    const positions = particlesGeometry.attributes.position.array;
    const colors = particlesGeometry.attributes.color.array;
    const color = new THREE.Color();

    // Ensure bounding box is computed and up-to-date
    if (!particlesGeometry.boundingBox) {
        particlesGeometry.computeBoundingBox();
    }
    let bounds = particlesGeometry.boundingBox;
    // Handle cases where bounding box might be invalid initially
    if (!bounds || !bounds.min || !bounds.max || bounds.isEmpty()) {
        console.warn("Invalid bounding box in applyColorScheme, using defaults.");
        // Provide default fallbacks if bounds are bad
        bounds = { 
            min: new THREE.Vector3(-1,-1,-1), 
            max: new THREE.Vector3(1,1,1),
            getCenter: function(vec) { vec.set(0,0,0); return vec; }
        };
    }

    const minX = bounds.min.x;
    const maxX = bounds.max.x;
    const rangeX = Math.max(0.001, maxX - minX);

    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        // Bounds check for safety
        if (i3 + 2 >= positions.length || i3 + 2 >= colors.length) continue;

        const x = positions[i3];
        
        // Purple/Blue/Green gradient based on X
        const ratioX2 = THREE.MathUtils.clamp((x - minX) / rangeX, 0, 1);
        color.setHSL(0.75 - ratioX2 * 0.3, 0.8, 0.5);

        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;
    }
    particlesGeometry.attributes.color.needsUpdate = true;
}

function setShape(index, updateText = false) {
    const targetShapeName = shapes[index];
    const target = targetPositions[targetShapeName];
    if (!target) {
        console.error(`Target positions for shape "${targetShapeName}" (index ${index}) not found in setShape!`);
        return;
    }
    const positions = particlesGeometry.attributes.position;
    // Use positions.count which is reliable number of vertices
    if (positions.count * 3 !== target.length) {
        console.error(`Position buffer count (${positions.count*3}) does not match target length (${target.length}) in setShape for "${targetShapeName}"!`);
        return;
    }

    for (let i = 0; i < target.length; i++) {
        positions.array[i] = target[i];
    }
    positions.needsUpdate = true; // Tell Three.js the buffer changed

    // Update info text only if requested AND not currently morphing
    if (updateText && !isMorphing) {
        updateShapeInfo();
    }
    // Recompute bounding box after changing shape significantly
    particlesGeometry.computeBoundingBox();
}
