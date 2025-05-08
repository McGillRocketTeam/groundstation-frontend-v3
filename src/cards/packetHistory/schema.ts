import { z } from "zod";

export const packetHistorySchema = z
  .object({
    container: z.string(),
  })
  .describe("Packet Viewer");

export type PacketHistoryCardParams = z.infer<typeof packetHistorySchema>;
