import { AgentResponseData, ChatAction } from '../types';

const isAgentResponse = (value: unknown): value is AgentResponseData => (
  typeof value === 'object' && value !== null && 'action' in value  && value.action === ChatAction.AgentResponse
);

export default isAgentResponse;
