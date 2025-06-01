import { z } from "zod";

export const QualifiedParameterName = z
  .string()
  .brand<"QualifiedParameterName">()
  .describe("QualifiedParameterName");

export const QualifiedDataLinkName = z
  .string()
  .brand<"QualifiedDataLinkName">()
  .describe("QualifiedDataLinkName");

export type QualifiedParameterNameType = z.infer<typeof QualifiedParameterName>;
