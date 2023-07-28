import AirOpsApps from './AirOpsApps';
import Pusher from './Pusher';
import fetchMock from 'jest-fetch-mock';

describe('AirOpsApps', () => {
  let airOpsApps: AirOpsApps;

  beforeEach(() => {
    // Initialize the AirOpsApps instance with required parameters
    airOpsApps = new AirOpsApps({
      userId: 'user123',
      workspaceId: 1,
      hashedUserId: 'hashed123',
    });
  });

  describe('execute', () => {
    beforeEach(() => {
      fetchMock.resetMocks();
    });

    it('should throw an error if appId is not provided', async () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore: Suppress TypeScript error for this specific test case
      await expect(airOpsApps.execute({})).rejects.toThrowError('You must provide an app id.');
    });

    it('should throw an error if stream is true and streamCallback is not provided', async () => {
      await expect(airOpsApps.execute({ appId: 1, stream: true })).rejects.toThrowError(
        'You must provide a callback function when streaming.'
      );
    });

    it('should return the execution response with result and cancel methods', async () => {
      const mockResponse = {
        airops_app_execution: {
          uuid: 'fake-uuid',
        },
      };
      fetchMock.mockResponse(JSON.stringify(mockResponse));

      const executionResponse = await airOpsApps.execute({
        appId: 1,
        version: 1,
        payload: {},
        stream: false,
      });

      expect(executionResponse.executionId).toBeDefined();
      expect(typeof executionResponse.result).toBe('function');
      expect(typeof executionResponse.cancel).toBe('function');
    });

    it('should call result method and return the result', async () => {
      const mockResponse = {
        airops_app_execution: {
          uuid: 'fake-uuid',
        },
      };
      fetchMock.mockResponse(JSON.stringify(mockResponse));

      // Create a mock instance of the class
      const mockedAirOpsApps = new AirOpsApps({
        userId: 'user123',
        workspaceId: 1,
        hashedUserId: 'hashed123',
      });
      mockedAirOpsApps.getResults = jest.fn().mockResolvedValueOnce({ status: 'completed', result: 'App output' });

      // Call the execute method
      const executionParams = {
        appId: 1,
        version: 1,
        payload: {},
      };
      const executionResult = await mockedAirOpsApps.execute(executionParams);

      // Call the result method
      const result = await executionResult.result();

      // Check the result
      expect(result).toEqual({ status: 'completed', result: 'App output' });

      // Check that the getResults method was called
      expect(mockedAirOpsApps.getResults).toHaveBeenCalledWith({
        executionId: executionResult.executionId,
      });
    });
  });

  describe('chatStream', () => {
    beforeEach(() => {
      const spy = jest.spyOn(Pusher.prototype, 'waitForSubscription');

      spy.mockImplementation(async () => {
        return true;
      });
    });

    it('should throw an error if message, appId, and streamCallback are not provided', async () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore: Suppress TypeScript error for this specific test case
      await expect(airOpsApps.chatStream({})).rejects.toThrowError(
        'You must provide a message, appId and streamCallback.'
      );
    });

    it('should return the chat stream response with sessionId and result promise', async () => {
      const chatStreamResponse = await airOpsApps.chatStream({
        message: 'Hello',
        appId: 1,
        streamCallback: jest.fn(),
      });

      expect(chatStreamResponse.sessionId).toBeDefined();
      expect(chatStreamResponse.result).toBeInstanceOf(Function);
    });
  });
});
