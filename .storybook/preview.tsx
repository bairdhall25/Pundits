import type { Preview } from "@storybook/nextjs-vite";
import "@fontsource/inter/400.css";
import "@fontsource/inter/700.css";
import "@fontsource/oswald/600.css";
import "@fontsource/ibm-plex-mono/400.css";
import "../app/globals.css";
import "./preview.css";

const preview: Preview = {
  decorators: [
    (Story) => (
      <main className="storybook-stage">
        <Story />
      </main>
    ),
  ],
  parameters: {
    layout: "fullscreen",
    a11y: {
      test: "error",
    },
  },
};

export default preview;
