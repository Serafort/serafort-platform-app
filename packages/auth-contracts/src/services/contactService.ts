import { apiClient, type FetchResponse } from "@cap/platform-store";
import { ENDPOINTS } from "@cap/api-contracts";

export interface ContactMessageItem {
  id: number;
  fullName: string;
  email: string;
  subject: string;
  message: string;
  status: "unread" | "in_progress" | "resolved";
  ipAddress?: string | null;
  userAgent?: string | null;
  organizationId?: number | null;
  createdAt: string;
  updatedAt?: string;
}

export interface SubmitContactMessageRequest {
  fullName: string;
  email: string;
  subject: string;
  message: string;
}

export class ContactService {
  /**
   * Submit an inquiry / lead message via public landing form
   */
  async submitContactMessage(
    data: SubmitContactMessageRequest,
    orgId?: string | number,
  ): Promise<FetchResponse<{ success: boolean; message: string; id: number }>> {
    const headers = orgId ? { "x-organization-id": String(orgId) } : undefined;
    return apiClient.post<{ success: boolean; message: string; id: number }>(
      ENDPOINTS.contact.submit,
      data,
      { headers },
    );
  }

  /**
   * List contact messages with status filter (admin only)
   */
  async listContactMessages(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<FetchResponse<{ data: ContactMessageItem[]; meta: unknown }>> {
    return apiClient.get<{ data: ContactMessageItem[]; meta: unknown }>(
      ENDPOINTS.contact.messages,
      { params },
    );
  }

  /**
   * Update message status (admin only)
   */
  async updateContactMessageStatus(
    id: number | string,
    status: "unread" | "in_progress" | "resolved",
  ): Promise<
    FetchResponse<{ success: boolean; contactMessage: ContactMessageItem }>
  > {
    return apiClient.patch<{
      success: boolean;
      contactMessage: ContactMessageItem;
    }>(ENDPOINTS.contact.updateMessageStatus(id), { status });
  }
}

export const contactService = new ContactService();
