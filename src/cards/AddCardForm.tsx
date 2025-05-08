/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/AddCardForm.tsx
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z, ZodObject } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { componentSchemas, ComponentKey, AddPanelConfig } from "@/cards";
import { QualifiedParameterName } from "@/lib/schemas";
import { ParameterArraySelector } from "@/components/form/ParameterArraySelector";

// Create a schema for the base panel configuration
const basePanelSchema = z.object({
  id: z.string().min(1),
  component: z.enum(
    Object.keys(componentSchemas) as [ComponentKey, ...ComponentKey[]],
  ),
  title: z.string().min(1),
  position: z
    .object({
      direction: z.enum(["left", "right", "above", "below"]),
      referencePanel: z.string(),
    })
    .optional(),
});

type AddCardFormProps = {
  onSubmit: <T extends ComponentKey>(config: AddPanelConfig<T>) => void;
};

export function AddCardForm({ onSubmit }: AddCardFormProps) {
  const [selectedComponent, setSelectedComponent] =
    useState<ComponentKey | null>(null);

  // Dynamically create the form schema based on the selected component
  const getFormSchema = (component: ComponentKey | null) => {
    if (!component) return basePanelSchema;
    const schema = componentSchemas[component];
    // if schema is an empty object, don’t add `params`
    if (isEmptyObjectSchema(schema)) {
      return basePanelSchema;
    }
    return basePanelSchema.extend({ params: schema });
  };

  const form = useForm<z.infer<ReturnType<typeof getFormSchema>>>({
    resolver: zodResolver(getFormSchema(selectedComponent)),
    defaultValues: {
      id: crypto.randomUUID(),
    },
  });

  // Render form fields based on the schema
  const renderSchemaFields = (
    schema: z.ZodObject<any>,
    path: string[] = [],
  ) => {
    return Object.entries(schema.shape).map(([key, value]) => {
      const fieldPath = [...path, key];
      const fieldPathStr = fieldPath.join(".");

      if (value instanceof z.ZodObject) {
        return (
          <div key={fieldPathStr} className="space-y-4">
            <h3 className="font-medium">{key}</h3>
            {renderSchemaFields(value, fieldPath)}
          </div>
        );
      }

      return (
        <FormField
          key={fieldPathStr}
          control={form.control}
          name={fieldPathStr as any}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="capitalize">
                {key.replace(/([A-Z])/g, " $1").trim()}
              </FormLabel>
              <FormControl>
                {(() => {
                  // I have the following branded string and i want to see if its an instance of that
                  // z.ZodArray<z.ZodBranded<z.ZodString, "QualifiedParameterName">, "many">
                  if (
                    value instanceof z.ZodArray &&
                    value.element instanceof z.ZodBranded &&
                    value.element._def.type instanceof z.ZodString &&
                    value.element.description === "QualifiedParameterName"
                  ) {
                    return (
                      <ParameterArraySelector
                        onValueChange={(value) => {
                          field.onChange(
                            value.map((v) =>
                              QualifiedParameterName.parse(v.qualifiedName),
                            ),
                          );
                        }}
                      />
                    );
                  } else if (value instanceof z.ZodNumber) {
                    return (
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    );
                  } else if (value instanceof z.ZodEnum) {
                    return (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`Select ${key}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {(value as z.ZodEnum<any>)._def.values.map(
                            (v: string) => (
                              <SelectItem key={v} value={v}>
                                {v}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                    );
                  } else {
                    return <Input {...field} />;
                  }
                })()}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => {
          if (selectedComponent) {
            onSubmit({
              ...data,
              component: selectedComponent,
            } as AddPanelConfig<typeof selectedComponent>);
          }
        })}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="component"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Component Type</FormLabel>
              <Select
                onValueChange={(value: ComponentKey) => {
                  field.onChange(value);
                  setSelectedComponent(value);
                  form.reset({ id: crypto.randomUUID(), component: value });
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select component type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(componentSchemas).map(([key, schema]) => (
                    <SelectItem key={key} value={key}>
                      {schema.description ?? key}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedComponent &&
          !isEmptyObjectSchema(componentSchemas[selectedComponent]) && (
            <div className="space-y-4">
              <h3 className="font-medium">
                {componentSchemas[selectedComponent].description ??
                  selectedComponent}{" "}
                Configuration
              </h3>
              {renderSchemaFields(componentSchemas[selectedComponent], [
                "params",
              ])}
            </div>
          )}

        <div className="flex w-full items-end justify-end">
          <Button type="submit">Add Panel</Button>
        </div>
      </form>
    </Form>
  );
}

function isEmptyObjectSchema(schema: z.ZodTypeAny): boolean {
  if (schema instanceof ZodObject) {
    return Object.keys(schema.shape).length === 0;
  }
  return false;
}
