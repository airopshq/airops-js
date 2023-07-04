import { ApiError } from './errors/apiError';

class CustomFetch {
  userId?: string;
  workspaceId?: number;
  hashedUserId?: string;

  constructor(userId?: string, workspaceId?: number, hashedUserId?: string) {
    this.userId = userId;
    this.workspaceId = workspaceId;
    this.hashedUserId = hashedUserId;
  }

  async post(url: string, payload: unknown) {
    const headers = this.getHeaders();
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      await this.handleError(response);
    }

    try {
      return await response.json();
    } catch (e) {
      // Can't parse response (i.e: empty response)
    }
  }

  async patch(url: string, payload?: unknown) {
    const headers = this.getHeaders();
    const response = await fetch(url, {
      method: 'PATCH',
      headers,
      ...(payload !== undefined && {
        body: JSON.stringify(payload),
      }),
    });

    if (!response.ok) {
      await this.handleError(response);
    }

    if (response.status === 204) {
      return;
    }
    return await response.json();
  }

  async get(url: string) {
    const headers = this.getHeaders();
    const response = await fetch(url, { method: 'GET', headers });

    if (!response.ok) {
      await this.handleError(response);
    }

    return await response.json();
  }

  private getHeaders() {
    const headers = new Headers();
    headers.append('content-type', 'application/json');
    if (this.userId && this.workspaceId && this.hashedUserId) {
      headers.append('user_id', this.userId);
      headers.append('workspace_id', this.workspaceId.toString());
      headers.append('user_id_hashed', this.hashedUserId);
    }
    return headers;
  }

  private async handleError(response: Response) {
    let apiError;
    try {
      const error = await response.json();
      apiError = { message: error.error, status: response.status };
    } catch {
      apiError = {
        message: response.statusText || 'Internal API error',
        status: response.status,
      };
    }
    throw new ApiError(apiError);
  }
}

export default CustomFetch;
