import { lazy, Suspense } from "react";
import { RouterProvider, useRouter } from "./lib/router";
import { Landing } from "./pages/Landing";

const LegacyApp = lazy(() => import("./LegacyApp").then((module) => ({ default: module.LegacyApp })));

function Shell() {
  const { path } = useRouter();

  // "/" is the one-page launch site; it carries its own navbar and footer.
  if (path === "/") return <Landing />;

  return (
    <Suspense fallback={null}>
      <LegacyApp />
    </Suspense>
  );
}

export function App() {
  return (
    <RouterProvider>
      <Shell />
    </RouterProvider>
  );
}
