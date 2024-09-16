import * as botpress from '.botpress';
import axios from 'axios';
import {
  pingExternalService,
  createRemoteConversation,
  closeRemoteTicket,
  createRemoteUser,
} from './externalService'; 
import { handler } from './handler'; 

// Helper function to send raw payload
const sendRawPayload = async ({
  payload,
  conversation,
  ctx,
  user,
}: {
  client: any;
  payload: any;
  conversation: any;
  ctx: any;
  user: any;
}) => {
  await axios.post(ctx.configuration.endpointBaseUrl, {
    type: 'botSendsMessage',
    payload: {
      ...payload, // Send the entire payload as-is
      remoteConversationId: conversation.tags.externalId,
      remoteUserId: user.tags.externalId,
    },
  });
};

export default new botpress.Integration({
  register: async ({ ctx }) => {
    await pingExternalService(ctx.configuration.endpointBaseUrl);
  },
  unregister: async () => {},
  actions: {
    startHitl: async ({ ctx, input, client }) => {
      const remoteTicket = await createRemoteConversation(ctx.configuration.endpointBaseUrl, input);

      const { conversation: { id: conversationId } } = await client.createConversation({
        channel: 'hitl',
        tags: {
          externalId: remoteTicket.id,
        },
      });

      return {
        conversationId,
      };
    },
    stopHitl: async ({ ctx, input }) => {
      await closeRemoteTicket(ctx.configuration.endpointBaseUrl, input.conversationId);
      return {};
    },
    createUser: async ({ ctx, client: bpClient, input }) => {
      const remoteUser = await createRemoteUser(ctx.configuration.endpointBaseUrl, input);

      const { user } = await bpClient.createUser({
        tags: {
          externalId: `${remoteUser.id}`,
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
        text: sendRawPayload,
        image: sendRawPayload,
        markdown: sendRawPayload,
        audio: sendRawPayload,
        video: sendRawPayload,
        file: sendRawPayload,
        location: sendRawPayload,
        carousel: sendRawPayload,
        card: sendRawPayload,
        choice: sendRawPayload,
        dropdown: sendRawPayload,
        bloc: sendRawPayload,
      },
    },
  },
  handler: async (args) => {
    const { req, client, logger } = args;
    return handler({ req, client, logger }); // Pass client and logger to the handler
  },
});