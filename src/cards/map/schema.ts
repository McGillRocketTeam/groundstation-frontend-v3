import { QualifiedParameterName } from "@/lib/schemas";
import { z } from "zod";

export const mapSchema = z.object({
  latitudeParameter: QualifiedParameterName,
  longitudeParameter: QualifiedParameterName
}).describe("Map");

export type MapCardParams = z.infer<typeof mapSchema>;
