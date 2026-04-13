import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "./index.css";
import { router } from "@/app/router";
import { ThemeProvider } from "@/components/shared/theme-provider";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

async function enableMocking() {
  const { worker } = await import("@/mocks/browser");

  await worker.start({
    onUnhandledRequest: "bypass",
    serviceWorker: {
      url: "/mockServiceWorker.js",
    },
  });

  return worker;
}

function renderApp() {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        storageKey="taskflow-theme"
      >
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </ThemeProvider>
    </React.StrictMode>
  );
}

enableMocking()
  .catch((error) => {
    console.error("MSW failed to start:", error);
  })
  .finally(() => {
    renderApp();
  });