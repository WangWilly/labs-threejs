# Labs Three.js

## What is Three.js?

[Three.js](https://threejs.org/) is a lightweight 3D graphics library that makes WebGL easier to use. It allows you to create and display animated 3D computer graphics in a web browser without having to work directly with WebGL's complex API.

## Basic Setup

### 1. Including Three.js in your HTML

There are several ways to include Three.js in your project:

**Using a CDN:**
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
```

**Using npm:**
```bash
npm install three
```
Then import it in your JavaScript:
```javascript
import * as THREE from 'three';
```

### 2. Creating a Basic Three.js Scene

Here's a minimal HTML template to set up a Three.js scene:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>My first Three.js app</title>
    <style>
        body { margin: 0; overflow: hidden; }
        canvas { display: block; }
    </style>
</head>
<body>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script>
        // Your Three.js code will go here
    </script>
</body>
</html>
```

## Core Concepts

### Scene

A scene is a container for all your 3D objects, lights, and cameras.

```javascript
const scene = new THREE.Scene();
// Optional: set background color
scene.background = new THREE.Color(0x000000); // black
```

### Camera

The camera defines what's visible. The most common camera is `PerspectiveCamera`.

```javascript
// Parameters: FOV, aspect ratio, near clipping plane, far clipping plane
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5; // Move camera back
```

### Renderer

The renderer draws what the camera sees onto a canvas.

```javascript
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);
```

### Creating 3D Objects

Every 3D object in Three.js is made from a geometry (shape) and a material (appearance).

```javascript
// Create a cube
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);
```

### Animation Loop

Use `requestAnimationFrame` to create an animation loop.

```javascript
function animate() {
    requestAnimationFrame(animate);
    
    // Update objects here
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    
    // Render the scene
    renderer.render(scene, camera);
}
animate();
```

### Handling Resizing

Make your scene responsive to window resizing.

```javascript
window.addEventListener('resize', () => {
    // Update camera aspect ratio
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    
    // Update renderer size
    renderer.setSize(window.innerWidth, window.innerHeight);
});
```

## Materials

Three.js offers various materials for different rendering styles:

```javascript
// Basic material (not affected by light)
const basicMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

// Standard PBR material (reacts to light)
const standardMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xff0000,
    roughness: 0.5,
    metalness: 0.5
});

// Phong material (shiny surfaces)
const phongMaterial = new THREE.MeshPhongMaterial({ 
    color: 0xff0000,
    shininess: 100
});

// Lambert material (matte surfaces)
const lambertMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
```

## Lighting

Add lights to illuminate your scene:

```javascript
// Ambient light (general illumination)
const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);

// Directional light (like sunlight)
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// Point light (like a light bulb)
const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(0, 10, 0);
scene.add(pointLight);

// Spotlight (like a flashlight)
const spotLight = new THREE.SpotLight(0xffffff, 1);
spotLight.position.set(0, 10, 0);
spotLight.angle = Math.PI / 4;
spotLight.penumbra = 0.1;
scene.add(spotLight);
```

## User Controls

Add camera controls for user interaction with `OrbitControls`:

```html
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
<script>
    // After setting up your scene, camera, and renderer:
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    
    function animate() {
        requestAnimationFrame(animate);
        controls.update(); // Required if damping is enabled
        renderer.render(scene, camera);
    }
    animate();
</script>
```

## Loading 3D Models

Load external 3D models using the GLTF loader:

```html
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js"></script>
<script>
    const loader = new THREE.GLTFLoader();
    
    loader.load(
        'path/to/model.glb',           // Path to model
        function (gltf) {              // On load callback
            scene.add(gltf.scene);
        },
        function (xhr) {               // On progress callback
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (error) {             // On error callback
            console.error('An error happened', error);
        }
    );
</script>
```

## Adding Textures

Apply textures to your materials:

```javascript
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('path/to/texture.jpg');

const material = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.7,
    metalness: 0.2
});

const cube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material);
scene.add(cube);
```

## Creating Particles

Create particle systems for effects like stars or smoke:

```javascript
const particlesGeometry = new THREE.BufferGeometry();
const count = 5000;

// Create positions for each particle
const positions = new Float32Array(count * 3);
for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

// Create material for particles
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.02,
    color: 0xffffff
});

// Create the particle system
const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particleSystem);
```

## Adding Shadows

Enable shadows for more realistic rendering:

```javascript
// Enable shadows in the renderer
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Configure objects to cast and receive shadows
directionalLight.castShadow = true;
cube.castShadow = true;
floor.receiveShadow = true;

// Adjust shadow camera (for directional lights)
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
```

## Advanced: Post-Processing Effects

Add visual effects like bloom, blur, or film grain:

```html
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/EffectComposer.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/RenderPass.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/UnrealBloomPass.js"></script>

<script>
    // Set up composer
    const composer = new THREE.EffectComposer(renderer);
    const renderPass = new THREE.RenderPass(scene, camera);
    composer.addPass(renderPass);
    
    // Add bloom effect
    const bloomPass = new THREE.UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        1.5, 0.4, 0.85
    );
    composer.addPass(bloomPass);
    
    // Use composer instead of renderer in animation loop
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        composer.render();
    }
</script>
```

## Performance Tips

1. **Reuse geometries and materials** to reduce WebGL calls
2. **Use BufferGeometry** instead of Geometry (which is deprecated)
3. **Limit the number of lights** in your scene
4. **Use Object3D.frustumCulled** to hide objects out of view
5. **Dispose of unused objects** with `.dispose()` to free memory
6. **Use texture compression** for large textures
7. **Consider using instanced meshes** for many similar objects
8. **Monitor performance** with stats.js:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/stats.js/r17/Stats.min.js"></script>
<script>
    const stats = new Stats();
    document.body.appendChild(stats.dom);
    
    function animate() {
        stats.begin();
        
        // Your render code here
        
        stats.end();
        requestAnimationFrame(animate);
    }
</script>
```

## Debugging Tools

Use the Three.js Inspector Chrome extension or built-in helpers:

```javascript
// Add axes helper
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// Add grid helper
const gridHelper = new THREE.GridHelper(10, 10);
scene.add(gridHelper);

// Add camera helper (useful for shadow debugging)
const cameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
scene.add(cameraHelper);
```

## Resources

- [Three.js Documentation](https://threejs.org/docs/)
- [Three.js Examples](https://threejs.org/examples/)
- [Three.js Fundamentals](https://threejsfundamentals.org/)
- [Three.js Forum](https://discourse.threejs.org/)
- [WebGL Fundamentals](https://webglfundamentals.org/)

## Browser Compatibility

Three.js works in all modern browsers that support WebGL:
- Chrome
- Firefox
- Safari
- Edge
- Opera

Mobile support depends on the device's WebGL capabilities.

---

This guide covers the basics of using Three.js in HTML. For more specific examples and tutorials, check out the resources listed above or explore the examples included in this repository.
