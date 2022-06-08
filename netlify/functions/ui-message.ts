import { Handler } from "@netlify/functions";
import { WebClient } from "@slack/web-api";
import { Message } from "@slack/web-api/dist/response/ConversationsHistoryResponse";

const token = process.env.SLACK_UI_MESSAGE_FETCHER_TOKEN;

const client = new WebClient(token, {
  // LogLevel can be imported and used to make debugging simpler
  // logLevel: LogLevel.DEBUG,
});

const minimumApprovals = process.env.REACT_APP_NETWORK === "mainnet" ? 2 : 1;

const cacheCreated = Date.now();
// const conversationName = "bridge-ui-messages";
const uiMessagesChannelId = "C03J16MCD1C";

let cachedMessage: any | string | undefined | null = null;
let cacheUpdated = cacheCreated;
const cacheExpiryMs = 60 * 60 * 1000;

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
      if (name === "bell" && count && count >= minimumApprovals) {
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
  let status = 200;
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
        const { text, client_msg_id: id, ts } = message;
        let timestamp = Date.now();
        if (ts) {
          timestamp = Number(ts.split(".")[0]);
        }
        cachedMessage = { text, id, timestamp };
        if (isUnpublishable(message)) {
          cachedMessage = undefined;
        }
      }
    }
  } catch (error) {
    // console.error(error);
    status = 500;
  }

  return {
    statusCode: status,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
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
