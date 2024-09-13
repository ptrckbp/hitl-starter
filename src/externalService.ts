import axios from "axios";
import {
  PingPayload,
  CreateRemoteConversationPayload,
  AddMessageToRemoteConversationPayload,
  CloseRemoteTicketPayload,
  CreateRemoteUserPayload,
  BotSendsMessagePayload,
  PingResponse,
  CreateRemoteConversationResponse,
  AddMessageToRemoteConversationResponse,
  CloseRemoteTicketResponse,
  CreateRemoteUserResponse,
  BotSendsMessageResponse,
} from "./types";

/**
 * @swagger
 * /ping:
 *   post:
 *     summary: Ping your service
 *     tags:
 *      - Endpoints to implement
 *     description: An authenticated endpoint that allows your service to say it's ready to receive requests.
 *     operationId: pingExternalService
 *     servers:
 *       - url: https://YOUR_SERVICE.COM
 *     responses:
 *       200:
 *         description: Successful ping.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PingResponse'
 */
export const pingExternalService = async (endpointUrl: string) => {
  const pingPayload = PingPayload.parse({
    type: "ping",
  });
  const response = await axios.post(endpointUrl, pingPayload);
  return PingResponse.parse(response.data);
};

/**
 * @swagger
 * /createRemoteConversation:
 *   post:
 *     summary: Create a conversation in your service
 *     tags:
 *      - Endpoints to implement
 *     description: Creates a remote conversation on your service. This is required for the HITL process to work.
 *     operationId: createRemoteConversation
 *     servers:
 *       - url: https://YOUR_SERVICE.COM
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRemoteConversationPayload'
 *     responses:
 *       200:
 *         description: Conversation created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateRemoteConversationResponse'
 */
export const createRemoteConversation = async (
  endpointUrl: string,
  input: any
) => {
  const createRemoteConversationPayload = CreateRemoteConversationPayload.parse(
    {
      type: "createRemoteConversation",
      payload: { ...input },
    }
  );
  const response = await axios.post(
    endpointUrl,
    createRemoteConversationPayload
  );
  return CreateRemoteConversationResponse.parse(response.data);
};

/**
 * @swagger
 * /addMessageToRemoteConversation:
 *   post:
 *     summary: Add a message to a conversation
 *     tags:
 *      - Endpoints to implement
 *     description: Adds a message to an existing remote conversation on your service. This message is sent by the user and is part of the HITL process.
 *     operationId: addMessageToRemoteConversation
 *     servers:
 *       - url: https://YOUR_SERVICE.COM
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddMessageToRemoteConversationPayload'
 *     responses:
 *       200:
 *         description: Message added successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AddMessageToRemoteConversationResponse'
 */
export const addMessageToRemoteConversation = async (
  endpointUrl: string,
  message: any,
  ticketId: string
) => {
  const addMessagePayload = AddMessageToRemoteConversationPayload.parse({
    type: "addMessageToRemoteConversation",
    payload: { ...message, ticketId },
  });
  const response = await axios.post(endpointUrl, addMessagePayload);
  return AddMessageToRemoteConversationResponse.parse(response.data);
};

/**
 * @swagger
 * /closeRemoteTicket:
 *   post:
 *     summary: Close a ticket
 *     tags:
 *      - Endpoints to implement
 *     description: Closes a ticket on your service. Once closed, no further actions are expected for this conversation.
 *     operationId: closeRemoteTicket
 *     servers:
 *       - url: https://YOUR_SERVICE.COM
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CloseRemoteTicketPayload'
 *     responses:
 *       200:
 *         description: Ticket closed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CloseRemoteTicketResponse'
 */
export const closeRemoteTicket = async (
  endpointUrl: string,
  botpressConversationId: string
) => {
  const closeTicketPayload = CloseRemoteTicketPayload.parse({
    type: "closeRemoteTicket",
    payload: { botpressConversationId },
  });
  const response = await axios.post(endpointUrl, closeTicketPayload);
  return CloseRemoteTicketResponse.parse(response.data);
};

/**
 * @swagger
 * /createRemoteUser:
 *   post:
 *     summary: Create a user
 *     tags:
 *      - Endpoints to implement
 *     description: Creates a user on your service. This is necessary to associate users with conversations in the HITL process.
 *     operationId: createRemoteUser
 *     servers:
 *       - url: https://YOUR_SERVICE.COM
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRemoteUserPayload'
 *     responses:
 *       200:
 *         description: User created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateRemoteUserResponse'
 */
export const createRemoteUser = async (endpointUrl: string, input: any) => {
  const createRemoteUserPayload = CreateRemoteUserPayload.parse({
    type: "createRemoteUser",
    payload: { role: "end-user", ...input },
  });
  const response = await axios.post(endpointUrl, createRemoteUserPayload);
  return CreateRemoteUserResponse.parse(response.data);
};

/**
 * @swagger
 * /botSendsMessage:
 *   post:
 *     summary: Send a message to the agent
 *     tags:
 *      - Endpoints to implement
 *     description: Sends a message from the bot to the agent conversation on your service as part of the HITL process.
 *     operationId: botSendsMessage
 *     servers:
 *       - url: https://YOUR_SERVICE.COM
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BotSendsMessagePayload'
 *     responses:
 *       200:
 *         description: Message sent successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BotSendsMessageResponse'
 */
export const botSendsMessage = async (
  endpointUrl: string,
  conversationId: string,
  userId: string,
  payload: any
) => {
  const botSendsMessagePayload = BotSendsMessagePayload.parse({
    type: "botSendsMessage",
    payload: {
      remoteConversationId: conversationId,
      remoteUserId: userId,
      payload,
    },
  });
  const response = await axios.post(endpointUrl, botSendsMessagePayload);
  return BotSendsMessageResponse.parse(response.data);
};