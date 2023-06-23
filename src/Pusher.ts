import Pusher, { Channel } from 'pusher-js/with-encryption';
import { PusherCallback, PusherChatCallback } from './ts/types';

/* eslint-disable no-process-env */
const APP_KEY = process.env.APP_KEY || '';
const APP_CLUSTER = process.env.APP_CLUSTER || '';

class PusherClient {
  private pusher: Pusher;
  private channel: Channel | undefined;

  /**
   * Pusher constructor
   * @param userId
   * @param workspaceId
   * @param hashedUserId
   * @param host
   */
  constructor(userId: string, workspaceId: number, hashedUserId: string, host: string) {
    this.pusher = new Pusher(APP_KEY, {
      cluster: APP_CLUSTER,
      channelAuthorization: {
        transport: 'ajax',
        endpoint: `${host}/sdk_api/pusher/auth`,
        headers: {
          user_id: userId,
          workspace_id: workspaceId,
          user_id_hashed: hashedUserId,
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
    // subscribe to channel
    this.channel = this.pusher.subscribe(`app-execution-${channelName}`);

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
   * @param resultResolver
   * @param channelName
   * @param streamCallback
   * @param streamCompletedCallback
   */
  async subscribeChat(
    resultResolver: Partial<{ resolve: (data: { result: string }) => void }>,
    channelName: string,
    streamCallback: PusherChatCallback,
    streamCompletedCallback?: PusherChatCallback
  ): Promise<() => void> {
    // subscribe to channel
    this.channel = this.pusher.subscribe(`agent-chat-${channelName}`);

    // Wait for subscription to succeed, otherwise we could lose messages
    await this.waitForSubscription();

    // bind to chunk event
    this.channel.bind('agent-response', streamCallback);
    this.channel.bind('completed', (data: { result: string }) => {
      this.channel?.unbind_all();
      this.channel?.unsubscribe();
      streamCompletedCallback?.(data);
      resultResolver.resolve?.(data);
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
