/* eslint-disable @typescript-eslint/no-explicit-any */
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Combobox } from "./components/combobox";

export interface AutoForm {
  fields: AutoFormField[];
}

export type AutoFormField =
  | TextAutoFormField
  | NumberAutoFormField
  | DropdownAutoFormField;

interface BaseAutoFormField<T = any> {
  id: string;
  name: string;
  schema: z.ZodType<T, any, any>;
  description?: string;
  hint?: string;
}

interface TextAutoFormField<T = any> extends BaseAutoFormField<T> {
  element: "text";
}

interface NumberAutoFormField<T = any> extends BaseAutoFormField<T> {
  element: "number";
}

interface DropdownAutoFormField<T = any> extends BaseAutoFormField<T> {
  element: "dropdown";
  options: {
    name: string;
    value: T;
  }[];
}

function extractAutoFormSchema<T extends AutoForm>(form: T) {
  const keys = form.fields.reduce((accumulator, field) => {
    accumulator[field.id] = field.schema;
    return accumulator;
  }, {} as z.ZodRawShape);

  return z.object(keys);
}

type ExtractAutoFormResult<T extends AutoForm> = {
  [F in T["fields"][number] as F["id"]]: z.infer<F["schema"]>;
};

export function AutoForm<T extends AutoForm>({
  autoForm,
  onSubmit,
}: {
  autoForm: T;
  onSubmit: (values: ExtractAutoFormResult<T>) => void;
}) {
  const formSchema = extractAutoFormSchema(autoForm);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  return (
    <Form {...form}>
      <form
        onSubmit={
          // @ts-expect-error we lose a bit of type information when converting
          // to schema for the form but it's ok here
          form.handleSubmit(onSubmit)
        }
        className="space-y-8"
      >
        {autoForm.fields.map((autoField) => (
          <FormField
            control={form.control}
            name={autoField.id}
            render={({ field }) => (
              <FormItem>
                <div className="flex flex-row justify-between">
                  <FormLabel>{autoField.name}</FormLabel>
                  <div className="text-muted-foreground text-sm">
                    {autoField.hint}
                  </div>
                </div>
                <FormControl>
                  {(() => {
                    switch (autoField.element) {
                      case "dropdown":
                        return (
                          <Combobox
                            value={field.value}
                            onValueChange={field.onChange}
                            options={autoField.options}
                          />
                        );
                      case "number":
                        // right now this number still gets sent to the form
                        // as a string, how can we cast it before sending it?
                        return (
                          <Input
                            {...field}
                            type="number"
                            onChange={(e) => {
                              const parsed =
                                e.target.value === ""
                                  ? undefined
                                  : Number(e.target.value);
                              field.onChange(parsed);
                            }}
                          />
                        );
                      default:
                        return <Input {...field} />;
                    }
                  })()}
                </FormControl>
                {autoField.description && (
                  <FormDescription>{autoField.description}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
