# @airops/sdk

## Getting Started

1. Server configuration

   To authenticate with our API using the SDK, you'll need three pieces of information: your workspace id, user
   id, and API key. First, use the API key to hash your user id on your back-end server. This will result in a
   hashed user id that is unique to your API key and user id combination. Workspace id and API key can be found in your
   workspace settings. Below is an example nodejs configuration.

   ```javascript
   const crypto = require('crypto');

   const userIdHash = () => {
     const apiKey = "YOUR_API_KEY";
     const userId = "YOUR_USER_ID";

     // Convert your api key to a buffer
     const key = Buffer.from(apiKey, 'utf-8');

     // Hash the message using HMAC-SHA256 and the key
     const hash = crypto.createHmac('sha256', key)
       .update(userId)
       .digest('hex');

     return hash;
   }
   ```
2. Install the client SDK

   ```bash
    npm i @airops/js_sdk
   ```

3. Identify the user

   ```javascript
   const airopsInstance = AirOps.identify({
     userId: 'YOUR_USER_ID',
     workspaceId: 'YOUR_WORKSPACE_ID',
     hashedUserId: 'YOUR_USER_ID_HASH'
   })
   ```

4. Use it to execute an app

   Once you have successfully initialized the SDK, you can begin using the methods available to interact with our API.
   Note that the methods will return promises.

   ```javascript
   // Execute an app
   const response = await airopsInstance.apps.execute({
     appId: 1,
     version: 1,
     payload: {
       "inputs": {
         "name": "XXXXYYYYZZZZ"
       }
     }
   });

   // Wait for result
   const result = await response.result();
   // Do something with result.output

   // Cancel execution
   await response.cancel();
   ```

5. Example response

   The response from the execute method will contain the execution id that can be used to retrieve results later along with two methods to wait for results or cancel the execution:

   ```typescript
   interface ExecuteResponse {
     executionId: number;
     result: () => Promise<AppExecution>;
     cancel: () => Promise<void>;
   }

   interface AppExecution {
     airops_app_id: number;
     id: number;
     status: string;
     output: string;
     stream_channel_id: string;
   }
   ```

6. Execute an app with streaming

   In order to stream the app results you will need to enable stream and pass a callback function to the execute method.
   Optionally you can pass an extra callback function to get a notification when the app is finished.

   ```javascript
   const response = await airopsInstance.apps.execute({
     appId: 1,
     version: 1,
     payload: {
       inputs: {
         name: "XXXXYYYYZZZZ",
       },
     },
     stream: true,
     streamCallback: (data: { content: string }) => {
       // Do something with the data
     },
     streamCompletedCallback: (data: { content: string }) => {
       // Do something with the data
     },
   });
   ```

7. Pull results async

   You can implement your own pulling logic using the getResults method.

   ```javascript
   const result = await airopsInstance.apps.getResults({
     appId: 1,
     executionId: response.executionId,
   });
   ```

8. Error handling
   ```javascript
   try {
     await airopsInstance.apps.execute({
       appId: 1,
       version: 4,
       payload: {
         inputs: { name: "XXXXYYYYZZZZ" },
       },
     });
   } catch (e) {
     // Do something with error.message
   }
   ```

9. Chat assistant

   ```javascript
   const response = await airopsInstance.apps.chatStream({
     appId: 2,
     message,
     streamCallback: (data: { token: string; }) => {
       // do something with data.token
     },
     streamCompletedCallback: (data: { result: string }) => {
       // do something with data.result
     },
     ...(sessionId && { sessionId }), // optionally pass sessionId to continue chat.
   });
   // Wait for result
   const result = await response.result;
   // Do something with result.result
   
   // Use session id to continue chat
   response.sessionId;
   ```

10. Example response

    The response from the chatStream method will contain the sessionId and a result method to wait for the response.
    In order to continue with the chat pass the sessionId along with the message.
    
    ```typescript
    export interface ChatStreamResponse {
      sessionId: string;
      result: Promise<{ result: string }>; // result is a promise that resolves when the execution is completed.
    }
    ```