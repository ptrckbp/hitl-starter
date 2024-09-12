import { RuntimeError } from "@botpress/client";
import * as botpress from ".botpress";
import axios from "axios";

class NotImplementedError extends Error {
  constructor() {
    super("Not implemented");
  }
}

export default new botpress.Integration({
  register: async ({ ctx }) => {
    try {
      await axios.post(ctx.configuration.endpointUrl, {
        type: "ping",
      });
    } catch (error) {
      throw new RuntimeError("The url didn't return a 200 status code");
    }
  },
  unregister: async () => {},
  actions: {
    startHitl: async ({ ctx, input, client }) => {
      const remoteTicket = (
        await axios.post(ctx.configuration.endpointUrl, {
          type: "createRemoteConversation",
          payload: { ...input }, // passes things like title description
        })
      ).data;

      const {
        conversation: { id: conversationId },
      } = await client.createConversation({
        channel: "hitl",
        tags: {
          id: remoteTicket.id,
        },
      });

      return {
        conversationId,
      };
    },
    stopHitl: async ({ ctx, input }) => {
      // can we control the behavior with this: for example never close tickets in zendesk, just continue the conversation in the same ticket?
      // is this within the hands of the botpress developer? // ask Eff
      await axios.post(ctx.configuration.endpointUrl, {
        type: "closeRemoteTicket",
        payload: { botpressConversationId: input.conversationId }, // why no userId here?
      });
      return {};
    },
    createUser: async ({
      // who invokes createUser? when is it invoked? before startHITL
      ctx,
      client: bpClient,
      input,
    }) => {
      const remoteUser = (
        await axios.post(ctx.configuration.endpointUrl, {
          type: "createRemoteUser",
          payload: { role: "end-user", ...input }, // passes things like name, email
        })
      ).data;

      const { user } = await bpClient.createUser({
        tags: {
          id: `${remoteUser.id}`,
        },
      });

      return {
        userId: user.id,
      };
    },
  },
  channels: {
    hitl: {
      messages: {
        text: async ({ client, payload, conversation, ctx, user }) => {
          const { text } = payload;

          const remoteConversationId = conversation.tags.id;

          const remoteUserId = user.tags.id;

          await axios.post(ctx.configuration.endpointUrl, {
            type: "botSendsMessage",
            payload: {
              remoteConversationId,
              remoteUserId,
              text,
            },
          });
        },
        image: async () => {
          throw new NotImplementedError();
        },
        markdown: async () => {
          throw new NotImplementedError();
        },
        audio: async () => {
          throw new NotImplementedError();
        },
        video: async () => {
          throw new NotImplementedError();
        },
        file: async () => {
          throw new NotImplementedError();
        },
        location: async () => {
          throw new NotImplementedError();
        },
        carousel: async () => {
          throw new NotImplementedError();
        },
        card: async () => {
          throw new NotImplementedError();
        },
        choice: async () => {
          throw new NotImplementedError();
        },
        dropdown: async () => {
          throw new NotImplementedError();
        },
        bloc: async () => {
          throw new NotImplementedError();
        },
      },
    },
  },
  handler: async ({ req, ctx, client, logger }) => {
    if (!req.body) {
      logger.forBot().warn("Handler received an empty body");
      return;
    }
    const body = JSON.parse(req.body);

    if (req.path === "/message-from-agent" && req.method === "POST") {
      const { conversation } = await client.getOrCreateConversation({
        // why is this get or create, shouldn't it be get only? or throw error?
        // IT should be get only, but there's an issue with this method, and this solves it.
        // listConversations using tags, and getting the first element.
        // That would be the right way using the current API.
        channel: "hitl",
        tags: {
          id: body.remoteConversationId, // then do we need to pass botpress conversation id to external platform?
        },
      });

      const { user } = await client.getOrCreateUser({
        // why is this get or create, shouldn't it be get only? or throw error?
        // IT should be get only, but there's an issue with this method, and this solves it.
        // listConversations using tags, and getting the first element.
        // That would be the right way using the current API.
        // why is this get or create, shouldn't it be get only? or throw error?
        tags: {
          id: body.remoteUserId, // then do we need to pass botpress user id to external platform?
        },
      });

      await client.createMessage({
        tags: {},
        type: "text",
        userId: user.id,
        conversationId: conversation.id,
        payload: { text: body.text },
      });
      return;
    }

    if (req.path === "/agent-assigned" && req.method === "POST") {
      const {
        remoteConversationId: conversationId,
        remoteUserId: userId,
        agentDisplayName,
      } = body;

      const { conversation } = await client.getOrCreateConversation({
        channel: "hitl",
        tags: {
          id: conversationId,
        },
      });

      const { user } = await client.getOrCreateUser({
        tags: {
          id: userId,
        },
      });

      await client.createMessage({
        // send a message to the user
        tags: {},
        type: "text",
        userId: user.id,
        conversationId: conversation.id,
        payload: {
          text: `\`${agentDisplayName} has joined the chat and will be with you momentarily.\``,
        },
      });

      await client.createEvent({
        type: "hitlAssigned",
        payload: {
          conversationId: conversation.id,
          userId: user.id,
        },
      });
      return;
    }

    if (req.path === "/close-ticket" && req.method === "POST") {
      const { remoteConversationId: conversationId } = body;

      const { conversation } = await client.getOrCreateConversation({
        channel: "hitl",
        tags: {
          id: conversationId,
        },
      });

      await client.createEvent({
        type: "hitlStopped", // this event releases the conversation from the hitl
        payload: {
          conversationId: conversation.id,
        },
      });
      return;
    }

    throw new NotImplementedError();
  },
});
