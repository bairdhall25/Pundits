import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SiteHeader } from "@/components/SiteHeader";

const meta = {
  title: "Site chrome/Header navigation",
  component: SiteHeader,
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: { pathname: "/" },
    },
  },
} satisfies Meta<typeof SiteHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Picks: Story = {};

export const Takes: Story = {
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: { pathname: "/stories/" },
    },
  },
};

export const Pundits: Story = {
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: { pathname: "/leaderboard/" },
    },
  },
};
