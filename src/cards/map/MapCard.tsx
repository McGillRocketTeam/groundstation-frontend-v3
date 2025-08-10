import {
  Layer,
  LngLat,
  Map,
  MapLayerMouseEvent,
  MapRef,
  Marker,
  Source,
} from "@vis.gl/react-maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

import Pin from "./Pin";
import { useParameterSubscription } from "@/hooks/use-parameter";
import type { IDockviewPanelProps } from "dockview-react";
import { MapCardParams } from "./schema";
import {
  convertLatLngToUserReadableString,
  extractNumberValue,
  getPairedQualifiedName,
} from "@/lib/utils";
import House from "./House";
import { useTheme } from "@/components/ThemeProvider";
import { QualifiedParameterNameType } from "@/lib/schemas";
import { useEffect, useRef, useState } from "react";
import { customMapStyle } from "./style";

interface Coordinate {
  longitude: number;
  latitude: number;
}

export const MapCard = ({ params }: IDockviewPanelProps<MapCardParams>) => {
  const pairedLatitude = getPairedQualifiedName(
    params.latitudeParameter,
  ) as QualifiedParameterNameType;
  const pairedLongitude = getPairedQualifiedName(
    params.longitudeParameter,
  ) as QualifiedParameterNameType;

  const { values } = useParameterSubscription([
    params.latitudeParameter,
    params.longitudeParameter,
    pairedLatitude,
    pairedLongitude,
  ]);
  const { theme } = useTheme();

  const mapRef = useRef<MapRef>(null);

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
  const pin1TrajectoryGeoJSON: GeoJSON.Feature = {
    type: "Feature",
    properties: {},
    geometry: {
      type: "LineString",
      coordinates: pin1History.map((coord) => [
        coord.longitude,
        coord.latitude,
      ]),
    },
  };

  // Create GeoJSON for the second pin's trajectory
  const pin2TrajectoryGeoJSON: GeoJSON.Feature = {
    type: "Feature",
    properties: {},
    geometry: {
      type: "LineString",
      coordinates: pin2History.map((coord) => [
        coord.longitude,
        coord.latitude,
      ]),
    },
  };

  const [mouseLocation, setMouseLocation] = useState<LngLat>();

  const handleMouseMove = (e: MapLayerMouseEvent) => {
    setMouseLocation(e.lngLat);
  };

  const copyMouseCoordinates = async (latitude: number, longitude: number) => {
    if (mouseLocation) {
      const type = "text/plain";
      const clipboardItemData = {
        [type]: `${latitude}, ${longitude}`,
      };
      const clipboardItem = new ClipboardItem(clipboardItemData);
      await navigator.clipboard.write([clipboardItem]);
    }
  };

  const zoomTo = (
    latitude: number | null | undefined,
    longitude?: number | null | undefined,
  ) => {
    if (
      latitude === undefined ||
      latitude === null ||
      longitude === undefined ||
      latitude === null
    ) {
      console.warn("Didn't zoom because lat and log was not defined");
      return;
    }
    copyMouseCoordinates(latitude, longitude);
    mapRef?.current?.flyTo({ center: [longitude, latitude], duration: 1000 });
  };

  return (
    <>
      <div className="relative grid w-full h-full">
        <div className="absolute top-4 right-4 bg-background z-50 p-2 border grid grid-cols-[auto_1fr_1fr] gap-2 gap-x-4 items-center">
          <div className="grid grid-cols-subgrid col-span-full border-b text-xs text-muted-foreground">
            <button className="w-4" />
            <div>Latitude</div>
            <div>Longitude</div>
          </div>

          {/* Ground Station */}
          <button
            className="size-4 mr-2"
            onClick={() =>
              zoomTo(
                params.groundStationLatitude,
                params.groundStationLongitude,
              )
            }
          >
            <House />
          </button>
          <div>{params.groundStationLatitude ?? "UNDEF"}</div>
          <div>{params.groundStationLongitude ?? "UNDEF"}</div>

          {/* Primary Parameter */}
          <button
            className="size-4 bg-[#ef4444] mr-2"
            onClick={() =>
              zoomTo(
                extractNumberValue(values[params.latitudeParameter]?.engValue),
                extractNumberValue(values[params.longitudeParameter]?.engValue),
              )
            }
          />
          <div>
            {extractNumberValue(values[params.latitudeParameter]?.engValue) ??
              "UNDEF"}
          </div>
          <div>
            {extractNumberValue(values[params.longitudeParameter]?.engValue) ??
              "UNDEF"}
          </div>

          {/* Alternate Parameter */}
          <button
            className="size-4 bg-[#0ea5e9] mr-2"
            onClick={() =>
              zoomTo(
                extractNumberValue(values[pairedLatitude]?.engValue),
                extractNumberValue(values[pairedLongitude]?.engValue),
              )
            }
          />
          <div>
            {extractNumberValue(values[pairedLatitude]?.engValue) ?? "UNDEF"}
          </div>
          <div>
            {extractNumberValue(values[pairedLongitude]?.engValue) ?? "UNDEF"}
          </div>
        </div>
        {mouseLocation && (
          <div className="absolute top-4 left-4 bg-background z-50 p-2 border text-sm">
            <div className="text-muted-foreground text-xs">Mouse Location</div>
            {convertLatLngToUserReadableString(
              mouseLocation.lat,
              mouseLocation.lng,
            )}
          </div>
        )}
        <Map
          ref={mapRef}
          initialViewState={{
            latitude: params.groundStationLatitude ?? 48.47614,
            longitude: params.groundStationLongitude ?? -81.32903,
            zoom: 12,
          }}
          maxPitch={85}
          mapStyle={customMapStyle}
          // mapStyle={theme === "dark" ? "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json" : "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"}
          onMouseMove={handleMouseMove}
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
          {pin2History.length > 1 && (
            <>
              <Source
                id="pin2-trajectory"
                type="geojson"
                data={pin2TrajectoryGeoJSON}
              />
              <Layer
                id="pin1-trajectory-line"
                type="line"
                source="pin2-trajectory"
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
          {values[params.longitudeParameter] &&
          values[params.latitudeParameter] ? (
            <Marker
              key={`marker-rocket-1`}
              latitude={
                extractNumberValue(
                  values[params.latitudeParameter]!.engValue,
                ) ?? 48.47614
              }
              longitude={
                extractNumberValue(
                  values[params.longitudeParameter]!.engValue,
                ) ?? -81.32903
              }
              anchor="bottom"
            >
              <Pin color="#ef4444" />
            </Marker>
          ) : (
            <Marker
              key={`marker-rocket-default-1`}
              latitude={48.47614}
              longitude={-81.32903}
              anchor="bottom"
            >
              <Pin color="#ef4444" />
            </Marker>
          )}

          {values[pairedLongitude] && values[pairedLatitude] ? (
            <Marker
              key={`marker-rocket-2`}
              latitude={
                extractNumberValue(values[pairedLatitude]!.engValue) ?? 48.47614
              }
              longitude={
                extractNumberValue(values[pairedLongitude]!.engValue) ??
                -81.32903
              }
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
