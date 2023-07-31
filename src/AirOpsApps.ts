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
  private readonly userId?: string;
  private readonly workspaceId?: number;
  private readonly hashedUserId?: string;
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
   * Get app
   * @param appId - App Id
   * @returns App execution output
   */
  async get(appId: string): Promise<any> {
    if (!appId) {
      throw new Error('You must provide an app id.');
    }

    const url = `${this.host}/sdk_api/airops_app_bases/${appId}?methods=type`;
    return await this.customFetch.get(url);
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
      unsubscribeMethod = await pusher.subscribe(channelName, streamCallback, streamCompletedCallback);
    } else if (stream) {
      throw new Error('You must provide a callback function when streaming.');
    }

    const url = version
      ? `${this.host}/sdk_api/airops_apps/${appId}/async_execute/v${version}`
      : `${this.host}/sdk_api/airops_apps/${appId}/async_execute`;

    const response = await this.customFetch.post(url, apiPayload);

    return {
      executionId: response.airops_app_execution.uuid,
      result: () => this.pollExecutionResult(response),
      cancel: async () => {
        unsubscribeMethod?.();
        await this.cancelExecution({
          executionId: response.airops_app_execution.uuid,
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
    const { message, appId, inputs, streamCallback, streamCompletedCallback, sessionId } = params;

    if (!message || !appId || !streamCallback) {
      throw new Error('You must provide a message, appId and streamCallback.');
    }

    const streamChannelId = uuidv4();
    const chatSessionId = sessionId ? sessionId : uuidv4();

    const pusher = new Pusher(this.userId, this.workspaceId, this.hashedUserId, this.host);

    const unsubscribeMethod = await pusher.subscribeChat(streamChannelId, streamCallback, streamCompletedCallback);

    const payload = {
      definition: null,
      inputs,
      message,
      stream_channel_id: streamChannelId,
      session_id: chatSessionId,
    };

    const url = `${this.host}/sdk_api/agent_apps/${appId}/chat_stream`;
    const response = await this.customFetch.post(url, payload);

    return {
      cancel: async () => {
        unsubscribeMethod?.();
        await this.cancelExecution({
          executionId: response.airops_app_execution.uuid,
        });
      },
      sessionId: chatSessionId,
      result: () => this.pollExecutionResult(response),
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
    const { executionId } = params;
    const url = `${this.host}/sdk_api/airops_apps/executions/${executionId}`;
    return await this.customFetch.get(url);
  }

  /**
   * Cancel execution
   * @param params
   * @param params.appId - App ID
   * @param params.executionId - Execution ID
   */
  private async cancelExecution(params: ExecutionParams): Promise<void> {
    const { executionId } = params;
    const url = `${this.host}/sdk_api/airops_apps/executions/${executionId}/cancel`;
    await this.customFetch.patch(url);
  }

  private async pollExecutionResult(response: { airops_app_execution: { uuid: string } }): Promise<AppExecution> {
    const timeout = 10 * 60 * 1000; // Timeout in milliseconds (10 minutes)
    const startTime = Date.now();

    let result = null;
    while (!result || ['queued', 'pending', 'running'].includes(result?.status)) {
      if (Date.now() - startTime > timeout) {
        throw new Error('App execution timeout. You can retrieve the results using the appId & executionId.');
      }
      result = await this.getResults({
        executionId: response.airops_app_execution.uuid,
      });
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    return result;
  }
}

export default AirOpsApps;
