import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  archiveInboxConversations,
  conversationStatePhoneKey,
  reopenInboxConversation,
  unarchiveInboxConversation,
} from "./crmService";
import { requireSupabase } from "./supabase";

vi.mock("./supabase", () => ({
  requireSupabase: vi.fn(),
}));

describe("conversationStatePhoneKey", () => {
  it.each([
    ["(11) 99876-5432", "551198765432"],
    ["5511998765432", "551198765432"],
    ["55011998765432", "551198765432"],
    ["011998765432", "551198765432"],
    ["1198765432", "551198765432"],
    ["", ""],
  ])("normalizes %s to the Inbox conversation key", (phone, expected) => {
    expect(conversationStatePhoneKey(phone)).toBe(expected);
  });
});

describe("Inbox conversation archive state", () => {
  const from = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireSupabase).mockReturnValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } }, error: null }) },
      from,
    } as never);
  });

  it("archives the normalized Inbox key for phone variants", async () => {
    const select = vi.fn().mockResolvedValue({ data: [], error: null });
    const upsert = vi.fn().mockReturnValue({ select });
    from.mockReturnValue({ upsert });

    await archiveInboxConversations(
      [{ owner_id: "owner-1", telefone: "+55 (11) 99876-5432", channel_id: "channel-1" }],
      "",
    );

    expect(upsert).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          owner_id: "owner-1",
          telefone: "551198765432",
          channel_id: "channel-1",
          archived_at: "1970-01-01T00:00:00.000Z",
          archived_by: "user-1",
          archive_reason: "Arquivado para organizar a Inbox",
        }),
      ],
      { onConflict: "owner_id,telefone,channel_key" },
    );
  });

  it("unarchives a phone variant through the legacy channel key", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    const select = vi.fn().mockReturnValue({ maybeSingle });
    const eq = vi.fn().mockReturnThis();
    const update = vi.fn().mockReturnValue({ eq, select });
    from.mockReturnValue({ update });

    await unarchiveInboxConversation({
      owner_id: "owner-1",
      telefone: "5511998765432",
      channel_id: null,
    });

    expect(eq).toHaveBeenNthCalledWith(1, "owner_id", "owner-1");
    expect(eq).toHaveBeenNthCalledWith(2, "telefone", "551198765432");
    expect(eq).toHaveBeenNthCalledWith(3, "channel_key", "legacy");
  });

  it("reopens through the canonical phone key and legacy channel key", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    const select = vi.fn().mockReturnValue({ maybeSingle });
    const eq = vi.fn().mockReturnThis();
    const update = vi.fn().mockReturnValue({ eq, select });
    from.mockReturnValue({ update });

    await reopenInboxConversation("owner-1", "55011998765432", null);

    expect(eq).toHaveBeenNthCalledWith(1, "owner_id", "owner-1");
    expect(eq).toHaveBeenNthCalledWith(2, "telefone", "551198765432");
    expect(eq).toHaveBeenNthCalledWith(3, "channel_key", "legacy");
  });
});
