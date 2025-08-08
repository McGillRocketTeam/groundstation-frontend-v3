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
import {
  componentSchemas,
  ComponentKey,
  AddPanelConfig,
  ComponentParams,
} from "@/cards";
import { QualifiedParameterName } from "@/lib/schemas";
import { ParameterArraySelector } from "@/components/form/ParameterArraySelector";
import { MultiSelect } from "@/components/ui/multi-select";
import { Separator } from "@/components/ui/separator";
import { AsyncMultiSelect } from "@/components/ui/async-multi-select";
import { yamcs } from "@/lib/yamcsClient/api";
import { CommandButtonArraySelector } from "@/components/form/CommandButtonArraySelector";
import { ChartSeriesSelector } from "@/components/form/ChartSeriesSelector";
import { Switch } from "@/components/ui/switch";

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

interface DefaultValueProps<K extends ComponentKey> {
  component: K;
  title: string;
  values: ComponentParams[K];
}

export interface AddCardFormProps<K extends ComponentKey> {
  onSubmit: <T extends ComponentKey>(config: AddPanelConfig<T>) => void;
  defaultValues?: DefaultValueProps<K>;
  close: () => void;
}

export function AddCardForm<K extends ComponentKey>({
  onSubmit,
  defaultValues,
  close,
}: AddCardFormProps<K>) {
  const [selectedComponent, setSelectedComponent] = useState<
    ComponentKey | undefined
  >(defaultValues?.component);

  // Dynamically create the form schema based on the selected component
  const getFormSchema = (component: ComponentKey | undefined) => {
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
      component: defaultValues?.component,
      title: defaultValues?.title,
      params: { ...defaultValues?.values },
    } as any as z.infer<ReturnType<typeof getFormSchema>>,
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
                  // Command Button  Selector
                  if (
                    value instanceof z.ZodObject &&
                    value.description === "CommandConfiguration"
                  ) {
                    return <div>HELLO WORLD</div>;
                  }
                  // Command Button Array Selector
                  else if (
                    value instanceof z.ZodArray &&
                    value.element.description === "CommandConfiguration"
                  ) {
                    return (
                      <CommandButtonArraySelector
                        commands={field.value}
                        onCommandsChange={(value) => {
                          field.onChange(value);
                        }}
                      />
                    );
                  }
                  // Parameter Array Selector
                  else if (
                    value instanceof z.ZodArray &&
                    value.element instanceof z.ZodUnion  &&
                    value.element.description === "LocalParameter"
                  ) {
                    return (
                      <ParameterArraySelector
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(
                            value.map((v) => ({
                              friendlyName: v.friendlyName,
                              qualifiedName: v.parameter.qualifiedName
                            })
                            ),
                          );
                        }}
                      />
                    );
                  } else if (
                    value instanceof z.ZodArray &&
                    value.element.description === "ChartSeries"
                  ) {
                    return (
                      <ChartSeriesSelector
                        series={field.value}
                        onSeriesChange={(value) => {
                          field.onChange(value);
                        }}
                      />
                    );
                    // Array of Data Links
                  } else if (
                    value instanceof z.ZodArray &&
                    value.element instanceof z.ZodBranded &&
                    value.element._def.type instanceof z.ZodString &&
                    value.element.description === "QualifiedDataLinkName"
                  ) {
                    return (
                      <AsyncMultiSelect
                        optionsFn={async () => {
                          const links = await yamcs.getLinks("gs_backend");
                          return links.map((link) => link.name);
                        }}
                        selected={field.value || []}
                        onChange={field.onChange}
                      />
                    );
                    // Array of Booleans
                  } else if (
                    value instanceof z.ZodArray &&
                    value.element instanceof z.ZodEnum &&
                    value.element.description === "BooleanParameter"
                  ) {
                    return (
                      <MultiSelect
                        options={
                          (value.element as z.ZodEnum<any>)._def
                            .values as string[]
                        }
                        selected={field.value || []}
                        onChange={field.onChange}
                      />
                    );
                    // Number Input
                  } else if (
                    value instanceof z.ZodNumber ||
                    (value instanceof z.ZodDefault &&
                      value._def.innerType instanceof z.ZodNumber)
                  ) {
                    return (
                      <Input
                        type="number"
                        {...field}
                        defaultValue={
                          value instanceof z.ZodDefault &&
                          value._def.defaultValue()
                        }
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    );
                    // Basic Dropdowns
                  } else if (value instanceof z.ZodEnum) {
                    return (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger className="w-full">
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
                    // Boolean Input
                  } else if (
                    value instanceof z.ZodBoolean ||
                    (value instanceof z.ZodDefault &&
                      value._def.innerType instanceof z.ZodBoolean)
                  ) {
                    return (
                      <div>
                        <Switch
                          defaultChecked={
                            value instanceof z.ZodDefault &&
                            value._def.defaultValue()
                          }
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </div>
                    );
                    // Default Input
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
        id="AddCardForm"
        onSubmit={form.handleSubmit((data) => {
          if (selectedComponent) {
            onSubmit({
              ...data,
              component: selectedComponent,
            } as AddPanelConfig<typeof selectedComponent>);
            close();
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
                value={field.value}
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
                  {Object.entries(componentSchemas)
                    .sort(([key1, schema1], [key2, schema2]) =>
                      (schema1.description ?? key1).localeCompare(
                        schema2.description ?? key2,
                      ),
                    )
                    .map(([key, schema]) => (
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

        <Separator />

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
