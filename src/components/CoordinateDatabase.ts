// Coordinate-based Hazard Database
// Stores and retrieves hazards by GPS coordinates with proximity detection

export interface CoordinateHazard {
  id: string;
  type: 'debris' | 'pothole' | 'roadblock' | 'accident' | 'flood' | 'construction';
  coordinates: {
    latitude: number;
    longitude: number;
  };
  timestamp: number;
  detectedBy: 'camera' | 'user-report' | 'network';
  status: 'active' | 'resolved';
  confidence: number; // 0-100
  confirmedBy: string[]; // List of device IDs that confirmed
  reportedGoneBy: string[]; // List of device IDs that reported it's gone
  lastUpdated: number;
  imageUrl?: string;
  description?: string;
  severity: 'high' | 'medium' | 'low';
}

export interface ProximityAlert {
  hazard: CoordinateHazard;
  distanceMeters: number;
  bearing: number; // Direction to hazard (0-360 degrees)
  estimatedTimeSeconds?: number; // Time to reach hazard based on current speed
}

class CoordinateDatabase {
  private static instance: CoordinateDatabase;
  private hazards: Map<string, CoordinateHazard> = new Map();
  private readonly ALERT_DISTANCE = 500; // Alert when within 500 meters
  private readonly PROXIMITY_UPDATE_INTERVAL = 2000; // Check every 2 seconds
  private proximityCheckInterval: NodeJS.Timeout | null = null;
  private proximityCallbacks: ((alerts: ProximityAlert[]) => void)[] = [];

  private constructor() {
    this.loadFromStorage();
    this.initializeSampleData();
  }

  static getInstance(): CoordinateDatabase {
    if (!CoordinateDatabase.instance) {
      CoordinateDatabase.instance = new CoordinateDatabase();
    }
    return CoordinateDatabase.instance;
  }

  // Initialize with sample data for demo/testing (only if database is empty)
  private initializeSampleData(): void {
    if (this.hazards.size === 0) {
      // Sample hazards for demonstration
      const sampleHazards = [
        {
          type: 'pothole' as const,
          coordinates: { latitude: 13.0827, longitude: 80.2707 }, // Chennai
          timestamp: Date.now() - 3600000, // 1 hour ago
          detectedBy: 'network' as const,
          status: 'active' as const,
          confidence: 85,
          confirmedBy: ['device-001', 'device-002'],
          reportedGoneBy: [],
          severity: 'medium' as const,
          description: 'Large pothole on main road',
        },
        {
          type: 'debris' as const,
          coordinates: { latitude: 13.0878, longitude: 80.2785 },
          timestamp: Date.now() - 7200000, // 2 hours ago
          detectedBy: 'camera' as const,
          status: 'active' as const,
          confidence: 92,
          confirmedBy: ['device-003'],
          reportedGoneBy: [],
          severity: 'high' as const,
          description: 'Road debris - fallen tree branch',
        },
        {
          type: 'construction' as const,
          coordinates: { latitude: 13.0456, longitude: 80.2548 },
          timestamp: Date.now() - 86400000, // 1 day ago
          detectedBy: 'user-report' as const,
          status: 'active' as const,
          confidence: 100,
          confirmedBy: ['device-004', 'device-005', 'device-006'],
          reportedGoneBy: [],
          severity: 'low' as const,
          description: 'Road construction work in progress',
        },
      ];

      sampleHazards.forEach(hazard => this.addHazard(hazard));
      console.log('✅ Initialized with sample hazard data');
    }
  }

