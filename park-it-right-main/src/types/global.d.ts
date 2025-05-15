
declare global {
  interface Window {
    showToast: (message: string) => void;
    showRouteToLot: (showIt: boolean) => void;
  }
}

// Add Leaflet Routing Machine type declarations
declare module 'leaflet' {
  namespace Routing {
    interface RoutingControlOptions {
      waypoints: L.LatLng[];
      router?: any;
      routeWhileDragging?: boolean;
      showAlternatives?: boolean;
      altLineOptions?: any;
      lineOptions?: any;
      createMarker?: (i: number, waypoint: any, n: number) => L.Marker | null;
      fitSelectedRoutes?: boolean;
      addWaypoints?: boolean;
    }

    class Control extends L.Control {
      constructor(options: RoutingControlOptions);
      getContainer(): HTMLElement | null;
      setWaypoints(waypoints: L.LatLng[]): this;
      spliceWaypoints(index: number, deleteCount: number, ...waypoints: L.LatLng[]): L.LatLng[];
      getPlan(): any;
    }

    function control(options: RoutingControlOptions): Control;
  }
}

export {};
