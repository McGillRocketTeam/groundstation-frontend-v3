import { z } from "zod";

export const booleanTableSchema = z
  .object({
    parameters: z
      .array(
        z
          .enum([
            "drogueEmatch",
            "drogueValve",
            "main",
            "nitroFill",
            "mov",
            "fdovNC",
            "fdovNO",
            "vent",
            "pressurant",
          ])
          .describe("BooleanParameter"),
      )
      .nonempty({ message: "Must pick at least one parameter." }),
  })
  .describe("Boolean Table");

export type BooleanCardParams = z.infer<typeof booleanTableSchema>;
