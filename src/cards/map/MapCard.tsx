import {
  Map,
  Marker,
} from "@vis.gl/react-maplibre";
import "maplibre-gl/dist/maplibre-gl.css"

import ControlPanel from "./ControlPanel";
import Pin from "./Pin";
import { useParameterSubscription } from "@/hooks/use-parameter";
import type { IDockviewPanelProps } from "dockview-react";
import { MapCardParams } from "./schema";
import { extractNumberValue,  } from "@/lib/utils";

export const MapCard = ({
  params,
}: IDockviewPanelProps<MapCardParams>) => {
  const { values } = useParameterSubscription([params.latitudeParameter, params.longitudeParameter])


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
        {(values[params.longitudeParameter] && values[params.latitudeParameter]) ? (
          <Marker
            key={`marker-rocket`}
            latitude={extractNumberValue(values[params.latitudeParameter]!.engValue) ?? 48.47614}
            longitude={extractNumberValue(values[params.longitudeParameter]!.engValue) ?? -81.32903}
            anchor="bottom"
          >
            <Pin />
          </Marker>
        ) : (
          <Marker
            key={`marker-rocket`}
            latitude={48.47614}
            longitude={-81.32903}
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
