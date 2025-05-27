/**
 * Techno Lava Lamp Background
 * Creates an animated, shader-based techno lava lamp effect with geometric patterns
 */

class LavaLampBackground {
    constructor(options = {}) {
        // Default techno options
        this.options = Object.assign({
            colorA: new THREE.Color(0x0a0a0a), // Dark background
            colorB: new THREE.Color(0x00ffff), // Cyan
            colorC: new THREE.Color(0xff00ff), // Magenta
            colorD: new THREE.Color(0xffff00), // Yellow
            speed: 0.8,
            noiseScale: 2.0,
            noiseIntensity: 0.2,
            blobScale: 1.8,
            glitchIntensity: 0.1,
            gridSize: 8.0
        }, options);
        
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.uniforms = null;
        this.mesh = null;
        this.clock = new THREE.Clock();
    }
    
    init(renderer) {
        this.renderer = renderer;
        
        // Create a separate scene and camera for the background
        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        
        // Define shader uniforms
        this.uniforms = {
            u_time: { value: 0 },
            u_resolution: { value: new THREE.Vector2() },
            u_colorA: { value: this.options.colorA },
            u_colorB: { value: this.options.colorB },
            u_colorC: { value: this.options.colorC },
            u_noiseScale: { value: this.options.noiseScale },
            u_noiseIntensity: { value: this.options.noiseIntensity },
            u_blobScale: { value: this.options.blobScale }
        };
        
        // Update resolution uniform
        this.uniforms.u_resolution.value.x = window.innerWidth * this.renderer.getPixelRatio();
        this.uniforms.u_resolution.value.y = window.innerHeight * this.renderer.getPixelRatio();
        
        // Create material with shaders
        const material = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: this.getVertexShader(),
            fragmentShader: this.getFragmentShader(),
            depthWrite: false,
            depthTest: false
        });
        
        // Create a full-screen quad
        const geometry = new THREE.PlaneGeometry(2, 2);
        this.mesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.mesh);
        
        // Setup resize listener
        window.addEventListener('resize', this.onResize.bind(this));
    }
    
    onResize() {
        if (!this.uniforms || !this.renderer) return;
        
        // Update resolution uniform
        this.uniforms.u_resolution.value.x = window.innerWidth * this.renderer.getPixelRatio();
        this.uniforms.u_resolution.value.y = window.innerHeight * this.renderer.getPixelRatio();
    }
    
    update() {
        if (!this.uniforms) return;
        
        // Update time uniform
        this.uniforms.u_time.value = this.clock.getElapsedTime() * this.options.speed;
        
        // Render the background scene
        this.renderer.render(this.scene, this.camera);
    }
    
    getVertexShader() {
        return `
            varying vec2 vUv;
            
            void main() {
                vUv = uv;
                gl_Position = vec4(position, 1.0);
            }
        `;
    }
    
    getFragmentShader() {
        return `
            uniform float u_time;
            uniform vec2 u_resolution;
            uniform vec3 u_colorA;
            uniform vec3 u_colorB;
            uniform vec3 u_colorC;
            uniform float u_noiseScale;
            uniform float u_noiseIntensity;
            uniform float u_blobScale;
            
            varying vec2 vUv;
            
            // Hash function for random values
            float hash(vec2 p) {
                return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
            }
            
            // Simplex 2D noise
            vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
            
            float snoise(vec2 v){
                const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                        -0.577350269189626, 0.024390243902439);
                vec2 i  = floor(v + dot(v, C.yy) );
                vec2 x0 = v -   i + dot(i, C.xx);
                vec2 i1;
                i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
                vec4 x12 = x0.xyxy + C.xxzz;
                x12.xy -= i1;
                i = mod(i, 289.0);
                vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
                + i.x + vec3(0.0, i1.x, 1.0 ));
                vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
                    dot(x12.zw,x12.zw)), 0.0);
                m = m*m ;
                m = m*m ;
                vec3 x = 2.0 * fract(p * C.www) - 1.0;
                vec3 h = abs(x) - 0.5;
                vec3 ox = floor(x + 0.5);
                vec3 a0 = x - ox;
                m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
                vec3 g;
                g.x  = a0.x  * x0.x  + h.x  * x0.y;
                g.yz = a0.yz * x12.xz + h.yz * x12.yw;
                return 130.0 * dot(m, g);
            }
            
            // Techno geometric patterns
            float technoPattern(vec2 uv, float time) {
                vec2 grid = fract(uv * 8.0);
                vec2 id = floor(uv * 8.0);
                
                // Digital squares pattern
                float squares = step(0.7, max(abs(grid.x - 0.5), abs(grid.y - 0.5)));
                
                // Animated lines
                float lines = step(0.95, sin(uv.x * 20.0 + time * 3.0)) + 
                             step(0.95, sin(uv.y * 20.0 + time * 2.0));
                
                // Circuit board pattern
                float circuit = step(0.8, hash(id + floor(time)));
                
                return squares + lines * 0.3 + circuit * 0.5;
            }
            
            // Digital glitch effect
            vec2 glitch(vec2 uv, float time) {
                float glitchStrength = sin(time * 10.0) * 0.1;
                
                // Horizontal glitch lines
                float lineGlitch = step(0.98, sin(uv.y * 100.0 + time * 5.0));
                uv.x += lineGlitch * glitchStrength * sin(time * 20.0);
                
                // Block displacement
                vec2 blockId = floor(uv * 20.0);
                float blockGlitch = hash(blockId + floor(time * 2.0));
                uv.x += step(0.9, blockGlitch) * 0.05 * sin(time * 15.0);
                
                return uv;
            }
            
            // Techno metaballs with geometric distortion
            float technoMetaballs(vec2 uv, float time) {
                float blob = 0.0;
                float scale = u_blobScale;
                
                // Digital blob centers with sharp movements
                vec2 blob1 = vec2(
                    0.5 + 0.4 * sin(time * 0.7),
                    0.5 + 0.4 * cos(time * 0.9)
                );
                
                vec2 blob2 = vec2(
                    0.5 + 0.4 * sin(time * 1.1 + 2.0),
                    0.5 + 0.4 * cos(time * 0.6 + 1.5)
                );
                
                vec2 blob3 = vec2(
                    0.5 + 0.4 * sin(time * 0.5 + 4.0),
                    0.5 + 0.4 * cos(time * 0.8 + 3.0)
                );
                
                // Geometric distortion for techno feel
                float distortion = snoise(uv * 5.0 + time * 0.5) * 0.1;
                uv += distortion;
                
                // Calculate distance with geometric modifications
                float d1 = 1.0 / max(0.01, length(uv - blob1)) * scale;
                float d2 = 1.0 / max(0.01, length(uv - blob2)) * scale;
                float d3 = 1.0 / max(0.01, length(uv - blob3)) * scale;
                
                // Add geometric shapes to blobs
                float geometric1 = step(0.3, max(abs(uv.x - blob1.x), abs(uv.y - blob1.y))) * d1;
                float geometric2 = step(0.3, max(abs(uv.x - blob2.x), abs(uv.y - blob2.y))) * d2;
                
                blob = d1 + d2 + d3 + geometric1 * 0.5 + geometric2 * 0.5;
                
                return blob;
            }
            
            void main() {
                // Normalize coordinates with aspect ratio
                vec2 uv = vUv;
                float aspect = u_resolution.x / u_resolution.y;
                uv.x *= aspect;
                uv.x = (uv.x - 0.5 * aspect) + 0.5;
                
                // Apply glitch effect
                vec2 glitchedUV = glitch(uv, u_time);
                
                // Base techno pattern
                float pattern = technoPattern(glitchedUV, u_time);
                
                // Calculate techno metaball value
                float blob = technoMetaballs(glitchedUV, u_time);
                
                // Dark cyberpunk background
                vec3 color = u_colorA;
                
                // Add grid pattern to background
                vec2 grid = fract(glitchedUV * 20.0);
                float gridLines = step(0.98, max(grid.x, grid.y)) * 0.1;
                color += vec3(0.0, gridLines, gridLines);
                
                // Blob colors with cyberpunk palette
                if (blob > 0.8) {
                    float t = smoothstep(0.8, 2.0, blob);
                    
                    // Multi-color techno blobs
                    vec3 technoColor = mix(u_colorB, u_colorC, sin(u_time * 2.0 + blob * 10.0) * 0.5 + 0.5);
                    
                    // Add yellow highlights for peaks
                    if (blob > 1.5) {
                        float highlight = smoothstep(1.5, 2.5, blob);
                        technoColor = mix(technoColor, vec3(1.0, 1.0, 0.0), highlight * 0.7);
                    }
                    
                    color = mix(color, technoColor, t);
                }
                
                // Add techno pattern overlay
                color += pattern * vec3(0.0, 0.3, 0.5) * 0.3;
                
                // Scanlines effect
                float scanlines = sin(glitchedUV.y * 800.0) * 0.04;
                color += scanlines;
                
                // RGB shift for digital effect
                float shift = sin(u_time * 3.0) * 0.01;
                color.r += sin(glitchedUV.y * 300.0 + u_time * 5.0) * shift;
                color.b -= sin(glitchedUV.y * 300.0 + u_time * 5.0) * shift;
                
                // Increase contrast and saturation for techno feel
                color = pow(color, vec3(0.8));
                color = mix(vec3(dot(color, vec3(0.299, 0.587, 0.114))), color, 1.3);
                
                gl_FragColor = vec4(color, 1.0);
            }
        `;
    }
    
    // Clean up resources
    dispose() {
        if (this.mesh) {
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
        }
        
        window.removeEventListener('resize', this.onResize.bind(this));
    }
}