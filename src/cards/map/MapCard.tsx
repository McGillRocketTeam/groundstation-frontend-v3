import {
    Layer,
  Map,
  Marker,
  Source,
} from "@vis.gl/react-maplibre";
import "maplibre-gl/dist/maplibre-gl.css"

import Pin from "./Pin";
import { useParameterSubscription } from "@/hooks/use-parameter";
import type { IDockviewPanelProps } from "dockview-react";
import { MapCardParams } from "./schema";
import { extractNumberValue, getPairedQualifiedName, } from "@/lib/utils";
import House from "./House";
import { useTheme } from "@/components/ThemeProvider";
import { QualifiedParameterNameType } from "@/lib/schemas";
import { useEffect, useState } from "react";

interface Coordinate {
  longitude: number;
  latitude: number;
}

export const MapCard = ({
  params,
}: IDockviewPanelProps<MapCardParams>) => {
  const pairedLatitude = getPairedQualifiedName(params.latitudeParameter) as QualifiedParameterNameType
  const pairedLongitude = getPairedQualifiedName(params.longitudeParameter) as QualifiedParameterNameType


  const { values } = useParameterSubscription([
    params.latitudeParameter,
    params.longitudeParameter,
    pairedLatitude,
    pairedLongitude,
  ])
  const { theme } = useTheme()

  // State to store the history of the first pin's location
  const [pin1History, setPin1History] = useState<Coordinate[]>([]);
  // State to store the history of the second pin's location
  const [pin2History, setPin2History] = useState<Coordinate[]>([]);

  // Effect to update the history of the first pin
  useEffect(() => {
    const currentLat = extractNumberValue(
      values[params.latitudeParameter]?.engValue,
    );
    const currentLon = extractNumberValue(
      values[params.longitudeParameter]?.engValue,
    );

    if (currentLat && currentLon) {
      setPin1History((prevHistory) => [
        ...prevHistory,
        { latitude: currentLat, longitude: currentLon },
      ]);
    }
  }, [
      values[params.latitudeParameter],
      values[params.longitudeParameter],
      params.latitudeParameter,
      params.longitudeParameter,
    ]);

  // Effect to update the history of the second pin
  useEffect(() => {
    const pairedLat = extractNumberValue(values[pairedLatitude]?.engValue);
    const pairedLon = extractNumberValue(values[pairedLongitude]?.engValue);

    if (pairedLat && pairedLon) {
      setPin2History((prevHistory) => [
        ...prevHistory,
        { latitude: pairedLat, longitude: pairedLon },
      ]);
    }
  }, [
      values[pairedLatitude],
      values[pairedLongitude],
      pairedLatitude,
      pairedLongitude,
    ]);

  // Create GeoJSON for the first pin's trajectory
  const pin1TrajectoryGeoJSON = {
    type: "Feature",
    properties: {},
    geometry: {
      type: "LineString",
      coordinates: pin1History.map((coord) => [coord.longitude, coord.latitude]),
    },
  };

  // Create GeoJSON for the second pin's trajectory
  const pin2TrajectoryGeoJSON = {
    type: "Feature",
    properties: {},
    geometry: {
      type: "LineString",
      coordinates: pin2History.map((coord) => [coord.longitude, coord.latitude]),
    },
  };

  return (
    <>
      <div className="relative">
        <div className="absolute top-4 right-4 bg-background">Hello World</div>
        <Map
          initialViewState={{
            latitude: params.groundStationLatitude ?? 48.47614,
            longitude: params.groundStationLongitude ?? -81.32903,
            zoom: 12,
          }}
          maxPitch={85}
          mapStyle={theme === "dark" ? "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json" : "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"}
        >

          {pin1History.length > 1 && (
            <>
              <Source
                id="pin1-trajectory"
                type="geojson"
                data={pin1TrajectoryGeoJSON}
              />
              <Layer
                id="pin1-trajectory-line"
                type="line"
                source="pin1-trajectory"
                layout={{
                  "line-join": "round",
                  "line-cap": "round",
                }}
                paint={{
                  "line-color": "#facc15", // Yellow color for the first pin's line
                  "line-width": 3,
                }}
              />
            </>
          )}
          {params.groundStationLatitude && params.groundStationLongitude && (
            <Marker
              latitude={params.groundStationLatitude}
              longitude={params.groundStationLongitude}
              anchor="bottom"
            >
              <House />
            </Marker>
          )}
          {(values[params.longitudeParameter] && values[params.latitudeParameter]) ? (
            <Marker
              key={`marker-rocket-1`}
              latitude={extractNumberValue(values[params.latitudeParameter]!.engValue) ?? 48.47614}
              longitude={extractNumberValue(values[params.longitudeParameter]!.engValue) ?? -81.32903}
              anchor="bottom"
            >
              <Pin />
            </Marker>
          ) : (
              <Marker
                key={`marker-rocket-default-1`}
                latitude={48.47614}
                longitude={-81.32903}
                anchor="bottom"
              >
                <Pin />
              </Marker>
            )}

          {(values[pairedLongitude] && values[pairedLatitude]) ? (
            <Marker
              key={`marker-rocket-2`}
              latitude={extractNumberValue(values[pairedLatitude]!.engValue) ?? 48.47614}
              longitude={extractNumberValue(values[pairedLongitude]!.engValue) ?? -81.32903}
              anchor="bottom"
            >
              <Pin color="#0ea5e9" />
            </Marker>
          ) : (
              <Marker
                key={`marker-rocket-default-2`}
                latitude={48.47614}
                longitude={-81.32903}
                anchor="bottom"
              >
                <Pin color="#0ea5e9" size={30} />
              </Marker>
            )}
        </Map>
      </div>
    </>
  );
};
