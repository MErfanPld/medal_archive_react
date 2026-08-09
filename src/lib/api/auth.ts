import { api } from "./client";
import type {
  LoginRequest,
  LogoutRequest,
  TokenPairResponse,
  UserMe,
  InviteLinkCreateRequest,
  InviteLinkCreateResponse,
} from "@/types/api";

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<TokenPairResponse>("/api/users/login/", data, { skipAuth: true }),

  logout: (data: LogoutRequest) =>
    api.post<void>("/api/users/logout/", data),

  me: () => api.get<UserMe>("/api/users/me/"),

  createInvite: (data: InviteLinkCreateRequest) =>
    api.post<InviteLinkCreateResponse>("/api/users/invite/", data),

  consumeInvite: (token: string) =>
    api.post<TokenPairResponse>(
      `/api/users/invite/${encodeURIComponent(token)}/consume/`,
      undefined,
      { skipAuth: true }
    ),
};
