import { api } from "./client";
import type {
  InviteLinkCreateRequest,
  InviteLinkCreateResponse,
  InviteConsumeResponse,
} from "@/types/api";

/**
 * Invite endpoints (OpenAPI)
 * POST /api/users/invite/                    — authenticated
 * POST /api/users/invite/{token}/consume/    — public (skipAuth)
 */
export const invitesApi = {
  create: (data: InviteLinkCreateRequest) =>
    api.post<InviteLinkCreateResponse>("/api/users/invite/", data),

  /**
   * Consume a one-time invite token.
   * No request body is required by the documented contract.
   */
  consume: (token: string) =>
    api.post<InviteConsumeResponse>(
      `/api/users/invite/${encodeURIComponent(token)}/consume/`,
      {},
      { skipAuth: true }
    ),
};
