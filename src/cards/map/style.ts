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
  sources: {
    satellite: {
      type: "raster",
      tiles: [
        "http://localhost:8080/services/satellite-2017-11-02_canada_montreal/tiles/{z}/{x}/{y}.jpg",
      ],
      tileSize: 256,
      bounds: [
        -73.7299243282283, 45.0341840286281, -72.2895137142146, 46.046265455836,
      ],
    },
  },
  layers: [
    {
      id: "Satellite",
      type: "raster",
      source: "satellite",
      minzoom: 0,
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
