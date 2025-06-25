/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { z, ZodType } from "zod";

export interface DropdownOption<TValue = string | number> {
  value: TValue;
  label: string;
}

// Generic FieldMetadata
export interface FieldMetadata<TValue = string | number> {
  label?: string;
  placeholder?: string;
  options?: DropdownOption<TValue>[];
  component?: "text" | "number" | "dropdown" | "textarea";
}

// Extend the ZodType interface to include a `withMeta` method
// We augment the ZodType interface directly.
declare module "zod" {
  interface ZodType<Output, Def extends z.ZodTypeDef, Input> {
    // The `withMeta` method now takes a generic `MetadataType`
    // which extends FieldMetadata and infers the Output type from the current ZodType.
    withMeta<MetadataType extends FieldMetadata<Output>>(
      metadata: MetadataType,
    ): this & { _metadata?: MetadataType }; // Attach the full metadata object
  }
}

// Implement the `withMeta` method on the ZodType prototype.
Object.defineProperty(ZodType.prototype, "withMeta", {
  value: function <T extends ZodType, MetadataType extends FieldMetadata>(
    this: T,
    metadata: MetadataType,
  ): T & { _metadata?: MetadataType } {
    const newSchema = Object.assign(
      Object.create(Object.getPrototypeOf(this)),
      this,
    );

    Object.defineProperty(newSchema, "_metadata", {
      value: metadata,
      writable: false,
      configurable: false,
      enumerable: false,
    });

    return newSchema;
  },
  configurable: true,
  writable: true,
});

// Helper function to extract metadata
export function getZodMetadata<T extends ZodType>(
  schema: T,
): FieldMetadata<z.infer<T>> | undefined {
  // @ts-expect-error We expect _metadata to exist at runtime due to the prototype extension
  return schema._metadata as FieldMetadata<z.infer<T>> | undefined;
}

// --- Helper for Determining Zod Type (Used in AutoForm) ---
// This will help us identify if a schema is a string, number, etc.
// Zod does not expose a direct way to check the "kind" of a schema instance.
// We can use a type predicate that checks the '_def.typeName'
export function isZodStringType(schema: ZodType<any>): schema is z.ZodString {
  return schema._def.typeName === z.ZodFirstPartyTypeKind.ZodString;
}

export function isZodNumberType(schema: ZodType<any>): schema is z.ZodNumber {
  return schema._def.typeName === z.ZodFirstPartyTypeKind.ZodNumber;
}
