import { api } from "./client";
import type {
  LoginRequest,
  LogoutRequest,
  TokenPairResponse,
  UserMe,
  InviteLinkCreateRequest,
  InviteLinkCreateResponse,
} from "@/types/api";
import { invitesApi } from "./invites";

/**
 * Auth endpoints (OpenAPI)
 * POST /api/users/login/
 * POST /api/users/logout/
 * GET  /api/users/me/
 *
 * Invite helpers re-export invitesApi for backward compatibility.
 */
export const authApi = {
  login: (data: LoginRequest) =>
    api.post<TokenPairResponse>("/api/users/login/", data, { skipAuth: true }),

  logout: (data: LogoutRequest) =>
    api.post<void>("/api/users/logout/", data),

  me: () => api.get<UserMe>("/api/users/me/"),

  /** @deprecated prefer invitesApi.create */
  createInvite: (data: InviteLinkCreateRequest) =>
    invitesApi.create(data),

  /** @deprecated prefer invitesApi.consume */
  consumeInvite: (token: string) => invitesApi.consume(token),
};
