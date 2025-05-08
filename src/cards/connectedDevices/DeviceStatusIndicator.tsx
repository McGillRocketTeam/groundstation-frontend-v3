import { cn } from "@/lib/utils";
import { LinkStatus } from "@/lib/yamcsClient/lib/client";

export default function DeviceStatusIndicator({
  status,
  className,
}: {
  status: LinkStatus;
  className?: string;
}) {
  return (
    <>
      <span className="sr-only">{status}</span>
      <span
        className={cn(
          "inline-block size-[0.75rem] rounded-[0.15rem] border border-neutral-600 bg-neutral-500 align-baseline",
          status === "OK" && "border-green-600 bg-green-500",
          status === "FAILED" && "border-amber-600 bg-amber-500",
          status === "UNAVAIL" && "border-red-600 bg-red-500",
          className,
        )}
      />
    </>
  );
}
