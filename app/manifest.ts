import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MyGym",
    short_name: "MyGym",
    description: "Registro de entrenamiento, comida, agua y recuperación.",
    start_url: "/",
    display: "standalone",
    background_color: "#e6e8eb",
    theme_color: "#e6e8eb",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
