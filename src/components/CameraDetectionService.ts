// Camera Detection Service for Raspberry Pi Integration
// Handles real-time camera-based hazard detection and updates the database

export interface CameraDetection {
  id: string;
  type: 'debris' | 'pothole' | 'roadblock' | 'accident' | 'flood' | 'construction';
  timestamp: number;
  coordinates: {
    latitude: number;
    longitude: number;
    accuracy: number; // GPS accuracy in meters
  };
  confidence: number; // 0-100, AI model confidence
  imageUrl?: string; // Optional: captured image
  speed: number; // Vehicle speed at detection
  heading: number; // Vehicle direction (0-360 degrees)
}

export interface GPSPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  speed: number;
  heading: number;
}

class CameraDetectionService {
  private static instance: CameraDetectionService;
  private currentPosition: GPSPosition | null = null;
  private detectionCallbacks: ((detection: CameraDetection) => void)[] = [];
  private positionWatchId: number | null = null;
  private isMonitoring: boolean = false;
  private piCameraUrl: string = '';
  private piApiUrl: string = '';

  private constructor() {
    this.loadSettings();
  }

  // Configure Raspberry Pi camera and API endpoints
  configurePiCamera(cameraStreamUrl: string, apiUrl: string = ''): void {
    this.piCameraUrl = cameraStreamUrl;
    this.piApiUrl = apiUrl;
    localStorage.setItem('pi-camera-url', cameraStreamUrl);
    localStorage.setItem('pi-api-url', apiUrl);
  }

  // Get Pi camera stream URL
  getPiCameraUrl(): string {
    if (!this.piCameraUrl) {
      this.piCameraUrl = localStorage.getItem('pi-camera-url') || 'http://raspberrypi.local:8080/stream';
    }
    return this.piCameraUrl;
  }

  // Get Pi API URL
  getPiApiUrl(): string {
    if (!this.piApiUrl) {
      this.piApiUrl = localStorage.getItem('pi-api-url') || 'http://raspberrypi.local:5000/api';
    }
    return this.piApiUrl;
  }

  static getInstance(): CameraDetectionService {
    if (!CameraDetectionService.instance) {
      CameraDetectionService.instance = new CameraDetectionService();
    }
    return CameraDetectionService.instance;
  }

  private loadSettings(): void {
    // Load any saved settings from localStorage
    const savedPosition = localStorage.getItem('last-gps-position');
    if (savedPosition) {
      this.currentPosition = JSON.parse(savedPosition);
    }
  }

  // Start GPS monitoring
  startGPSMonitoring(): Promise<boolean> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.error('GPS not supported on this device');
        resolve(false);
        return;
      }

      this.positionWatchId = navigator.geolocation.watchPosition(
        (position) => {
          this.currentPosition = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
            speed: position.coords.speed || 0,
            heading: position.coords.heading || 0,
          };

          // Save position
          localStorage.setItem('last-gps-position', JSON.stringify(this.currentPosition));
          this.isMonitoring = true;
          resolve(true);
        },
        (error) => {
          console.error('GPS error:', error);
          resolve(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    });
  }

  // Stop GPS monitoring
  stopGPSMonitoring(): void {
    if (this.positionWatchId !== null) {
      navigator.geolocation.clearWatch(this.positionWatchId);
      this.positionWatchId = null;
      this.isMonitoring = false;
    }
  }

  // Get current GPS position
  getCurrentPosition(): GPSPosition | null {
    return this.currentPosition;
  }

  // Handle detection from Raspberry Pi camera
  // This would be called via WebSocket, HTTP polling, or API endpoint
  handleCameraDetection(
    detectionType: CameraDetection['type'],
    confidence: number,
    imageUrl?: string
  ): CameraDetection | null {
    if (!this.currentPosition) {
      console.warn('No GPS position available for detection');
      return null;
    }

    const detection: CameraDetection = {
      id: `detection-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: detectionType,
      timestamp: Date.now(),
      coordinates: {
        latitude: this.currentPosition.latitude,
        longitude: this.currentPosition.longitude,
        accuracy: this.currentPosition.accuracy,
      },
      confidence,
      imageUrl,
      speed: this.currentPosition.speed,
      heading: this.currentPosition.heading,
    };

    // Save detection to localStorage
    this.saveDetection(detection);

    // Notify all listeners
    this.notifyDetectionCallbacks(detection);

    return detection;
  }

  // Register callback for new detections
  onDetection(callback: (detection: CameraDetection) => void): () => void {
    this.detectionCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.detectionCallbacks.indexOf(callback);
      if (index > -1) {
        this.detectionCallbacks.splice(index, 1);
      }
    };
  }

  private notifyDetectionCallbacks(detection: CameraDetection): void {
    this.detectionCallbacks.forEach(callback => {
      try {
        callback(detection);
      } catch (error) {
        console.error('Error in detection callback:', error);
      }
    });
  }

  private saveDetection(detection: CameraDetection): void {
    const detections = this.getAllDetections();
    detections.push(detection);
    
    // Keep only last 1000 detections
    if (detections.length > 1000) {
      detections.splice(0, detections.length - 1000);
    }
    
    localStorage.setItem('camera-detections', JSON.stringify(detections));
  }

  getAllDetections(): CameraDetection[] {
    const saved = localStorage.getItem('camera-detections');
    return saved ? JSON.parse(saved) : [];
  }

  getIsMonitoring(): boolean {
    return this.isMonitoring;
  }

  // Simulate camera detection (for testing without actual Pi camera)
  simulateDetection(type: CameraDetection['type'] = 'debris'): CameraDetection | null {
    const confidence = Math.floor(Math.random() * 20) + 80; // 80-100% confidence
    return this.handleCameraDetection(type, confidence);
  }

  // Clear all detections
  clearAllDetections(): void {
    localStorage.removeItem('camera-detections');
  }
}

export const cameraDetectionService = CameraDetectionService.getInstance();
