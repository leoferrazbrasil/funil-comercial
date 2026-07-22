import { describe, expect, it } from "vitest";
import {
  conversationMatchesChannelFilter,
  requiresTemplateForDraftMetaConversation,
} from "./Inbox";

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

describe("requiresTemplateForDraftMetaConversation", () => {
  it("requires an approved template when a draft conversation will be sent by Meta", () => {
    expect(requiresTemplateForDraftMetaConversation(true, "whatsapp_cloud")).toBe(true);
  });

  it("keeps text replies available for existing Meta conversations", () => {
    expect(requiresTemplateForDraftMetaConversation(false, "whatsapp_cloud")).toBe(false);
  });

  it("keeps text available for non-Meta providers", () => {
    expect(requiresTemplateForDraftMetaConversation(true, "z-api")).toBe(false);
  });
});
