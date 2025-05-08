import { z } from "zod";

export const pidSchema = z.object({}).describe("P&ID Diagram");

export type PIDCardParams = z.infer<typeof pidSchema>;
