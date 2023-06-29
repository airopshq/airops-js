import Apps from '../AirOpsApps';

export type PusherCallback = (data: { content: string }) => void;
export type PusherChatCallback = (data: { token?: string; result?: string }) => void;

export interface IdentifyParams {
  userId: string;
  workspaceId: number;
  hashedUserId: string;
  host?: string;
}

export interface AirOpsInterface {
  apps: Apps;
}

export interface ExecuteParams {
  appId: number | string;
  version?: number;
  payload?: Record<string, unknown>;
  stream?: boolean;
  streamCallback?: PusherCallback;
  streamCompletedCallback?: PusherCallback;
}

export interface ExecuteResponse {
  executionId: number;
  result: () => Promise<AppExecution>;
  cancel: () => Promise<void>;
}

export interface AppExecution {
  airops_app_id: number;
  id: number;
  status: string;
  output: string;
  stream_channel_id: string;
}

export interface ExecutionParams {
  executionId: string;
}

export interface ChatStreamParams {
  appId: number;
  message: string;
  streamCallback: PusherChatCallback;
  streamCompletedCallback?: PusherChatCallback;
  sessionId?: string;
}

export interface ChatStreamResponse {
  sessionId: string;
  result: Promise<{ result: string }>;
}
