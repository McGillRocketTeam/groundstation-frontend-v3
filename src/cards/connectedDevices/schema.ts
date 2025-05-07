import { z } from "zod";

export const connectedDevicesSchema = z
  .object({})
  .describe("Connected Devices");

export type ConnectedDevicesCardParams = z.infer<typeof connectedDevicesSchema>;
