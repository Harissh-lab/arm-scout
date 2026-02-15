import { Camera, Navigation2, Gauge, MapPin, AlertTriangle, Shield, X, Settings } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { hazardService, GPSPosition, ProximityAlert } from "./HazardService";
import { cameraDetectionService } from "./CameraDetectionService";

interface MonitoringScreenProps {
  onStopMonitoring: () => void;
  onSettings: () => void;
}

export function MonitoringScreen({ onStopMonitoring, onSettings }: MonitoringScreenProps) {
  const [currentPosition, setCurrentPosition] = useState<GPSPosition | null>(null);
  const [proximityAlerts, setProximityAlerts] = useState<ProximityAlert[]>([]);
  const [piCameraUrl, setPiCameraUrl] = useState<string>('');
  const [cameraError, setCameraError] = useState(false);

  useEffect(() => {
    // Get Pi camera URL
    const url = cameraDetectionService.getPiCameraUrl();
    setPiCameraUrl(url);

    // Update position and alerts every second
    const interval = setInterval(() => {
      const pos = hazardService.getCurrentGPSPosition();
      setCurrentPosition(pos);

      const alerts = hazardService.getProximityAlerts();
      setProximityAlerts(alerts);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const coordinateDB = hazardService.getCoordinateDatabase();

  // Convert m/s to km/h
  const speedKmh = currentPosition ? Math.round((currentPosition.speed || 0) * 3.6) : 0;

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-amber-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Top Bar */}
      <div className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50 px-4 py-3 flex items-center justify-between z-20 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-slate-200 text-sm font-medium">Camera Active</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onSettings}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button
            onClick={onStopMonitoring}
            className="text-slate-400 hover:text-red-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Camera Feed */}
      <div className="flex-1 relative bg-black">
        {!cameraError ? (
          <img 
            src={piCameraUrl}
            alt="Pi Camera Feed"
            className="w-full h-full object-contain"
            onError={() => setCameraError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <Camera className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-sm mb-2">Camera feed not available</p>
              <p className="text-slate-500 text-xs mb-4">
                Expecting stream at: {piCameraUrl}
              </p>
              <Button
                onClick={onSettings}
                variant="outline"
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
                size="sm"
              >
                <Settings className="w-4 h-4 mr-2" />
                Configure Camera
              </Button>
            </div>
          </div>
        )}

        {/* Overlay HUD */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Top Stats Bar - Speed and Location */}
          <div className="absolute top-4 left-4 right-4 flex gap-3">
            {/* Speed Card */}
            <Card className="bg-slate-900/90 backdrop-blur-md border-slate-700/50 pointer-events-auto flex-shrink-0">
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0070E1]/20 flex items-center justify-center">
                    <Gauge className="w-5 h-5 text-[#0070E1]" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">Speed</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-slate-100 text-2xl font-bold">{speedKmh}</span>
                      <span className="text-slate-400 text-sm">km/h</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location Card */}
            {currentPosition && (
              <Card className="bg-slate-900/90 backdrop-blur-md border-slate-700/50 pointer-events-auto flex-1 min-w-0">
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <Navigation2 className="w-4 h-4 text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-400 text-xs mb-1">Current Location</p>
                      <div className="grid grid-cols-2 gap-x-2 text-xs">
                        <div>
                          <span className="text-slate-500">Lat: </span>
                          <span className="text-slate-200">{currentPosition.latitude.toFixed(5)}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Lon: </span>
                          <span className="text-slate-200">{currentPosition.longitude.toFixed(5)}</span>
                        </div>
                      </div>
                      <div className="mt-1 text-xs">
                        <span className="text-slate-500">Accuracy: </span>
                        <span className="text-green-400">±{Math.round(currentPosition.accuracy)}m</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Proximity Alerts - Bottom */}
          {proximityAlerts.length > 0 && (
            <div className="absolute bottom-4 left-4 right-4 space-y-2">
              {proximityAlerts.map((alert, idx) => (
                <Card 
                  key={idx} 
                  className="bg-red-900/95 backdrop-blur-md border-red-500/50 animate-pulse pointer-events-auto"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full ${getSeverityColor(alert.hazard.severity)}/20 flex items-center justify-center flex-shrink-0`}>
                        <AlertTriangle className={`w-6 h-6 ${getSeverityColor(alert.hazard.severity).replace('bg-', 'text-')}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white text-lg font-bold">⚠️ HAZARD AHEAD</span>
                          <Badge className={`${getSeverityColor(alert.hazard.severity)} text-white border-0 text-xs`}>
                            {alert.hazard.severity.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-red-100 text-sm mb-1">{alert.hazard.type}</p>
                        <div className="flex items-center gap-4 text-xs text-red-200">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>{coordinateDB.formatDistance(alert.distanceMeters)} ahead</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Navigation2 className="w-3 h-3" />
                            <span>{coordinateDB.formatDirection(alert.bearing)}</span>
                          </div>
                          {alert.estimatedTimeSeconds && (
                            <div className="flex items-center gap-1">
                              <span>ETA: ~{alert.estimatedTimeSeconds}s</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* No Hazards - Bottom Center */}
          {proximityAlerts.length === 0 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
              <Card className="bg-green-900/80 backdrop-blur-md border-green-500/30 pointer-events-auto">
                <CardContent className="p-3 px-6">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-400" />
                    <span className="text-green-100 text-sm font-medium">All Clear - No Hazards Nearby</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Detection Indicator - Top Right Corner */}
          <div className="absolute top-4 right-4">
            <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/50 rounded-lg px-3 py-2 flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#0070E1] animate-pulse" />
              <span className="text-slate-200 text-xs">Detecting</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Info */}
      <div className="bg-slate-900/95 backdrop-blur-sm border-t border-slate-700/50 px-4 py-2 flex-shrink-0">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span>📡 GPS Active</span>
            <span>🎥 Pi Camera Connected</span>
            <span>⚡ Real-time Detection</span>
          </div>
          <div>
            {hazardService.getActiveHazards().length} hazards in database
          </div>
        </div>
      </div>
    </div>
  );
}
