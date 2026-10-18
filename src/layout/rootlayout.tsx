import { Outlet } from "react-router";
import SmoothScroll from "../components/smoothscroll";

export default function RootLayout() {
  return (
    <SmoothScroll>
      <main id="main">
        <Outlet />
      </main>
    </SmoothScroll>
  );
}