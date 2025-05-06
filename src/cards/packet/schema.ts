import { z } from "zod";

export const packetSchema = z
  .object({
    container: z.string(),
  })
  .describe("Packet Viewer");

export type PacketCardParams = z.infer<typeof packetSchema>;
