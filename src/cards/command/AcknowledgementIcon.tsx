import {
  CheckCircledIcon,
  CircleIcon,
  CrossCircledIcon,
  MinusIcon,
} from "@radix-ui/react-icons";

export function AcknowledgementIcon({
  status,
}: {
  status: string | undefined;
}) {
  if (status) {
    if (status === "OK")
      return (
        <CheckCircledIcon className="text-green-700 dark:text-green-500" />
      );
    else if (status === "none") {
      return <CircleIcon className="text-muted-foreground" />;
    } else {
      return <CrossCircledIcon className="text-red-700 dark:text-red-500" />;
    }
  } else {
    return <MinusIcon className="text-muted-foreground" />;
  }
}
