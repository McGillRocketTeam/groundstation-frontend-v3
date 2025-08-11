import { cn } from "@/lib/utils";
import {
  CheckCircledIcon,
  CircleIcon,
  CrossCircledIcon,
  MinusIcon,
} from "@radix-ui/react-icons";

export function AcknowledgementIcon({
  status,
  className
}: {
  status: string | undefined;
    className?: string
}) {
  if (status) {
    if (status === "OK")
      return (
        <CheckCircledIcon className={cn("text-green-700 dark:text-green-500", className)} />
      );
    else if (status === "none") {
      return <CircleIcon className={cn("text-muted-foreground", className)} />;
    } else {
      return <CrossCircledIcon className={cn("text-red-700 dark:text-red-500", className)} />;
    }
  } else {
    return <MinusIcon className={cn("text-muted-foreground", className)} />;
  }
}
