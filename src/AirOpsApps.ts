import { v4 as uuidv4 } from 'uuid';
import Pusher from './Pusher';
import CustomFetch from './CustomFetch';
import {
  IdentifyParams,
  ExecuteParams,
  ExecutionParams,
  ExecuteResponse,
  AppExecution,
  ChatStreamParams,
  ChatStreamResponse,
} from './ts/types';

class AirOpsApps {
  private customFetch: CustomFetch;
  private readonly userId: string;
  private readonly workspaceId: number;
  private readonly hashedUserId: string;
  private readonly host: string;

  /**
   * App constructor
   * @param params
   * @param params.userId - User ID
   * @param params.workspaceId - Workspace ID
   * @param params.hashedUserId - Hashed User ID
   * @param params.host - Host URL optional
   */
  constructor(params: IdentifyParams) {
    const { userId, workspaceId, hashedUserId, host = 'https://app.airops.com' } = params;
    this.customFetch = new CustomFetch(userId, workspaceId, hashedUserId);
    this.userId = userId;
    this.workspaceId = workspaceId;
    this.hashedUserId = hashedUserId;
    this.host = host;
  }

  /**
   * Execute an app
   * @param params
   * @param params.appId - App ID
   * @param params.version - App version
   * @param params.payload - App input
   * @param params.stream - Stream enabled?
   * @param params.streamCallback - Callback function for stream
   * @param params.streamCompletedCallback - Callback function for stream completed
   * @returns - App output
   */
  async execute(params: ExecuteParams): Promise<ExecuteResponse> {
    const { appId, version, payload, stream, streamCallback, streamCompletedCallback } = params;

    if (!appId) {
      throw new Error('You must provide an app id.');
    }

    let pusher: Pusher | null = null;
    let apiPayload = payload;

    let unsubscribeMethod: () => void = () => null;
    if (stream && streamCallback) {
      pusher = new Pusher(this.userId, this.workspaceId, this.hashedUserId, this.host);
      const channelName = uuidv4();
      apiPayload = { ...payload, stream_channel_id: channelName };
      unsubscribeMethod = pusher.subscribe(channelName, streamCallback, streamCompletedCallback);
    } else if (stream) {
      throw new Error('You must provide a callback function when streaming.');
    }

    const url = version
      ? `${this.host}/sdk_api/airops_apps/${appId}/async_execute/v${version}`
      : `${this.host}/sdk_api/airops_apps/${appId}/async_execute`;

    const response = await this.customFetch.post(url, apiPayload);

    return {
      executionId: response.airops_app_execution.id,
      result: async () => {
        const timeout = 10 * 60 * 1000; // Timeout in milliseconds (10 minutes)
        const startTime = Date.now();

        let result = null;
        while (!result || ['queued', 'pending', 'running'].includes(result?.status)) {
          if (Date.now() - startTime > timeout) {
            throw new Error('App execution timeout. You can retrieve the results using the appId & executionId.');
          }
          result = await this.getResults({
            appId: response.airops_app_execution.airops_app_id,
            executionId: response.airops_app_execution.id,
          });
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
        return result;
      },
      cancel: async () => {
        unsubscribeMethod?.();
        await this.cancelExecution({
          appId: response.airops_app_execution.airops_app_id,
          executionId: response.airops_app_execution.id,
        });
      },
    };
  }

  /**
   * Chat stream
   * @param params
   * @param params.message - Message to send
   * @param params.appId - App ID
   * @param params.sessionId - Session ID
   * @param params.streamCallback - Callback function for stream
   * @param params.streamCompletedCallback - Callback function for stream completed
   * @returns - Chat stream response
   */
  async chatStream(params: ChatStreamParams): Promise<ChatStreamResponse> {
    const { message, appId, streamCallback, streamCompletedCallback, sessionId } = params;

    if (!message || !appId || !streamCallback) {
      throw new Error('You must provide a message, appId and streamCallback.');
    }

    const streamChannelId = uuidv4();
    const chatSessionId = sessionId ? sessionId : uuidv4();

    const pusher = new Pusher(this.userId, this.workspaceId, this.hashedUserId, this.host);

    let resultResolver: Partial<{
      resolve: (data: { result: string }) => void;
    }> = {};
    const resultPromise: Promise<{ result: string }> = new Promise((resolve) => {
      resultResolver = { resolve };
    });

    await pusher.subscribeChat(resultResolver, streamChannelId, streamCallback, streamCompletedCallback);

    const payload = {
      definition: null,
      message,
      stream_channel_id: streamChannelId,
      session_id: chatSessionId,
    };

    const url = `${this.host}/sdk_api/agent_apps/${appId}/chat_stream`;
    await this.customFetch.post(url, payload);

    return {
      sessionId: chatSessionId,
      result: resultPromise,
    };
  }

  /**
   * Get app execution status
   * @param params
   * @param params.appId - App Id
   * @param params.executionId - Execution Id
   * @returns App execution output
   */
  async getResults(params: ExecutionParams): Promise<AppExecution> {
    const { appId, executionId } = params;
    const url = `${this.host}/sdk_api/airops_apps/${appId}/executions/${executionId}`;
    return await this.customFetch.get(url);
  }

  /**
   * Cancel execution
   * @param params
   * @param params.appId - App ID
   * @param params.executionId - Execution ID
   */
  private async cancelExecution(params: ExecutionParams): Promise<void> {
    const { appId, executionId } = params;
    const url = `${this.host}/sdk_api/airops_apps/${appId}/executions/${executionId}/cancel`;
    await this.customFetch.patch(url);
  }
}

export default AirOpsApps;
