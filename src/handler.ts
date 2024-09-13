import { AllPayloads, AgentAssignedPayload, CloseTicketPayload } from "./types";
import { z } from "zod";

/**
 * @swagger
 * /message-from-agent:
 *   post:
 *     summary: Send a message from the agent to the bot.
 *     tags:
 *      - Endpoints to implement
 *     description: Receives a message from the agent and forwards it to the bot conversation.
 *     operationId: messageFromAgent
 *     servers:
 *       - url: https://webhook.botpress.cloud/YOUR_WEBHOOK_ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AgentAssignedPayload'
 *     responses:
 *       200:
 *         description: Message successfully sent to the bot conversation.
 */
export const handleAgentMessage = async (
  client: any,
  body: z.infer<typeof AgentAssignedPayload>
) => {
  const { conversation } = await client.getOrCreateConversation({
    channel: "hitl",
    tags: {
      externalId: body.remoteConversationId,
    },
  });

  const { user } = await client.getOrCreateUser({
    tags: {
      externalId: body.remoteUserId,
    },
  });

  await client.createMessage({
    tags: {},
    type: "text",
    userId: user.id,
    conversationId: conversation.id,
    payload: { text: body.text },
  });
};

/**
 * @swagger
 * /agent-assigned:
 *   post:
 *     summary: Notify that an agent was assigned to a conversation.
 *     tags:
 *      - Endpoints to implement
 *     description: This endpoint is triggered when an agent is assigned to a conversation.
 *     operationId: agentAssigned
 *     servers:
 *       - url: https://webhook.botpress.cloud/YOUR_WEBHOOK_ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AgentAssignedPayload'
 *     responses:
 *       200:
 *         description: Agent assignment successfully processed.
 */
export const handleAgentAssigned = async (
  client: any,
  body: z.infer<typeof AgentAssignedPayload>
) => {
  const { conversation } = await client.getOrCreateConversation({
    channel: "hitl",
    tags: {
      externalId: body.remoteConversationId,
    },
  });

  const { user } = await client.getOrCreateUser({
    tags: {
      externalId: body.remoteUserId,
    },
  });

  await client.createMessage({
    tags: {},
    type: "text",
    userId: user.id,
    conversationId: conversation.id,
    payload: {
      text: `\`${body.agentDisplayName} has joined the chat and will be with you momentarily.\``,
    },
  });

  await client.createEvent({
    type: "hitlAssigned",
    payload: {
      conversationId: conversation.id,
      userId: user.id,
    },
  });
};

/**
 * @swagger
 * /close-ticket:
 *   post:
 *     summary: Stop the human-in-the-loop (HitL) session and close the ticket.
 *     tags:
 *      - Endpoints to implement
 *     description: This endpoint is called when the agent stops the human-in-the-loop session.
 *     operationId: stopHitl
 *     servers:
 *       - url: https://webhook.botpress.cloud/YOUR_WEBHOOK_ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CloseTicketPayload'
 *     responses:
 *       200:
 *         description: The HitL session was successfully stopped and the conversation was released.
 */
export const handleStopHitl = async (
  client: any,
  body: z.infer<typeof CloseTicketPayload>
) => {
  const { conversation } = await client.getOrCreateConversation({
    channel: "hitl",
    tags: {
      externalId: body.remoteConversationId,
    },
  });

  await client.createEvent({
    type: "hitlStopped",
    payload: {
      conversationId: conversation.id,
    },
  });
};

/**
 * The handler function handles incoming requests and dispatches them to the relevant
 * handler function based on the request path and method.
 */
export const handler = async ({
  req,
  client,
  logger,
}: {
  req: any;
  client: any;
  logger: any;
}) => {
  if (!req.body) {
    logger.forBot().warn("Handler received an empty body");
    return;
  }

  const body = JSON.parse(req.body);

  if (req.path === "/message-from-agent" && req.method === "POST") {
    await handleAgentMessage(client, body);
    return;
  }

  if (req.path === "/agent-assigned" && req.method === "POST") {
    await handleAgentAssigned(client, body);
    return;
  }

  if (req.path === "/close-ticket" && req.method === "POST") {
    await handleStopHitl(client, body);
    return;
  }

  throw new Error("Route not found");
};
