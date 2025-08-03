import { z } from "zod";
import { Command } from "../yamcsClient/lib/client";
import { AutoForm, AutoFormField } from "@/form/AutoForm";

/**
 * Takes a `Command` with arguments and turns it into an `AutoForm`
 * with appropraite logic for inputting arguments
 */
export function commandToAutoForm(command: Command): AutoForm | undefined {
  // We only want to make a schema for inputting command arguments
  // if there are no arguments, we return early
  if (!command.argument) return undefined;

  const fields = [] as AutoFormField[];

  // We will loop over each argument to create a rich zod schema
  // that can then be used to generate a form that handles
  // all conditions & restraints correctly
  //
  // TODO: Theare are more types of arguments to parse here,
  // but for now these are the ones that are currenlty in use.
  // For the future:
  //   - aggregate
  //   - boolean
  //   - string
  //   - binary
  //   - array
  // docs: (ArgumentTypeInfo) https://docs.yamcs.org/yamcs-http-api/mdb/get-command/
  for (const argument of command.argument) {
    if (argument.type.engType == "float") {
      let argumentSchema = z.number();
      // Add the min value to the zod schema
      if (argument.type.rangeMin !== undefined)
        argumentSchema = argumentSchema.min(argument.type.rangeMin);

      // Add the max value to the zod schema
      if (argument.type.rangeMax !== undefined)
        argumentSchema = argumentSchema.max(argument.type.rangeMax);

      fields.push({
        id: argument.name,
        name: argument.description,
        element: "number",
        schema: argumentSchema,
      });
    } else if (argument.type.engType == "integer") {
      let argumentSchema = z.number().int();

      // Add the min value to the zod schema
      if (argument.type.rangeMin !== undefined)
        argumentSchema = argumentSchema.min(argument.type.rangeMin);

      // Add the max value to the zod schema
      if (argument.type.rangeMax !== undefined)
        argumentSchema = argumentSchema.max(argument.type.rangeMax);

      fields.push({
        id: argument.name,
        name: argument.description,
        element: "number",
        schema: argumentSchema,
      });
    } else if (argument.type.engType == "enumeration") {
      const argumentSchema =
        argument.type.dataEncoding.type == "INTEGER"
          ? z.coerce.number()
          : z.string();

      fields.push({
        id: argument.name,
        name: argument.description,
        element: "dropdown",
        schema: argumentSchema,
        options: argument.type.enumValue.map((e) => ({
          name: e.label,
          value: e.value,
        })),
      });
    }
  }

  return { fields };
}
