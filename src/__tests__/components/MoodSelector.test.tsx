import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { MoodSelector } from "@/components/MoodSelector";

describe("MoodSelector", () => {
  it("renders 5 mood buttons", () => {
    render(<MoodSelector value={null} onChange={vi.fn()} />);
    const buttons = screen.getAllByRole("radio");
    expect(buttons).toHaveLength(5);
  });

  it("marks selected button as checked", () => {
    render(<MoodSelector value={3} onChange={vi.fn()} />);
    const neutral = screen.getByLabelText(/neutral/i);
    expect(neutral).toHaveAttribute("aria-checked", "true");
  });

  it("calls onChange when a button is clicked", async () => {
    const onChange = vi.fn();
    render(<MoodSelector value={null} onChange={onChange} />);
    await userEvent.click(screen.getByLabelText(/good/i));
    expect(onChange).toHaveBeenCalledWith(5);
  });
});
