import { QualifiedParameterName } from "@/lib/schemas";
import { z } from "zod";

export const mapSchema = z.object({
  latitudeParameter: QualifiedParameterName,
  longitudeParameter: QualifiedParameterName,
  groundStationLatitude: z.coerce.number().optional(),
  groundStationLongitude: z.coerce.number().optional()
}).describe("Map");

export type MapCardParams = z.infer<typeof mapSchema>;
