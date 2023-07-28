import { AgentActionErrorData, ChatAction } from '../types';

const isAgentActionError = (value: unknown): value is AgentActionErrorData => (
  typeof value === 'object' && value !== null && 'action' in value  && value.action === ChatAction.AgentActionError
);

export default isAgentActionError;
