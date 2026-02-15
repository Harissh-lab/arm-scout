import { useState, useEffect } from "react";
import { DashboardScreen } from "./DashboardScreen";
import { VehicleStatusScreen } from "./VehicleStatusScreen";
import { SafetyScoutScreen } from "./SafetyScoutScreen";
import { ServiceScreen } from "./ServiceScreen";
import { AccountScreen } from "./AccountScreen";
import { HazardScoutSettingsScreen } from "./HazardScoutSettingsScreen";
import { BottomNavigation } from "./BottomNavigation";
import { useHazardNotifications } from "./useHazardNotifications";
import { hazardService } from "./HazardService";
import { Vehicle } from "../types/vehicle";

type Tab = "home" | "status" | "scout" | "service" | "account";
type Screen = Tab | "hazard-settings";

interface VWConnectAppProps {
  onLogout: () => void;
}

export function VWConnectApp({ onLogout }: VWConnectAppProps) {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [currentScreen, setCurrentScreen] = useState<Screen>("home");

  // Centralized vehicle state
  const [vehicles] = useState<Vehicle[]>([
    {
      id: '1',
      name: 'My Electric',
      model: 'ID.4',
      plateNumber: 'DL 01 AB 1234',
      type: 'electric',
      fuelLevel: 85,
      mileage: 8450,
      range: 340,
      imageUrl: 'https://assets.volkswagen.com/is/image/volkswagenag/ID4-banner1-1920x1080?Zml0PWNyb3AsMSZmbXQ9d2VicCZxbHQ9Nzkmd2lkPTE5MjAmaGVpPTEwODAmYWxpZ249MC4wMCwwLjAwJmJmYz1vZmYmM2E1Nw==',
      isLocked: true
    },
    {
      id: '2',
      name: 'Family Sedan',
      model: 'Virtus',
      plateNumber: 'DL 02 CD 5678',
      type: 'petrol',
      fuelLevel: 72,
      mileage: 12450,
      imageUrl: 'https://assets.volkswagen.com/is/image/volkswagenag/exterior-integrator-led-lamps?Zml0PWNyb3AsMSZmbXQ9d2VicCZxbHQ9Nzkmd2lkPTk2MCZhbGlnbj0wLjAwLDAuMDAmYmZjPW9mZiZhZTFl',
      isLocked: true
    },
    {
      id: '3',
      name: 'Weekend SUV',
      model: 'Tiguan',
      plateNumber: 'DL 03 EF 9012',
      type: 'diesel',
      fuelLevel: 68,
      mileage: 24680,
      imageUrl: 'https://assets.volkswagen.com/is/image/volkswagenag/beyond-bolder-1?Zml0PWNyb3AsMSZmbXQ9d2VicCZxbHQ9Nzkmd2lkPTE5MjAmYWxpZ249MC4wMCwwLjAwJmJmYz1vZmYmNzgwOQ==',
      isLocked: false
    }
  ]);

  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('1');

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId) || vehicles[0];

  // Initialize sample hazards on first load
  useEffect(() => {
    const existingHazards = hazardService.getActiveHazards();
    
    // Only add sample hazards if none exist
    if (existingHazards.length === 0) {
      // Sample hazards - Chennai Airport to Perungudi route
      // Distributed along GST Road, Inner Ring Road, and OMR corridor
      const sampleHazards = [
        // Near Chennai Airport - GST Road exit
        {
          type: 'Pothole',
          severity: 'high' as const,
          location: { latitude: 12.9895, longitude: 80.1698 },
          locationName: 'GST Road - Airport Exit',
          distance: '200m',
          source: 'your-car' as const,
          autoResolveAfterHours: 24,
          requireConfirmationsForResolution: 3
        },
        {
          type: 'Road Work',
          severity: 'medium' as const,
          location: { latitude: 12.9850, longitude: 80.1750 },
          locationName: 'Airport Cargo Terminal Road',
          distance: '600m',
          source: 'v2x' as const,
          autoResolveAfterHours: 48,
          requireConfirmationsForResolution: 3
        },
        // Meenambakkam - GST Road
        {
          type: 'Debris',
          severity: 'high' as const,
          location: { latitude: 12.9820, longitude: 80.1820 },
          locationName: 'GST Road near Meenambakkam',
          distance: '1.2km',
          source: 'network' as const,
          autoResolveAfterHours: 12,
          requireConfirmationsForResolution: 3
        },
        {
          type: 'Speed Bump',
          severity: 'low' as const,
          location: { latitude: 12.9795, longitude: 80.1890 },
          locationName: 'Meenambakkam Main Road',
          distance: '1.5km',
          source: 'network' as const,
          autoResolveAfterHours: 24,
          requireConfirmationsForResolution: 3
        },
        // Pallavaram - Inner Ring Road junction
        {
          type: 'Uneven Surface',
          severity: 'medium' as const,
          location: { latitude: 12.9750, longitude: 80.1950 },
          locationName: 'Pallavaram - Inner Ring Road Junction',
          distance: '2.0km',
          source: 'your-car' as const,
          autoResolveAfterHours: 24,
          requireConfirmationsForResolution: 3
        },
        {
          type: 'Flooding',
          severity: 'high' as const,
          location: { latitude: 12.9720, longitude: 80.2020 },
          locationName: 'Chromepet Main Road',
          distance: '2.5km',
          source: 'v2x' as const,
          autoResolveAfterHours: 18,
          requireConfirmationsForResolution: 3
        },
        // Chromepet - GST Road
        {
          type: 'Pothole',
          severity: 'medium' as const,
          location: { latitude: 12.9690, longitude: 80.2100 },
          locationName: 'Chromepet GST Road',
          distance: '3.2km',
          source: 'network' as const,
          autoResolveAfterHours: 24,
          requireConfirmationsForResolution: 3
        },
        {
          type: 'Road Work',
          severity: 'high' as const,
          location: { latitude: 12.9660, longitude: 80.2150 },
          locationName: 'Chromepet Railway Overbridge',
          distance: '3.8km',
          source: 'v2x' as const,
          autoResolveAfterHours: 48,
          requireConfirmationsForResolution: 3
        },
        // Tambaram area
        {
          type: 'Debris',
          severity: 'medium' as const,
          location: { latitude: 12.9640, longitude: 80.2180 },
          locationName: 'East Tambaram Road',
          distance: '4.2km',
          source: 'your-car' as const,
          autoResolveAfterHours: 12,
          requireConfirmationsForResolution: 3
        },
        {
          type: 'Speed Bump',
          severity: 'low' as const,
          location: { latitude: 12.9625, longitude: 80.2230 },
          locationName: 'Tambaram - Mudichur Road',
          distance: '4.8km',
          source: 'network' as const,
          autoResolveAfterHours: 24,
          requireConfirmationsForResolution: 3
        },
        // Approaching OMR corridor
        {
          type: 'Uneven Surface',
          severity: 'high' as const,
          location: { latitude: 12.9610, longitude: 80.2280 },
          locationName: 'Inner Ring Road - Velachery Junction',
          distance: '5.5km',
          source: 'v2x' as const,
          autoResolveAfterHours: 24,
          requireConfirmationsForResolution: 3
        },
        {
          type: 'Pothole',
          severity: 'medium' as const,
          location: { latitude: 12.9600, longitude: 80.2320 },
          locationName: 'Velachery Main Road',
          distance: '6.0km',
          source: 'your-car' as const,
          autoResolveAfterHours: 24,
          requireConfirmationsForResolution: 3
        },
        // Perungudi - OMR corridor
        {
          type: 'Road Work',
          severity: 'medium' as const,
          location: { latitude: 12.9595, longitude: 80.2370 },
          locationName: 'OMR - Velachery Bypass',
          distance: '6.8km',
          source: 'network' as const,
          autoResolveAfterHours: 48,
          requireConfirmationsForResolution: 3
        },
        {
          type: 'Debris',
          severity: 'low' as const,
          location: { latitude: 12.9605, longitude: 80.2400 },
          locationName: 'OMR Service Road - Perungudi',
          distance: '7.2km',
          source: 'network' as const,
          autoResolveAfterHours: 12,
          requireConfirmationsForResolution: 3
        },
        {
          type: 'Speed Bump',
          severity: 'low' as const,
          location: { latitude: 12.9612, longitude: 80.2429 },
          locationName: 'Perungudi Industrial Estate',
          distance: '7.5km',
          source: 'v2x' as const,
          autoResolveAfterHours: 24,
          requireConfirmationsForResolution: 3
        },
        // Additional hazards on alternate routes
        {
          type: 'Flooding',
          severity: 'medium' as const,
          location: { latitude: 12.9780, longitude: 80.2050 },
          locationName: 'Palavanthangal - Service Road',
          distance: '2.8km',
          source: 'network' as const,
          autoResolveAfterHours: 18,
          requireConfirmationsForResolution: 3
        },
        {
          type: 'Uneven Surface',
          severity: 'high' as const,
          location: { latitude: 12.9650, longitude: 80.2250 },
          locationName: 'Madipakkam Main Road Junction',
          distance: '5.0km',
          source: 'your-car' as const,
          autoResolveAfterHours: 24,
          requireConfirmationsForResolution: 3
        },
        {
          type: 'Pothole',
          severity: 'high' as const,
          location: { latitude: 12.9620, longitude: 80.2350 },
          locationName: 'Thoraipakkam Junction - OMR',
          distance: '6.5km',
          source: 'v2x' as const,
          autoResolveAfterHours: 24,
          requireConfirmationsForResolution: 3
        }
      ];

      sampleHazards.forEach(hazard => {
        hazardService.addHazard(hazard);
      });

      // Simulate some user confirmations on the first hazard
      const hazards = hazardService.getActiveHazards();
      if (hazards.length > 0) {
        // Simulate detection count increases
        hazardService.incrementDetectionCount(hazards[0].id);
        hazardService.incrementDetectionCount(hazards[0].id);
      }
    }
  }, []);

  // Get active hazards for notification monitoring
  const activeHazards = hazardService.getActiveHazards().map(h => ({
    id: h.id,
    type: h.type,
    severity: h.severity,
    distance: h.distance || '0m',
    location: h.locationName,
    latitude: h.location.latitude,
    longitude: h.location.longitude,
  }));

  // Monitor hazards and trigger notifications when appropriate
  useHazardNotifications(activeHazards);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setCurrentScreen(tab);
  };

  const navigateToHazardSettings = () => {
    setCurrentScreen("hazard-settings");
  };

  const navigateBack = () => {
    setCurrentScreen(activeTab);
  };

  const showBottomNav = currentScreen !== "hazard-settings";

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Content */}
      <div className="relative">
        {currentScreen === "home" && (
          <DashboardScreen 
            onNavigateToScout={() => handleTabChange("scout")}
            vehicles={vehicles}
            selectedVehicleId={selectedVehicleId}
            onSelectVehicle={setSelectedVehicleId}
          />
        )}
        {currentScreen === "status" && (
          <VehicleStatusScreen 
            onNavigateToSettings={navigateToHazardSettings}
            vehicle={selectedVehicle}
          />
        )}
        {currentScreen === "scout" && <SafetyScoutScreen onNavigateToSettings={navigateToHazardSettings} />}
        {currentScreen === "service" && (
          <ServiceScreen 
            vehicle={selectedVehicle}
          />
        )}
        {currentScreen === "account" && (
          <AccountScreen 
            onLogout={onLogout} 
            onNavigateToSettings={navigateToHazardSettings}
            vehicles={vehicles}
          />
        )}
        {currentScreen === "hazard-settings" && <HazardScoutSettingsScreen onBack={navigateBack} />}
      </div>

      {/* Bottom Navigation */}
      {showBottomNav && <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />}
    </div>
  );
}
