import { z } from "zod";

export const QualifiedParameterName = z
  .string()
  .brand<"QualifiedParameterName">()
  .describe("QualifiedParameterName");

export type QualifiedParameterNameType = z.infer<typeof QualifiedParameterName>;
