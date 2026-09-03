import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { HowItWorks } from "@/components/HowItWorks";

const meta = {
  title: "Pilot/How it works",
  component: HowItWorks,
  args: {
    children: (
      <p>
        These are public comments from named experts, not bets they placed. The
        number is a frozen market snapshot, not a live sportsbook line.
      </p>
    ),
  },
} satisfies Meta<typeof HowItWorks>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Collapsed: Story = {};
