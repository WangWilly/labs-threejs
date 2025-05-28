/**
 * Motion and Orientation Detection
 * Handles device motion events and gyroscope control
 */

class MotionDetector {
    constructor(options = {}) {
        this.options = Object.assign({
            shakeThreshold: 15,
            minTimeBetweenShakes: 1000,
            rotationSpeed: 2.0,
            maxRotationAngle: Math.PI * 0.3
        }, options);
        
        this.gyroscopeEnabled = false;
        this.deviceMotionEnabled = false;
        this.lastAcceleration = { x: 0, y: 0, z: 0 };
        this.shakeTimeout = null;
        this.lastShakeTime = 0;
        this.onShake = options.onShake || (() => {});
        this.onRotation = options.onRotation || (() => {});
    }
    
    init() {
        return new Promise((resolve, reject) => {
            if (!window.DeviceOrientationEvent && !window.DeviceMotionEvent) {
                reject(new Error('Device does not support motion or orientation events'));
                return;
            }
            
            // Check if we need to request permission (iOS 13+)
            if (typeof DeviceOrientationEvent.requestPermission === 'function') {
                // Will need manual user interaction to request permission
                resolve({ requiresPermission: true });
            } else {
                // Setup listeners immediately
                this._setupEventListeners();
                resolve({ requiresPermission: false });
            }
        });
    }
    
    requestPermission() {
        return new Promise((resolve, reject) => {
            if (typeof DeviceOrientationEvent.requestPermission !== 'function') {
                reject(new Error('Permission request not required on this device'));
                return;
            }
            
            DeviceOrientationEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        // Setup orientation listener
                        this.gyroscopeEnabled = true;
                        window.addEventListener('deviceorientation', this._handleOrientation.bind(this));
                        
                        // Also try to get device motion
                        if (typeof DeviceMotionEvent.requestPermission === 'function') {
                            DeviceMotionEvent.requestPermission()
                                .then(motionState => {
                                    if (motionState === 'granted') {
                                        this.deviceMotionEnabled = true;
                                        window.addEventListener('devicemotion', this._handleMotion.bind(this));
                                    }
                                    resolve({ orientation: true, motion: this.deviceMotionEnabled });
                                })
                                .catch(error => {
                                    resolve({ orientation: true, motion: false });
                                });
                        } else {
                            window.addEventListener('devicemotion', this._handleMotion.bind(this));
                            this.deviceMotionEnabled = true;
                            resolve({ orientation: true, motion: true });
                        }
                    } else {
                        reject(new Error('Permission denied'));
                    }
                })
                .catch(reject);
        });
    }
    
    _setupEventListeners() {
        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', this._handleOrientation.bind(this));
            this.gyroscopeEnabled = true;
        }
        
        if (window.DeviceMotionEvent) {
            window.addEventListener('devicemotion', this._handleMotion.bind(this));
            this.deviceMotionEnabled = true;
        }
    }
    
    _handleOrientation(event) {
        if (!this.gyroscopeEnabled) return;
        
        const beta = event.beta;  // X-axis rotation (-180 to 180)
        const gamma = event.gamma; // Y-axis rotation (-90 to 90)
        
        if (beta !== null && gamma !== null) {
            const maxAngle = this.options.maxRotationAngle;
            
            // Calculate rotation values
            const rotationX = THREE.MathUtils.mapLinear(
                THREE.MathUtils.clamp(beta - 45, -45, 45), 
                -45, 45, 
                maxAngle, -maxAngle
            );
            
            const rotationY = THREE.MathUtils.mapLinear(
                THREE.MathUtils.clamp(gamma, -45, 45), 
                -45, 45, 
                maxAngle, -maxAngle
            );
            
            // Call the rotation handler
            this.onRotation({
                x: rotationX,
                y: rotationY
            });
        }
    }
    
    _handleMotion(event) {
        if (!this.deviceMotionEnabled) return;
        
        const acceleration = event.accelerationIncludingGravity;
        
        if (!acceleration) return;
        
        // Calculate acceleration change
        const deltaX = Math.abs(acceleration.x - this.lastAcceleration.x);
        const deltaY = Math.abs(acceleration.y - this.lastAcceleration.y);
        const deltaZ = Math.abs(acceleration.z - this.lastAcceleration.z);
        
        // Update last acceleration
        this.lastAcceleration.x = acceleration.x;
        this.lastAcceleration.y = acceleration.y;
        this.lastAcceleration.z = acceleration.z;
        
        // Calculate total change
        const totalChange = deltaX + deltaY + deltaZ;
        
        // Check if shake exceeds threshold
        if (totalChange > this.options.shakeThreshold) {
            const now = Date.now();
            
            // Prevent multiple shakes in short succession
            if (now - this.lastShakeTime > this.options.minTimeBetweenShakes) {
                this._detectShake();
                this.lastShakeTime = now;
            }
        }
    }
    
    _detectShake() {
        // If already processing a shake, ignore
        if (this.shakeTimeout) return;
        
        // Debounce the shake detection
        // The use of an arrow function for setTimeout is CSP-compliant, avoiding string evaluation.
        this.shakeTimeout = setTimeout(() => {
            this.onShake();
            this.shakeTimeout = null;
        }, 300);
    }
    
    isSupported() {
        return !!(window.DeviceOrientationEvent || window.DeviceMotionEvent);
    }
    
    isPermissionRequired() {
        return typeof DeviceOrientationEvent.requestPermission === 'function';
    }
}
