import { describe, expect, it } from "vitest";
import { conversationMatchesChannelFilter } from "./Inbox";

describe("conversationMatchesChannelFilter", () => {
  const activeChannelIds = new Set(["active-channel"]);

  it("keeps assigned seller conversations in the default channel view when channels are hidden by RLS", () => {
    expect(
      conversationMatchesChannelFilter(
        "admin-channel",
        "ativos",
        activeChannelIds,
        true,
      ),
    ).toBe(true);
  });

  it("preserves active-channel filtering for admins", () => {
    expect(
      conversationMatchesChannelFilter(
        "inactive-channel",
        "ativos",
        activeChannelIds,
        false,
      ),
    ).toBe(false);
    expect(
      conversationMatchesChannelFilter(
        "active-channel",
        "ativos",
        activeChannelIds,
        false,
      ),
    ).toBe(true);
  });
});
