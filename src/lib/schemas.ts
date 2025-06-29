import { z } from "zod";

export const QualifiedParameterName = z
  .string()
  .brand<"QualifiedParameterName">()
  .describe("QualifiedParameterName");

export const QualifiedCommandName = z
  .string()
  .brand<"QualifiedCommandName">()
  .describe("QualifiedCommandName");

export const QualifiedDataLinkName = z
  .string()
  .brand<"QualifiedDataLinkName">()
  .describe("QualifiedDataLinkName");

export const commandConfigurationSchema = z
  .object({
    qualifiedName: QualifiedParameterName,
    label: z.string(),
    confirmationTime: z.number().optional(),
    arguments: z.record(z.string(), z.any()).optional(),
  })
  .describe("CommandConfiguration");

export type CommandConfiguration = z.infer<typeof commandConfigurationSchema>;
export type QualifiedParameterNameType = z.infer<typeof QualifiedParameterName>;
