# @airops/airops-js

Use [AirOps](https://docs.airops.com/docs/client-sdk) API in your client application with our JavaScript SDK.

[![npm](https://img.shields.io/npm/v/@airops/airops-js.svg)](https://www.npmjs.com/package/@airops/airops-js)

# Getting Started

## Server configuration

To authenticate with our API using the SDK, you'll need three pieces of information: your workspace id, API key and user
id (identifier for the user in your application). First, use the API key to hash your user id on your back-end server. This will result in a
hashed user id that is unique to your API key and user id combination. Workspace id and API key can be found in your
workspace settings.

### Example Node.js backend configuration.

```javascript
const crypto = require('crypto');

const userIdHash = () => {
  const apiKey = 'YOUR_API_KEY';
  const userId = 'YOUR_USER_ID';

  // Convert your api key to a buffer
  const key = Buffer.from(apiKey, 'utf-8');

  // Hash the message using HMAC-SHA256 and the key
  const hash = crypto.createHmac('sha256', key).update(userId).digest('hex');

  return hash;
};
```

## Installation

```bash
 npm i @airops/airops-js
```

or use the CDN:

```html
<script src=“https://cdn.jsdelivr.net/npm/@airops/airops-js/dist/index.umd.min.js”></script>
```

## Initialize the SDK

```javascript
const airopsInstance = AirOps.identify({
  userId: 'YOUR_USER_ID',
  workspaceId: 'YOUR_WORKSPACE_ID',
  hashedUserId: 'YOUR_USER_ID_HASH',
});
```

Note that authorization is **not** required to execute public apps. If you're working with public initialize without arguments:

```javascript
const airopsInstance = new AirOps();
```

## Usage

Once you have successfully initialized the SDK, you can begin using the methods available to interact with our API.
Note that the methods will return promises.

### Execute an App

The SDK provides a method for executing an app. In order to stream the app results you will need to enable stream and pass a callback function to the execute method. Optionally you can pass an extra callback function to get a notification when the app is finished.

```javascript
// Execute an app
const response = await airopsInstance.apps.execute({
  appId: 1,
  version: 1,
  payload: {
    inputs: {
      name: 'XXXXYYYYZZZZ',
    },
  },
  stream: true, // Optional - Default false
  streamCallback: (data: { content: string }) => {
    // Do something with the data
  }, // Optional, required if stream is true
  streamCompletedCallback: (data: { content: string }) => {
    // Do something with the data
  }, // Optional
});

// Wait for result
const result = await response.result();
// Do something with result.output

// Cancel execution
await response.cancel();
```

**Response**

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

The result method implements pulling logic for results with a timeout of **10 minutes**. If you want to implement your own pulling logic you can use the getResults method described below.

### Pull results async

You can implement your own pulling logic using the getResults method.

```javascript
const result = await airopsInstance.apps.getResults({
  executionId: response.executionId,
});
```

### Chat Stream

For Chat Apps, you can use the `chatStream` method which allows you to send messages to the Chat App.

```javascript
const response = await airopsInstance.apps.chatStream({
  appId: 2,
  message,
  inputs: {
    name: 'XXXXYYYYZZZZ',
  },
  streamCallback: ({ action: ChatAction, ...data) => {
    // ChatAction can either be 'agent-response', 'agent-action' or 'agent-action-error'
    // data will have different values depending on the action:
    //   - agent-response: { token: string, stream_finished: boolean, result :string }
    //   - agent-action: { tool: string, tool_input: Record<string, string> }
    //   - agent-action-error: { tool: string, tool_error: string }
  },
  streamCompletedCallback: (data: { result: string }) => {
    // do something with data.result
  },
  ...(sessionId && { sessionId }), // optionally pass sessionId to continue chat.
});
// Wait for result
const result = await response.result();
// Do something with result.result

// Use session id to continue chat
response.sessionId;
```

**Response**

The response from the chatStream method will contain the sessionId and a result method to wait for the response.
In order to continue with the chat pass the sessionId along with the message.

```typescript
export interface ChatStreamResponse {
  sessionId: string;
  result: Promise<{ result: string }>; // result is a promise that resolves when the execution is completed.
}
```

### Error handling

```javascript
try {
  await airopsInstance.apps.execute({
    appId: 1,
    version: 4,
    payload: {
      inputs: { name: 'XXXXYYYYZZZZ' },
    },
  });
} catch (e) {
  // Do something with error.message
}
```

## Need help?

Join our AirOps builder [slack](https://join.slack.com/t/airopsbuilders/shared_invite/zt-1whiyc290-fw8tsDn0nq89UqGSXIcUNA) community.
