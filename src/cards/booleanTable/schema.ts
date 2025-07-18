import { z } from "zod";

export const booleanTableSchema = z
  .object({
    parameters: z
      .array(
        z
          .enum([
            "run_armed"
          ])
          .describe("BooleanParameter"),
      )
      .nonempty({ message: "Must pick at least one parameter." }),
  })
  .describe("Boolean Table");

export type BooleanCardParams = z.infer<typeof booleanTableSchema>;
