/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";
import { Command } from "../yamcsClient/lib/client";

interface AutoForm {
  fields: AutoFormField<any>[];
}

interface AutoFormField<T> {
  id: string;
  value: T;
  name: string;
}

export function commandToSchema(command: Command) {
  // We only want to make a schema for inputting command arguments
  // if there are no arguments, we return early
  if (!command.argument) return undefined;

  let schema = z.object({});

  // We will loop over each argument to create a rich zod schema
  // that can then be used to generate a form that handles
  // all conditions & restraints correctly
  for (const argument of command.argument) {
    let argumentSchema;
    switch (argument.type.engType) {
      case "float":
        argumentSchema = z.number().withMeta({
          label: argument.name,
          placeholder: argument.initialValue,
          component: "number",
        });
        // Add the min value to the zod schema
        if (argument.type.rangeMin !== undefined)
          argumentSchema = argumentSchema.min(argument.type.rangeMin);

        // Add the max value to the zod schema
        if (argument.type.rangeMax !== undefined)
          argumentSchema = argumentSchema.max(argument.type.rangeMax);
        break;
      case "integer":
        argumentSchema = z.number().int();

        // Add the min value to the zod schema
        if (argument.type.rangeMin !== undefined)
          argumentSchema = argumentSchema.min(argument.type.rangeMin);

        // Add the max value to the zod schema
        if (argument.type.rangeMax !== undefined)
          argumentSchema = argumentSchema.max(argument.type.rangeMax);
        break;

      case "enumeration":
        argumentSchema = z.number().withMeta({
          label: argument.name,
          placeholder: argument.initialValue,
          component: "dropdown",
          options: argument.type.enumValue,
        });
    }

    if (argumentSchema) {
      schema = schema.extend({
        [argument.name]: argumentSchema,
      });
    }
  }

  return schema;
}
