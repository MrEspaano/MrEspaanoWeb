import { describe, expect, it } from "vitest";
import { parseQuickInput } from "@/lib/parser";

describe("parseQuickInput", () => {
  it("tolkar klass, datum och hög prioritet", () => {
    const now = new Date("2026-02-10T09:00:00.000Z");
    const result = parseQuickInput("8B prov 12/3 boka sal hög", now);
    const reminder = new Date(result.reminderAt ?? "");

    expect(result.classTag).toBe("8B");
    expect(result.priority).toBe("high");
    expect(result.title).toBe("prov boka sal");
    expect(result.body).toBe("");
    expect(reminder.getFullYear()).toBe(2026);
    expect(reminder.getMonth()).toBe(2);
    expect(reminder.getDate()).toBe(12);
    expect(result.weekNumber).toBe(11);
  });

  it("tolkar dd-mm och medel prioritet", () => {
    const now = new Date("2026-01-20T09:00:00.000Z");
    const result = parseQuickInput("10C nationella 03-05 medel planera rättning efteråt", now);
    const reminder = new Date(result.reminderAt ?? "");

    expect(result.classTag).toBe("10C");
    expect(result.priority).toBe("medium");
    expect(result.title).toBe("nationella planera rättning efteråt");
    expect(result.body).toBe("");
    expect(reminder.getFullYear()).toBe(2026);
    expect(reminder.getMonth()).toBe(4);
    expect(reminder.getDate()).toBe(3);
    expect(result.weekNumber).toBe(18);
  });

  it("använder fallback när endast metadata anges", () => {
    const now = new Date("2026-02-10T09:00:00.000Z");
    const result = parseQuickInput("7A 15/4 prio1", now);

    expect(result.classTag).toBe("7A");
    expect(result.priority).toBe("high");
    expect(result.title).toBe("Ny lapp");
    expect(result.body).toBe("");
  });
});
