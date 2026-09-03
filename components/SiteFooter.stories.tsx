import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SiteFooter } from "@/components/SiteFooter";

const meta = {
  title: "Site chrome/Footer navigation",
  component: SiteFooter,
} satisfies Meta<typeof SiteFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CompleteSiteMap: Story = {};
