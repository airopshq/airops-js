import AirOpsApps from './AirOpsApps';
import { IdentifyParams, AirOpsInterface } from './ts/types';

class AirOps implements AirOpsInterface {
  private readonly workspaceId?: number;
  private readonly userId?: string;
  private readonly hashedUserId?: string;
  private readonly host?: string;

  constructor(params?: IdentifyParams) {
    if (params) {
      const { userId, workspaceId, hashedUserId, host } = params;
      this.workspaceId = workspaceId;
      this.userId = userId;
      this.hashedUserId = hashedUserId;
      this.host = host || 'https://app.airops.com';
    }
  }

  /**
   * AirOps indentify
   * @param params
   * @param params.userId - User ID
   * @param params.workspaceId - Workspace ID
   * @param params.hashedUserId - Hashed User ID
   * @param params.host - Host URL optional
   * @returns - AirOps instance
   */
  public static identify(params: IdentifyParams): AirOps {
    const { workspaceId, userId, hashedUserId } = params;
    if (!workspaceId || !userId || !hashedUserId) {
      throw new Error('You must provide workspaceId, userId and hashedUserId to identify');
    }

    return new AirOps(params);
  }

  /**
   * AirOps indentify
   * @returns - Apps instance
   */
  public get apps(): AirOpsApps {
    return new AirOpsApps({
      workspaceId: this.workspaceId,
      userId: this.userId,
      hashedUserId: this.hashedUserId,
      host: this.host,
    });
  }
}

export default AirOps;
