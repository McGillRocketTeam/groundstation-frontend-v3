import { ReactNode } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { IDockviewPanelProps } from "dockview-react";
import ErrorMessage from "@/components/ErrorMessage";

function CardWrapper({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary fallbackRender={ErrorMessage}>{children}</ErrorBoundary>
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
