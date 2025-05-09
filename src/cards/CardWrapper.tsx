import { ReactNode } from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import { IDockviewPanelProps } from "dockview-react";
import { Button } from "@/components/ui/button";
import { ExclamationTriangleIcon, ReloadIcon } from "@radix-ui/react-icons";

function CardWrapper({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary fallbackRender={ErrorComponent}>{children}</ErrorBoundary>
  );
}

function ErrorComponent({ error, resetErrorBoundary }: FallbackProps) {
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

export const withWrapper = <P extends IDockviewPanelProps>(
  Component: React.ComponentType<P>,
): React.FC<P> => {
  // The returned component receives props of type P, which extends IDockviewPanelProps
  return (props: P) => (
    <CardWrapper>
      <Component {...props} />
    </CardWrapper>
  );
};
