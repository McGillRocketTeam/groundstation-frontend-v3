import { z } from "zod";

export const mapSchema = z.object({}).describe("Map");

export type MapCardParams = z.infer<typeof mapSchema>;
