import { Handler } from "@netlify/functions";
import { WebClient, LogLevel } from "@slack/web-api";
import { Message } from "@slack/web-api/dist/response/ConversationsHistoryResponse";

const token = process.env.SLACK_UI_MESSAGE_FETCHER_TOKEN;

const client = new WebClient(token, {
  // LogLevel can be imported and used to make debugging simpler
  logLevel: LogLevel.DEBUG,
});

const cacheCreated = Date.now();
// const conversationName = "bridge-ui-messages";
const uiMessagesChannelId = "C03J16MCD1C";

let cachedMessage: any | string | undefined | null = null;
let cacheUpdated = cacheCreated;
const cacheExpiryMs = 1 * 60 * 1000;

function cacheExpired() {
  const now = Date.now();
  return now - cacheUpdated > cacheExpiryMs;
}

function isUserMessage(message: Message) {
  const { type, client_msg_id } = message;
  return !!(type === "message" && client_msg_id);
}

function isPublishable(message: Message) {
  const { reactions } = message;
  if (isUserMessage(message) && reactions) {
    for (const reaction of reactions) {
      const { name, count } = reaction;
      if (name === "bell" && count) {
        // publishable
        // console.log("publishable message", message);
        return true;
      }
    }
  }
  return false;
}

function isUnpublishable(message: Message) {
  const { reactions } = message;
  if (isUserMessage(message) && reactions) {
    for (const reaction of reactions) {
      const { name, count } = reaction;
      if (name === "no_bell" && count) {
        // unpublishable
        // console.log("unpublishable message", message);
        return true;
      }
    }
  }
  return false;
}

async function fetchLatestPublishableMessage(channelId: string) {
  const result = await client.conversations.history({
    channel: channelId,
  });
  const { ok, messages } = result;
  if (!ok || !messages) {
    return null;
  }
  for (const message of messages) {
    if (isPublishable(message)) {
      return message;
    }
  }
  return null;
}

const handler: Handler = async (event, context) => {
  // await findConversation(conversationName);
  try {
    const { reload, forceClean } = event.queryStringParameters || {};
    if (forceClean) {
      // console.log("cleaning cached message");
      cachedMessage = undefined;
    } else if (reload || cachedMessage === null || cacheExpired()) {
      // console.log("fetching newest message");
      const message = await fetchLatestPublishableMessage(uiMessagesChannelId);
      if (message !== null) {
        cacheUpdated = Date.now();
        console.log(message);
        console.log(message.blocks);
        const { text, blocks } = message;
        cachedMessage = { text, blocks };
        if (isUnpublishable(message)) {
          cachedMessage = undefined;
        }
      }
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error,
        message: cachedMessage,
        created: new Date(cacheCreated).toISOString(),
        updated: new Date(cacheUpdated).toISOString(),
      }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: cachedMessage,
        created: new Date(cacheCreated).toISOString(),
        updated: new Date(cacheUpdated).toISOString(),
      },
      null,
      2
    ),
  };
};

export { handler };

// Find conversation ID using the conversations.list method
// async function findConversation(name: string) {
//   try {
//     // Call the conversations.list method using the built-in WebClient
//     const result = await client.conversations.list({
//     });
//     console.log(result);
//     let conversationId;
//     for (const channel of result.channels || []) {
//       if (channel.name === name) {
//         conversationId = channel.id;
//
//         // Print result
//         console.log("Found conversation ID: " + conversationId);
//         // Break from for loop
//         break;
//       }
//     }
//   } catch (error) {
//     console.error(error);
//   }
// }
