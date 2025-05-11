import { ExclamationTriangleIcon, ReloadIcon } from "@radix-ui/react-icons";
import { FallbackProps } from "react-error-boundary";
import { Button } from "./ui/button";

export default function ErrorMessage({
  error,
  resetErrorBoundary,
}: FallbackProps) {
  return (
    <div className="grid h-full w-full place-items-center">
      <div className="flex flex-col items-center gap-4">
        <span>
          <ExclamationTriangleIcon className="inline" /> Unhandled Error:{" "}
          {error.message}
        </span>
        <Button variant="destructive" onClick={resetErrorBoundary}>
          <ReloadIcon />
          Reload Component
        </Button>
      </div>
    </div>
  );
}
