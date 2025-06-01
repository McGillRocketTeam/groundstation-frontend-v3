import { QualifiedDataLinkName } from "@/lib/schemas";
import { z } from "zod";

export const serialTerminalSchema = z
  .object({
    connections: z.array(QualifiedDataLinkName),
  })
  .describe("Serial Terminal");

export type SerialTerminalCardParams = z.infer<typeof serialTerminalSchema>;
