import {
  Map,
  Source,
  Layer,
  TerrainControl,
  Marker,
} from "@vis.gl/react-maplibre";

import ControlPanel from "./ControlPanel";
import type { Terrain, Sky } from "@vis.gl/react-maplibre";
import Pin from "./Pin";
import { useParameterSubscription } from "@/hooks/use-parameter";
import type { IDockviewPanelProps } from "dockview-react";
import { MapCardParams } from "./schema";
import { extractNumberValue,  } from "@/lib/utils";

const sky: Sky = {
  "sky-color": "#80ccff",
  "sky-horizon-blend": 0.5,
  "horizon-color": "#ccddff",
  "horizon-fog-blend": 0.5,
  "fog-color": "#fcf0dd",
  "fog-ground-blend": 0.2,
};

const terrain: Terrain = { source: "terrain-dem", exaggeration: 1.5 };

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
          longitude: 81.32903,
          zoom: 12,
        }}
        maxPitch={85}
        mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
        sky={sky}
        terrain={terrain}
      >
        <Source
          id="terrain-dem"
          type="raster-dem"
          url="https://demotiles.maplibre.org/terrain-tiles/tiles.json"
          tileSize={256}
        />
        <Source
          id="hillshade-dem"
          type="raster-dem"
          url="https://demotiles.maplibre.org/terrain-tiles/tiles.json"
          tileSize={256}
        >
          <Layer
            type="hillshade"
            layout={{ visibility: "visible" }}
            paint={{ "hillshade-shadow-color": "#473B24" }}
          />
        </Source>

        <Marker
          key={`marker-rocket`}
          latitude={45.5060}
          longitude={73.5783}
          anchor="bottom"
        >
          <div>HELLOW ORLD</div>
        </Marker>

        <TerrainControl {...terrain} position="top-left" />
      </Map>
      <ControlPanel />
    </>
  );
};