  // Add or update hazard
  addHazard(hazard: Omit<CoordinateHazard, 'id' | 'lastUpdated'>): string {
    const id = `hazard-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newHazard: CoordinateHazard = {
      ...hazard,
      id,
      lastUpdated: Date.now(),
    };

    this.hazards.set(id, newHazard);
    this.saveToStorage();
    return id;
  }

  // Update existing hazard
  updateHazard(id: string, updates: Partial<CoordinateHazard>): boolean {
    const hazard = this.hazards.get(id);
    if (!hazard) return false;

    this.hazards.set(id, {
      ...hazard,
      ...updates,
      lastUpdated: Date.now(),
    });

    this.saveToStorage();
    return true;
  }

  // Get hazard by ID
  getHazard(id: string): CoordinateHazard | undefined {
    return this.hazards.get(id);
  }

  // Get all active hazards
  getActiveHazards(): CoordinateHazard[] {
    return Array.from(this.hazards.values())
      .filter(h => h.status === 'active')
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  // Get all hazards (including resolved)
  getAllHazards(): CoordinateHazard[] {
    return Array.from(this.hazards.values())
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  // Calculate distance between two coordinates (Haversine formula)
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  // Calculate bearing from current position to hazard
  private calculateBearing(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x =
      Math.cos(φ1) * Math.sin(φ2) -
      Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    const θ = Math.atan2(y, x);

    return ((θ * 180) / Math.PI + 360) % 360; // Bearing in degrees
  }

  // Check for hazards near current position
  checkProximity(
    currentLat: number,
    currentLon: number,
    currentSpeed: number = 0, // Speed in m/s
    alertDistanceMeters: number = this.ALERT_DISTANCE
  ): ProximityAlert[] {
    const alerts: ProximityAlert[] = [];

    this.getActiveHazards().forEach(hazard => {
      const distance = this.calculateDistance(
        currentLat,
        currentLon,
        hazard.coordinates.latitude,
        hazard.coordinates.longitude
      );

      if (distance <= alertDistanceMeters) {
        const bearing = this.calculateBearing(
          currentLat,
          currentLon,
          hazard.coordinates.latitude,
          hazard.coordinates.longitude
        );

        const estimatedTimeSeconds =
          currentSpeed > 0 ? Math.round(distance / currentSpeed) : undefined;

        alerts.push({
          hazard,
          distanceMeters: Math.round(distance),
          bearing,
          estimatedTimeSeconds,
        });
      }
    });

    // Sort by distance (nearest first)
    return alerts.sort((a, b) => a.distanceMeters - b.distanceMeters);
  }

  // Start proximity monitoring
  startProximityMonitoring(
    getCurrentPosition: () => { latitude: number; longitude: number; speed: number } | null
  ): void {
    if (this.proximityCheckInterval) {
      return; // Already monitoring
    }

    this.proximityCheckInterval = setInterval(() => {
      const position = getCurrentPosition();
      if (!position) return;

      const alerts = this.checkProximity(
        position.latitude,
        position.longitude,
        position.speed
      );

      if (alerts.length > 0) {
        this.notifyProximityCallbacks(alerts);
      }
    }, this.PROXIMITY_UPDATE_INTERVAL);
  }

  // Stop proximity monitoring
  stopProximityMonitoring(): void {
    if (this.proximityCheckInterval) {
      clearInterval(this.proximityCheckInterval);
      this.proximityCheckInterval = null;
    }
  }

  // Register callback for proximity alerts
  onProximityAlert(callback: (alerts: ProximityAlert[]) => void): () => void {
    this.proximityCallbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.proximityCallbacks.indexOf(callback);
      if (index > -1) {
        this.proximityCallbacks.splice(index, 1);
      }
    };
  }

  private notifyProximityCallbacks(alerts: ProximityAlert[]): void {
    this.proximityCallbacks.forEach(callback => {
      try {
        callback(alerts);
      } catch (error) {
        console.error('Error in proximity callback:', error);
      }
    });
  }

  // Confirm hazard is still there
  confirmHazard(hazardId: string, deviceId: string): boolean {
    const hazard = this.hazards.get(hazardId);
    if (!hazard) return false;

    if (!hazard.confirmedBy.includes(deviceId)) {
      hazard.confirmedBy.push(deviceId);
      hazard.lastUpdated = Date.now();
      this.saveToStorage();
      return true;
    }
    return false;
  }

  // Report hazard is gone
  reportGone(hazardId: string, deviceId: string): boolean {
    const hazard = this.hazards.get(hazardId);
    if (!hazard) return false;

    if (!hazard.reportedGoneBy.includes(deviceId)) {
      hazard.reportedGoneBy.push(deviceId);
      hazard.lastUpdated = Date.now();

      // Auto-resolve if 3 or more people report it's gone
      if (hazard.reportedGoneBy.length >= 3) {
        hazard.status = 'resolved';
      }

      this.saveToStorage();
      return true;
    }
    return false;
  }

  // Format distance for display
  formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  }

  // Format bearing as direction
  formatDirection(bearing: number): string {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(bearing / 45) % 8;
    return directions[index];
  }

  // Save to localStorage
  private saveToStorage(): void {
    const data = Array.from(this.hazards.values());
    localStorage.setItem('coordinate-hazards-db', JSON.stringify(data));
  }

  // Load from localStorage
  private loadFromStorage(): void {
    const saved = localStorage.getItem('coordinate-hazards-db');
    if (saved) {
      try {
        const data: CoordinateHazard[] = JSON.parse(saved);
        this.hazards.clear();
        data.forEach(hazard => {
          this.hazards.set(hazard.id, hazard);
        });
      } catch (error) {
        console.error('Error loading hazards from storage:', error);
      }
    }
  }

  // Clear all hazards (for testing)
  clearAll(): void {
    this.hazards.clear();
    this.saveToStorage();
  }

  // Get statistics
  getStats(): {
    total: number;
    active: number;
    resolved: number;
    byType: Record<string, number>;
  } {
    const all = this.getAllHazards();
    const byType: Record<string, number> = {};

    all.forEach(h => {
      byType[h.type] = (byType[h.type] || 0) + 1;
    });

    return {
      total: all.length,
      active: all.filter(h => h.status === 'active').length,
      resolved: all.filter(h => h.status === 'resolved').length,
      byType,
    };
  }
}

export const coordinateDatabase = CoordinateDatabase.getInstance();
