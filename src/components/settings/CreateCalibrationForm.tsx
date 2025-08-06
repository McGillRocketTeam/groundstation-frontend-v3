import { Calibration } from "@/stores/calibration";

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

const formSchema = z.object({
  name: z.string().min(3),
  multiplier: z.coerce.number(),
  offset: z.coerce.number(),
});

export default function CreateCalibrationForm({
  onSubmit,
}: {
  onSubmit: (result: Calibration) => void;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const { multiplier, offset } = form.watch();

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid gap-4 grid-cols-2 items-start"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="col-span-full">
              <FormControl>
                <Input placeholder="Labjack..." {...field} />
              </FormControl>
              <FormDescription className="text-xs">
                A unique name for this formula.
              </FormDescription>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="multiplier"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Multiplier</FormLabel>
              <FormControl>
                <Input type="number" placeholder="" {...field} />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="offset"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Offset</FormLabel>
              <FormControl>
                <Input type="number" placeholder="" {...field} />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {multiplier && offset && (
          <div className="col-span-full space-y-2">
            <div className="text-xs font-semibold">Preview</div>
            <div className=" bg-muted border p-2">{`f(x) = ${multiplier}x ${offset >= 0 ? "+" : "-"} ${Math.abs(offset)}`}</div>
          </div>
        )}

        <Button className="col-span-full" type="submit">
          Create
        </Button>
      </form>
    </Form>
  );
}
