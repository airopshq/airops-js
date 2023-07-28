import { AgentActionData, ChatAction } from '../types';

const isAgentAction = (value: unknown): value is AgentActionData => (
  typeof value === 'object' && value !== null && 'action' in value  && value.action === ChatAction.AgentAction
);

export default isAgentAction;
