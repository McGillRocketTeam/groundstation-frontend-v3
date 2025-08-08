import {
  Map,
  TerrainControl,
  Marker,
  MarkerDragEvent,
  LngLat,
} from "@vis.gl/react-maplibre";
import "maplibre-gl/dist/maplibre-gl.css"

import ControlPanel from "./ControlPanel";
import Pin from "./Pin";
import { useParameterSubscription } from "@/hooks/use-parameter";
import type { IDockviewPanelProps } from "dockview-react";
import { MapCardParams } from "./schema";
import { extractNumberValue,  } from "@/lib/utils";
import { useCallback, useState } from "react";


export const MapCard = ({
  params,
}: IDockviewPanelProps<MapCardParams>) => {
  const { values } = useParameterSubscription([params.latitudeParameter, params.longitudeParameter])

  const [marker, setMarker] = useState({
    latitude: 40,
    longitude: -100
  });
  const [events, logEvents] = useState<Record<string, LngLat>>({});

  const onMarkerDragStart = useCallback((event: MarkerDragEvent) => {
    logEvents(_events => ({..._events, onDragStart: event.lngLat}));
  }, []);

  const onMarkerDrag = useCallback((event: MarkerDragEvent) => {
    logEvents(_events => ({..._events, onDrag: event.lngLat}));

    setMarker({
      longitude: event.lngLat.lng,
      latitude: event.lngLat.lat
    });
  }, []);

  const onMarkerDragEnd = useCallback((event: MarkerDragEvent) => {
    logEvents(_events => ({..._events, onDragEnd: event.lngLat}));
  }, []);

  return (
    <>
      <div>
        {values[params.latitudeParameter] && extractNumberValue(values[params.latitudeParameter]!.engValue)}
      </div>
      <div>
        {values[params.longitudeParameter] && extractNumberValue(values[params.longitudeParameter]!.engValue)}
      </div>
      <Map
        initialViewState={{
          latitude: 48.47614,
          longitude: -81.32903,
          zoom: 12,
        }}
        maxPitch={85}
        mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
      >
        {values[params.longitudeParameter] && values[params.latitudeParameter] && (
          <Marker
            key={`marker-rocket`}
            latitude={extractNumberValue(values[params.latitudeParameter]!.engValue) ?? 48.47614}
            longitude={extractNumberValue(values[params.longitudeParameter]!.engValue) ?? -81.32903}
            anchor="bottom"
          >
            <Pin />
          </Marker>
        )}
      </Map>
      <ControlPanel />
    </>
  );
};
