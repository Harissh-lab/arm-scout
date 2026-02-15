import { Shield, AlertTriangle, Check, CheckCircle2, Eye, EyeOff, Settings, BellRing, ThumbsUp, ThumbsDown, Clock, Users, AlertCircle, X, Camera, Compass, Navigation2 } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { notificationService } from "./NotificationService";
import { hazardService, HazardData, formatTimeRemaining, getRelativeTime, ProximityAlert, GPSPosition } from "./HazardService";
import { toast } from "sonner@2.0.3";
import { Progress } from "./ui/progress";
import { MonitoringScreen } from "./MonitoringScreen";

interface SafetyScoutScreenProps {
  onNavigateToSettings: () => void;
}

export function SafetyScoutScreen({ onNavigateToSettings }: SafetyScoutScreenProps) {
  const [scoutMonitoring, setScoutMonitoring] = useState(false);
  const [selectedHazard, setSelectedHazard] = useState<HazardData | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [hazards, setHazards] = useState<HazardData[]>([]);
  const [proximityAlerts, setProximityAlerts] = useState<ProximityAlert[]>([]);
  const [currentPosition, setCurrentPosition] = useState<GPSPosition | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  // Load hazards and check notification status
  useEffect(() => {
    const settings = notificationService.getSettings();
    const hasPermission = typeof Notification !== 'undefined' && Notification.permission === 'granted';
    setNotificationsEnabled(settings.enabled && hasPermission);

    loadHazards();

    // Refresh hazards and proximity alerts every 2 seconds
    const interval = setInterval(() => {
      loadHazards();
      updateProximityAlerts();
      updateGPSPosition();
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  const loadHazards = () => {
    const allHazards = hazardService.getAllHazards();
    setHazards(allHazards);
  };

  const updateProximityAlerts = () => {
    const alerts = hazardService.getProximityAlerts();
    setProximityAlerts(alerts);
  };

  const updateGPSPosition = () => {
    const pos = hazardService.getCurrentGPSPosition();
    setCurrentPosition(pos);
  };

  const handleToggleMonitoring = async () => {
    if (!scoutMonitoring) {
      const started = await hazardService.startMonitoring();
      if (started) {
        setScoutMonitoring(true);
        setCameraActive(true);
        toast.success("Scout Monitoring Active", {
          description: "Camera and GPS monitoring enabled. You'll be alerted to hazards ahead.",
          duration: 3000,
        });
      } else {
        toast.error("Failed to start monitoring", {
          description: "Please enable location permissions.",
          duration: 3000,
        });
      }
    } else {
      hazardService.stopMonitoring();
      setScoutMonitoring(false);
      setCameraActive(false);
      toast.info("Scout Monitoring Stopped", {
        description: "Camera and GPS monitoring disabled.",
        duration: 3000,
      });
    }
  };

  const handleSimulateDetection = () => {
    hazardService.simulateCameraDetection('debris');
    toast.success("Simulated camera detection", {
      description: "Debris detected and logged with current GPS coordinates.",
      duration: 3000,
    });
  };

  const activeHazards = hazards.filter(h => h.status === 'active' || h.status === 'resolving');
  const resolvedHazards = hazards.filter(h => h.status === 'resolved').slice(0, 5);

  const handleConfirmStillThere = (hazardId: string) => {
    const success = hazardService.confirmHazardStillThere(hazardId);
    if (success) {
      toast.success("Thanks for confirming! Hazard status updated.", {
        description: "Other drivers will be alerted about this hazard.",
        duration: 3000,
      });
      loadHazards();
    } else {
      toast.info("You've already confirmed this hazard recently.", {
        description: "You can confirm again in 1 hour.",
        duration: 3000,
      });
    }
  };

  const handleReportGone = (hazardId: string) => {
    const success = hazardService.reportHazardGone(hazardId);
    if (success) {
      const progress = hazardService.getResolutionProgress(hazardId);
      const remaining = progress ? progress.confirmationsNeeded - progress.currentGoneReports : 0;
      
      if (remaining <= 0) {
        toast.success("Hazard marked as resolved!", {
          description: "Thanks for helping keep the system accurate.",
          duration: 3000,
        });
      } else {
        toast.success(`Report submitted. ${remaining} more needed to resolve.`, {
          description: "We verify reports to ensure accuracy.",
          duration: 3000,
        });
      }
      loadHazards();
      
      if (remaining <= 0 && selectedHazard?.id === hazardId) {
        setSelectedHazard(null);
      }
    } else {
      toast.info("You've already reported this hazard recently.", {
        description: "You can report again in 1 hour.",
        duration: 3000,
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'high': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'medium': return 'text-amber-400 bg-amber-500/20 border-amber-500/30';
      case 'low': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      default: return 'text-slate-400 bg-slate-500/20 border-slate-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'resolving': return 'text-amber-400 bg-amber-500/20 border-amber-500/30';
      case 'resolved': return 'text-slate-400 bg-slate-500/20 border-slate-500/30';
      default: return 'text-slate-400 bg-slate-500/20 border-slate-500/30';
    }
  };

  const getSourceIcon = (source: string) => {
    if (source === 'v2x') return '📡';
    if (source === 'your-car') return '🚗';
    if (source === 'user-report') return '📝';
    return '👥';
  };

  const getSourceLabel = (source: string) => {
    if (source === 'v2x') return 'VW Car2X';
    if (source === 'your-car') return 'Camera Detection';
    if (source === 'user-report') return 'User Report';
    return 'Scout Network';
  };

  const coordinateDB = hazardService.getCoordinateDatabase();

  // Show Monitoring Screen when camera is active
  if (scoutMonitoring && cameraActive) {
    return (
      <MonitoringScreen 
        onStopMonitoring={handleToggleMonitoring}
        onSettings={onNavigateToSettings}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFAF9] dark:bg-slate-950 pb-20 sm:pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-white to-[#FDFAF9] dark:from-slate-900 dark:to-slate-950 px-4 pt-6 pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h1 className="text-[#1F2F57] dark:text-slate-100 text-xl mb-1">Hazard Scout</h1>
            <p className="text-[#484B6A] dark:text-slate-400 text-sm">Camera-based hazard detection</p>
          </div>
          <button
            onClick={onNavigateToSettings}
            className="text-[#9394a5] hover:text-[#1F2F57] dark:text-slate-400 dark:hover:text-slate-200"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* Camera & GPS Status Card */}
        <Card className={`${scoutMonitoring ? 'bg-gradient-to-br from-[#0070E1]/10 to-blue-500/10 border-[#0070E1]/30' : 'bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-700/50'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${scoutMonitoring ? 'bg-[#0070E1]/20' : 'bg-slate-200 dark:bg-slate-800'}`}>
                  {scoutMonitoring ? (
                    <Camera className="w-6 h-6 text-[#0070E1] animate-pulse" />
                  ) : (
                    <Camera className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div>
                  <p className="text-[#1F2F57] dark:text-slate-200 text-sm font-medium">Camera Detection</p>
                  <p className="text-[#9394a5] dark:text-slate-400 text-xs">
                    {scoutMonitoring ? "Actively monitoring" : "Tap to start monitoring"}
                  </p>
                </div>
              </div>
              <Switch
                checked={scoutMonitoring}
                onCheckedChange={handleToggleMonitoring}
              />
            </div>

            {/* GPS Status */}
            {currentPosition && (
              <div className="bg-slate-100 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-200 dark:border-slate-700/30 space-y-2">
                <div className="flex items-center gap-2">
                  <Navigation2 className="w-4 h-4 text-green-400" />
                  <p className="text-[#484B6A] dark:text-slate-300 text-xs">GPS Active</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-[#A8A8A8] dark:text-slate-500">Lat: {currentPosition.latitude.toFixed(4)}</p>
                  </div>
                  <div>
                    <p className="text-[#A8A8A8] dark:text-slate-500">Lon: {currentPosition.longitude.toFixed(4)}</p>
                  </div>
                  <div>
                    <p className="text-[#A8A8A8] dark:text-slate-500">Speed: {Math.round(currentPosition.speed)} m/s</p>
                  </div>
                  <div>
                    <p className="text-[#A8A8A8] dark:text-slate-500">Accuracy: ±{Math.round(currentPosition.accuracy)}m</p>
                  </div>
                </div>
              </div>
            )}

            {/* Test button for simulation */}
            {scoutMonitoring && (
              <Button
                onClick={handleSimulateDetection}
                variant="outline"
                className="w-full mt-3 border-[#0070E1]/30 text-[#0070E1] hover:bg-[#0070E1]/10"
                size="sm"
              >
                Simulate Camera Detection (Test)
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Proximity Alerts */}
        {proximityAlerts.length > 0 && (
          <Card className="bg-red-500/10 border-red-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse" />
                <h3 className="text-red-400 text-sm font-medium">⚠️ Hazards Ahead!</h3>
              </div>
              <div className="space-y-2">
                {proximityAlerts.map((alert, idx) => (
                  <div key={idx} className="bg-white/50 dark:bg-slate-900/50 rounded-lg p-3 border border-red-500/20">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[#1F2F57] dark:text-slate-200 text-sm font-medium">{alert.hazard.type}</p>
                        <p className="text-[#9394a5] dark:text-slate-400 text-xs mt-1">
                          {coordinateDB.formatDistance(alert.distanceMeters)} ahead • {coordinateDB.formatDirection(alert.bearing)}
                        </p>
                        {alert.estimatedTimeSeconds && (
                          <p className="text-red-400 text-xs mt-1">
                            ETA: ~{alert.estimatedTimeSeconds}s at current speed
                          </p>
                        )}
                      </div>
                      <Badge className={getSeverityColor(alert.hazard.severity)}>
                        {alert.hazard.severity}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Hazards List */}
        <Card className="bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[#1F2F57] dark:text-slate-200 text-sm">Active Hazards</h3>
              <Badge variant="outline" className="border-slate-300 dark:border-slate-600 text-[#9394a5] dark:text-slate-400 text-xs">
                {activeHazards.length} total
              </Badge>
            </div>

            {activeHazards.length === 0 ? (
              <div className="text-center py-6">
                <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-2 opacity-50" />
                <p className="text-[#9394a5] dark:text-slate-400 text-sm">No active hazards</p>
                <p className="text-[#A8A8A8] dark:text-slate-500 text-xs mt-1">
                  {scoutMonitoring ? "Monitoring for hazards..." : "Start monitoring to detect hazards"}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {activeHazards.map((hazard) => (
                  <div
                    key={hazard.id}
                    onClick={() => setSelectedHazard(hazard)}
                    className="bg-slate-100 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-200 dark:border-slate-700/30 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800/70 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getSeverityColor(hazard.severity)}`}>
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <p className="text-[#1F2F57] dark:text-slate-200 text-sm">{hazard.type}</p>
                            <Badge className={`text-xs ${getSeverityColor(hazard.severity)}`}>
                              {hazard.severity}
                            </Badge>
                            {hazard.status === 'resolving' && (
                              <Badge className="text-xs bg-amber-500/20 text-amber-400 border-amber-500/30">
                                <Clock className="w-2.5 h-2.5 mr-1" />
                                Resolving
                              </Badge>
                            )}
                          </div>
                          <p className="text-[#9394a5] dark:text-slate-400 text-xs mb-1">{hazard.locationName}</p>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs">{getSourceIcon(hazard.source)}</span>
                            <span className="text-[#A8A8A8] dark:text-slate-500 text-xs">{getSourceLabel(hazard.source)}</span>
                            <span className="text-[#D4D4D4] dark:text-slate-600">•</span>
                            <span className="text-[#A8A8A8] dark:text-slate-500 text-xs">{getRelativeTime(hazard.firstDetectedAt)}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs">
                            <div className="flex items-center gap-1">
                              <ThumbsUp className="w-3 h-3 text-green-400" />
                              <span className="text-green-400">{hazard.confirmationCount}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <ThumbsDown className="w-3 h-3 text-red-400" />
                              <span className="text-red-400">{hazard.reportedGoneCount}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Verification Info */}
        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-[#1F2F57] dark:text-slate-200 text-sm mb-1">Community Verification</p>
                <p className="text-[#9394a5] dark:text-slate-400 text-xs leading-relaxed">
                  Tap on any hazard to confirm if it's still there or report it as gone. Your feedback helps keep the system accurate!
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <div className="bg-slate-100 dark:bg-slate-800/50 rounded-lg p-2.5 border border-slate-200 dark:border-slate-700/30 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <ThumbsUp className="w-3.5 h-3.5 text-green-400" />
                  <p className="text-[#484B6A] dark:text-slate-300 text-xs">Still There</p>
                </div>
                <p className="text-[#A8A8A8] dark:text-slate-500 text-[10px]">Extends alert</p>
              </div>
              <div className="bg-slate-100 dark:bg-slate-800/50 rounded-lg p-2.5 border border-slate-200 dark:border-slate-700/30 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <ThumbsDown className="w-3.5 h-3.5 text-red-400" />
                  <p className="text-[#484B6A] dark:text-slate-300 text-xs">Hazard Gone</p>
                </div>
                <p className="text-[#A8A8A8] dark:text-slate-500 text-[10px]">3 reports = resolved</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recently Resolved */}
        {resolvedHazards.length > 0 && (
          <Card className="bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[#1F2F57] dark:text-slate-200 text-sm">Recently Resolved</h3>
                <Badge variant="outline" className="border-slate-300 dark:border-slate-600 text-[#9394a5] dark:text-slate-400 text-xs">
                  {resolvedHazards.length} cleared
                </Badge>
              </div>
              <div className="space-y-2">
                {resolvedHazards.map((hazard) => (
                  <div key={hazard.id} className="bg-slate-50 dark:bg-slate-800/30 rounded-lg p-3 border border-slate-200 dark:border-slate-700/20">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                      <div className="flex-1">
                        <p className="text-[#1F2F57] dark:text-slate-200 text-sm">{hazard.type}</p>
                        <p className="text-[#9394a5] dark:text-slate-400 text-xs">{hazard.locationName}</p>
                      </div>
                      <p className="text-[#A8A8A8] dark:text-slate-500 text-xs">{getRelativeTime(hazard.lastUpdatedAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Selected Hazard Detail Modal */}
      {selectedHazard && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center sm:justify-center p-0 sm:p-4">
          <Card className="w-full sm:max-w-md bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700/50 rounded-t-2xl sm:rounded-2xl max-h-[80vh] overflow-y-auto">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getSeverityColor(selectedHazard.severity)}`}>
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-[#1F2F57] dark:text-slate-200">{selectedHazard.type}</p>
                      <Badge className={`text-xs ${getSeverityColor(selectedHazard.severity)}`}>
                        {selectedHazard.severity}
                      </Badge>
                    </div>
                    <p className="text-[#9394a5] dark:text-slate-400 text-xs">{selectedHazard.locationName}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedHazard(null)}
                  className="text-[#9394a5] hover:text-[#1F2F57] dark:text-slate-400 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mb-3 pb-3 border-b border-slate-200 dark:border-slate-700/30">
                <div className="text-center">
                  <p className="text-[#9394a5] dark:text-slate-400 text-xs mb-0.5">Detected</p>
                  <p className="text-[#1F2F57] dark:text-slate-200 text-sm">{selectedHazard.detectionCount}x</p>
                </div>
                <div className="text-center border-x border-slate-200 dark:border-slate-700/30">
                  <p className="text-[#9394a5] dark:text-slate-400 text-xs mb-0.5">Confirmed</p>
                  <p className="text-green-400 text-sm">{selectedHazard.confirmationCount}</p>
                </div>
                <div className="text-center">
                  <p className="text-[#9394a5] dark:text-slate-400 text-xs mb-0.5">Reported Gone</p>
                  <p className="text-amber-400 text-sm">{selectedHazard.reportedGoneCount}</p>
                </div>
              </div>

              {/* Actions */}
              {selectedHazard.status !== 'resolved' && (
                <div className="space-y-2">
                  <p className="text-[#484B6A] dark:text-slate-300 text-xs mb-2">Help us verify this hazard:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => handleConfirmStillThere(selectedHazard.id)}
                      disabled={hazardService.hasUserConfirmed(selectedHazard.id, 'still-there')}
                      variant="outline"
                      className="w-full border-green-500/30 text-green-400 hover:bg-green-500/10"
                    >
                      {hazardService.hasUserConfirmed(selectedHazard.id, 'still-there') ? (
                        <>
                          <Check className="w-4 h-4 mr-1" />
                          Confirmed
                        </>
                      ) : (
                        <>
                          <ThumbsUp className="w-4 h-4 mr-1" />
                          Still There
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => handleReportGone(selectedHazard.id)}
                      disabled={hazardService.hasUserConfirmed(selectedHazard.id, 'gone')}
                      variant="outline"
                      className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
                    >
                      {hazardService.hasUserConfirmed(selectedHazard.id, 'gone') ? (
                        <>
                          <X className="w-4 h-4 mr-1" />
                          Reported
                        </>
                      ) : (
                        <>
                          <ThumbsDown className="w-4 h-4 mr-1" />
                          Hazard Gone
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {selectedHazard.status === 'resolved' && (
                <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/30">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <p className="text-green-400 text-xs">
                      This hazard has been resolved!
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
