import Pusher, { Channel } from 'pusher-js/with-encryption';
import {
  AgentActionData,
  AgentActionErrorData,
  AgentResponseData,
  ChatAction,
  CompletedData,
  PusherCallback,
  PusherChatCallback,
} from './ts/types';

/* eslint-disable no-process-env */
const APP_KEY = process.env.APP_KEY || '';
const APP_CLUSTER = process.env.APP_CLUSTER || '';

class PusherClient {
  private pusher: Pusher;
  private channel: Channel | undefined;
  private readonly channelPrefix: string;
  private readonly public: boolean = false;

  /**
   * Pusher constructor
   * @param userId
   * @param workspaceId
   * @param hashedUserId
   * @param host
   */
  constructor(userId?: string, workspaceId?: number, hashedUserId?: string, host?: string) {
    if (!userId || !workspaceId || !hashedUserId) {
      this.channelPrefix = 'public';
    } else {
      this.channelPrefix = 'private';
    }

    this.pusher = new Pusher(APP_KEY, {
      cluster: APP_CLUSTER,
      channelAuthorization: {
        transport: 'ajax',
        endpoint: `${host}/sdk_api/pusher/auth`,
        headers: {
          ...(userId && { user_id: userId }),
          ...(workspaceId && { workspace_id: workspaceId }),
          ...(hashedUserId && { user_id_hashed: hashedUserId }),
          'content-type': 'application/json',
        },
      },
    });
  }

  /**
   * Subscribe to channel
   * @param channelName
   * @param streamCallback
   * @param streamCompletedCallback
   */
  async subscribe(
    channelName: string,
    streamCallback: PusherCallback,
    streamCompletedCallback?: PusherCallback
  ): Promise<() => void> {
    const channel = `${this.channelPrefix}-${channelName}`;

    // subscribe to channel
    this.channel = this.pusher.subscribe(channel);

    // Wait for subscription to succeed, otherwise we could lose messages
    await this.waitForSubscription();

    // bind to chunk event
    this.channel.bind('chunk', streamCallback);
    this.channel.bind('completed', (data: { content: string }) => {
      this.channel?.unbind_all();
      this.channel?.unsubscribe();
      streamCompletedCallback?.(data);
    });

    return () => {
      this.channel?.unbind_all();
      this.channel?.unsubscribe();
    };
  }

  /**
   * Subscribe to channel
   * @param channelName
   * @param streamCallback
   * @param streamCompletedCallback
   */
  async subscribeChat(
    channelName: string,
    streamCallback: PusherChatCallback,
    streamCompletedCallback?: PusherChatCallback
  ): Promise<() => void> {
    const channel = `${this.channelPrefix}-${channelName}`;

    // subscribe to channel
    this.channel = this.pusher.subscribe(channel);

    // Wait for subscription to succeed, otherwise we could lose messages
    await this.waitForSubscription();

    // bind to chunk events
    this.channel.bind(ChatAction.AgentResponse, (data: Omit<AgentResponseData, 'action'>) =>
      streamCallback({ action: ChatAction.AgentResponse, ...data })
    );
    this.channel.bind(ChatAction.AgentAction, (data: Omit<AgentActionData, 'action'>) =>
      streamCallback({ action: ChatAction.AgentAction, ...data })
    );
    this.channel.bind(ChatAction.AgentActionError, (data: Omit<AgentActionErrorData, 'action'>) =>
      streamCallback({ action: ChatAction.AgentActionError, ...data })
    );
    this.channel.bind(ChatAction.Completed, (data: Omit<CompletedData, 'action'>) => {
      this.channel?.unbind_all();
      this.channel?.unsubscribe();
      streamCompletedCallback?.({ action: ChatAction.Completed, ...data });
    });

    return () => {
      this.channel?.unbind_all();
      this.channel?.unsubscribe();
    };
  }

  waitForSubscription(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.channel?.bind('pusher:subscription_error', (error: string) => {
        reject(new Error(`Subscription error: ${error}`));
      });

      this.channel?.bind('pusher:subscription_succeeded', () => {
        resolve(true);
      });
    });
  }
}

export default PusherClient;
