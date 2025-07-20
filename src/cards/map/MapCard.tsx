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

const sky: Sky = {
  "sky-color": "#80ccff",
  "sky-horizon-blend": 0.5,
  "horizon-color": "#ccddff",
  "horizon-fog-blend": 0.5,
  "fog-color": "#fcf0dd",
  "fog-ground-blend": 0.2,
};

const terrain: Terrain = { source: "terrain-dem", exaggeration: 1.5 };

export const MapCard = () => {
  return (
    <>
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
          latitude={48.47614}
          longitude={81.32903}
          anchor="bottom"
        >
          <Pin />
        </Marker>

        <TerrainControl {...terrain} position="top-left" />
      </Map>
      <ControlPanel />
    </>
  );
};
