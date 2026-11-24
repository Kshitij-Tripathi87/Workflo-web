import { useEffect } from "react";
import { RouterProvider, useRouter } from "./lib/router";
import { Landing } from "./pages/Landing";
import { Product } from "./pages/Product";
import { HowItWorks } from "./pages/HowItWorks";
import { About } from "./pages/About";
import { Docs } from "./pages/Docs";
import { EarlyAccess } from "./pages/EarlyAccess";
import { Changelog } from "./pages/Changelog";

function RouteView() {
  const { path } = useRouter();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [path]);

  const cleanPath = path === "/" ? "/" : path.replace(/\/+$/, "");

  if (cleanPath === "/") return <Landing />;
  if (cleanPath === "/product") return <Product />;
  if (cleanPath === "/how-it-works") return <HowItWorks />;
  if (cleanPath === "/about" || cleanPath === "/company") return <About />;
  if (cleanPath === "/docs" || cleanPath.startsWith("/docs")) return <Docs />;
  if (cleanPath === "/early-access") return <EarlyAccess />;
  if (cleanPath === "/changelog") return <Changelog />;

  return <Product />;
}

export function App() {
  return (
    <RouterProvider>
      <RouteView />
    </RouterProvider>
  );
}
