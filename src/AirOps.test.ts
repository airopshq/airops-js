import AirOps from './AirOps';
import AirOpsApps from './AirOpsApps';

describe('AirOps', () => {
  describe('identify', () => {
    it('should create a new AirOps instance', () => {
      const identifyParams = {
        userId: 'user123',
        workspaceId: 1,
        hashedUserId: 'hashed123',
      };

      const airOps = AirOps.identify(identifyParams);

      expect(airOps).toBeInstanceOf(AirOps);
    });

    it('should throw an error if workspaceId, userId, or hashedUserId is missing', () => {
      const identifyParams = {
        userId: 'user123',
        workspaceId: 1,
      };

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore: Suppress TypeScript error for this specific test case
      expect(() => AirOps.identify(identifyParams)).toThrowError(
        'You must provide workspaceId, userId and hashedUserId to identify'
      );
    });
  });
});
