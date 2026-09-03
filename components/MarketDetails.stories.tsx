import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MarketDetails } from "@/components/MarketDetails";

const meta = {
  title: "Pilot/Market details",
  component: MarketDetails,
  args: {
    children: (
      <>
        <p>
          Clemson is the away contract; LSU is the home contract. Frozen at 24¢ / 78¢ on
          Aug 26, 2026.
        </p>
        <p>
          The displayed price is historical market context, not a live line or a bet the
          pundit placed.
        </p>
      </>
    ),
  },
} satisfies Meta<typeof MarketDetails>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Collapsed: Story = {};

export const Expanded: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Market details" }));
  },
};
