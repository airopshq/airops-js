import Apps from '../AirOpsApps';

export type PusherCallback = (data: { content: string }) => void;
export enum ChatAction {
  'AgentResponse' = 'agent-response',
  'AgentAction' = 'agent-action',
  'AgentActionError' = 'agent-action-error',
  'Completed' = 'completed',
}
export type AgentResponseData = {
  action: ChatAction.AgentResponse;
  token: string;
  stream_finished: boolean;
  result: string;
};
export type AgentActionData = {
  action: ChatAction.AgentAction;
  tool: string;
  tool_input: Record<string, string>;
};
export type AgentActionErrorData = {
  action: ChatAction.AgentActionError;
  tool: string;
  tool_error: string;
};
export type CompletedData = { action: ChatAction.Completed; result: string };
export type PusherChatCallback = (
  arg: AgentResponseData | AgentActionData | AgentActionErrorData | CompletedData
) => void;

export interface IdentifyParams {
  userId?: string;
  workspaceId?: number;
  hashedUserId?: string;
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
  cancel: () => Promise<void>;
  executionId: number;
  result: () => Promise<AppExecution>;
}

export interface AppExecution {
  airops_app_id: number;
  error_code: string | null;
  error_message: string | null;
  id: number;
  output: string | Record<string, any>;
  status: 'pending' | 'running' | 'error' | 'success' | 'cancelled';
  stream_channel_id: string;
  uuid: string;
}

export interface ExecutionParams {
  executionId: string;
}

export interface ChatStreamParams {
  appId: number | string;
  message: string;
  streamCallback: PusherChatCallback;
  streamCompletedCallback?: PusherChatCallback;
  sessionId?: string;
  inputs?: Record<string, unknown>;
}

export interface ChatStreamResponse {
  cancel: () => Promise<void>;
  result: () => Promise<AppExecution>;
  sessionId: string;
}
