import { createRoot } from "react-dom/client";
import "./index.css";
import "@fontsource-variable/roboto-mono";
import App from "./App.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { ErrorBoundary } from "react-error-boundary";
import ErrorMessage from "./components/ErrorMessage.tsx";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <ErrorBoundary fallbackRender={ErrorMessage}>
      <App />
    </ErrorBoundary>
    <Toaster richColors />
  </QueryClientProvider>,
);
