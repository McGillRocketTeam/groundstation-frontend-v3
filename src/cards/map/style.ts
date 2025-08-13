import { StyleSpecification } from "@vis.gl/react-maplibre";

/**
 * Defines different layers for the map.
 *
 * Instructions for setting up local maps:
 *
 * 1. Download https://github.com/consbio/mbtileserver
 * 2. Download https://data.maptiler.com/downloads/dataset/satellite/north-america/canada/montreal/
 * 3. Make a folder called `tilesets` and run `mbtileserver -p 8080` in the parent directory
 */
export const customMapStyle = {
  name: "OSM + Sattelite",
  version: 8,
  glyphs: "http://localhost:5173/{fontstack}/{range}.pbf",
  sources: {
    worldLowQuality: {
      type: "raster",
      tiles: [
        "http://localhost:8081/services/worldLowQuality/tiles/{z}/{x}/{y}.jpg",
      ],
      tileSize: 256,
      bounds: [
        -165.219, -88.6959, 178.999, 88.5106
      ],
    },
    ontarioFull: {
      type: "raster",
      tiles: [
        "http://localhost:8081/services/satellite-2017-11-02_canada_ontario/tiles/{z}/{x}/{y}.jpg",
      ],
      tileSize: 256,
      bounds: [
        -95.15965, 41.6377, -74.30998, 57.50826
      ],
    },
    timminsCity: {
      type: "raster",
      tiles: [
        "http://localhost:8081/services/timminsCity/tiles/{z}/{x}/{y}.jpg",
      ],
      tileSize: 256,
      bounds: [
        -81.511, 48.3795, -81.1542, 48.5736
      ],
    },
    launchCanada1: {
      type: "raster",
      tiles: [
        "http://localhost:8081/services/launchcanada/tiles/{z}/{x}/{y}.jpg",
      ],
      tileSize: 256,
      bounds: [
        -84.4429, 46.535, -79.3033, 49.358
      ],
      minzoom: 0,
      maxzoom: 18
    },
    launchCanada2: {
      type: "raster",
      tiles: [
        "http://localhost:8081/services/launchcanada2/tiles/{z}/{x}/{y}.jpg",
      ],
      tileSize: 256,
      bounds: [-82.0236, 47.8831, -81.7227, 48.0483
      ],
      minzoom: 0,
      maxzoom: 18
    },
  },
  layers: [
    {
      id: "World-Low-Quality",
      type: "raster",
      source: "worldLowQuality",
      minzoom: 0,
      maxzoom: 8,
      layout: {
        visibility: "visible",
      },
      paint: {
        "raster-opacity": 1,
      },
      filter: ["all"],
    },
    {
      id: "Ontario-Full",
      type: "raster",
      source: "ontarioFull",
      minzoom: 4,
      maxzoom: 22,
      layout: {
        visibility: "visible",
      },
      paint: {
        "raster-opacity": 1,
      },
      filter: ["all"],
    },
    {
      id: "Launch-Canada-1",
      type: "raster",
      source: "launchCanada1",
      minzoom: 0,
      maxzoom: 22,
      layout: {
        visibility: "visible",
      },
      paint: {
        "raster-opacity": 1,
      },
      filter: ["all"],
    },
    {
      id: "Launch-Canada-2",
      type: "raster",
      source: "launchCanada2",
      minzoom: 15,
      maxzoom: 22,
      layout: {
        visibility: "visible",
      },
      paint: {
        "raster-opacity": 1,
      },
      filter: ["all"],
    },
    {
      id: "Timmins-City",
      type: "raster",
      source: "timminsCity",
      minzoom: 12,
      maxzoom: 22,
      layout: {
        visibility: "visible",
      },
      paint: {
        "raster-opacity": 1,
      },
      filter: ["all"],
    },
  ],
} satisfies StyleSpecification;
