import type { Meta, StoryObj } from "@storybook/nextjs";
import { useState } from "react";
import DateInput from "./DateInput";

const meta: Meta<typeof DateInput> = {
  title: "Components/DateInput",
  component: DateInput,
  tags: ["autodocs"],
  argTypes: {
    borderColor: {
      control: "color",
      description: "입력창 테두리 색상",
    },
  },
};

export default meta;
type Story = StoryObj<typeof DateInput>;

export const Default: Story = {
  args: {
    name: "birth",
    borderColor: "#CBD5E0",
  },
  render: (args) => {
    const [value, setValue] = useState("");
    return (
      <DateInput
        {...args}
        value={value}
        onChange={(v) => {
          setValue(v);
          console.log("Changed ISO Date:", v);
        }}
      />
    );
  },
};

export const WithInitialValue: Story = {
  args: {
    name: "birthday",
    borderColor: "#3182CE",
  },
  render: (args) => {
    const [value, setValue] = useState("2024-10-15T00:00:00.000Z");
    return (
      <DateInput
        {...args}
        value={value}
        onChange={(v) => {
          setValue(v);
          console.log("Changed ISO Date:", v);
        }}
      />
    );
  },
};
