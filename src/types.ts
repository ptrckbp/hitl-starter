import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

// Extend Zod with OpenAPI support
extendZodWithOpenApi(z);

export const PingPayload = z
  .object({
    type: z.literal("ping"),
  })
  .openapi("PingPayload");

export const CreateRemoteConversationPayload = z
  .object({
    type: z.literal("createRemoteConversation"),
    payload: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      messages: z
        .array(
          z.object({
            text: z.string(),
            author: z.string().optional(),
            timestamp: z.string().optional(),
          })
        )
        .optional(),
    }),
  })
  .openapi("CreateRemoteConversationPayload");

export const CloseRemoteTicketPayload = z
  .object({
    type: z.literal("closeRemoteTicket"),
    payload: z.object({
      botpressConversationId: z.string(),
    }),
  })
  .openapi("CloseRemoteTicketPayload");

export const CreateRemoteUserPayload = z
  .object({
    type: z.literal("createRemoteUser"),
    payload: z.object({}),
  })
  .openapi("CreateRemoteUserPayload");

export const BotSendsMessagePayload = z
  .object({
    type: z.literal("botSendsMessage"),
    payload: z.object({
      remoteConversationId: z.string(),
      remoteUserId: z.string(),
      payload: z.object({}).passthrough(),
    }),
  })
  .openapi("BotSendsMessagePayload");

export const AgentMessagePayload = z
  .object({
    remoteConversationId: z.string(),
    remoteUserId: z.string(),
    messageType: z.string(), 
    payload: z.object({}).passthrough(), 
  })
  .openapi("AgentMessagePayload");

export const AgentAssignedPayload = z
  .object({
    remoteConversationId: z.string(),
    remoteUserId: z.string(),
    agentDisplayName: z.string(),
  })
  .openapi("AgentAssignedPayload");

export const StopHitlPayload = z
  .object({
    remoteConversationId: z.string(),
  })
  .openapi("StopHitlPayload");

// Define conversation and user tags
export const ConversationTags = z
  .object({
    externalId: z.string(),
  })
  .openapi("ConversationTags");

export const UserTags = z
  .object({
    externalId: z.string(),
  })
  .openapi("UserTags");

// Define the handler input types
export const HandlerInput = z
  .object({
    ctx: z.object({
      configuration: z.object({
        endpointBaseUrl: z.string(),
      }),
    }),
    client: z.any(), // Replace with specific client type if available
    input: z.any(), // Replace with specific input type if available
  })
  .openapi("HandlerInput");

export const CreateRemoteConversationResponse = z
  .object({
    id: z.string(),
    title: z.string().optional(),
    description: z.string().optional(),
  })
  .openapi("CreateRemoteConversationResponse");

export const CloseRemoteTicketResponse = z
  .object({
    status: z.string(), // Assuming status, adjust as needed
  })
  .openapi("CloseRemoteTicketResponse");

export const CreateRemoteUserResponse = z
  .object({
    id: z.string(),
  })
  .openapi("CreateRemoteUserResponse");
