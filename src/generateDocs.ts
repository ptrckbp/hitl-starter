import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi";
import swaggerJSDoc from "swagger-jsdoc";
import fs from "fs";
import {
  PingPayload,
  CreateRemoteConversationPayload,
  AddMessageToRemoteConversationPayload,
  CloseRemoteTicketPayload,
  CreateRemoteUserPayload,
  BotSendsMessagePayload,
  AgentAssignedPayload,
  CloseTicketPayload,
  PingResponse,
  CreateRemoteConversationResponse,
  AddMessageToRemoteConversationResponse,
  CloseRemoteTicketResponse,
  CreateRemoteUserResponse,
  BotSendsMessageResponse,
} from "./types";

// Initialize the OpenAPI registry
const registry = new OpenAPIRegistry();

// Register payload schemas using the registry
registry.register("PingPayload", PingPayload);
registry.register(
  "CreateRemoteConversationPayload",
  CreateRemoteConversationPayload
);
registry.register(
  "AddMessageToRemoteConversationPayload",
  AddMessageToRemoteConversationPayload
);
registry.register("CloseRemoteTicketPayload", CloseRemoteTicketPayload);
registry.register("CreateRemoteUserPayload", CreateRemoteUserPayload);
registry.register("BotSendsMessagePayload", BotSendsMessagePayload);
registry.register("AgentAssignedPayload", AgentAssignedPayload);
registry.register("CloseTicketPayload", CloseTicketPayload);

// Register response schemas using the registry
registry.register("PingResponse", PingResponse);
registry.register(
  "CreateRemoteConversationResponse",
  CreateRemoteConversationResponse
);
registry.register(
  "AddMessageToRemoteConversationResponse",
  AddMessageToRemoteConversationResponse
);
registry.register("CloseRemoteTicketResponse", CloseRemoteTicketResponse);
registry.register("CreateRemoteUserResponse", CreateRemoteUserResponse);
registry.register("BotSendsMessageResponse", BotSendsMessageResponse);

// Generate the OpenAPI components from Zod schemas
const generator = new OpenApiGeneratorV3(registry.definitions);
const openApiComponents = generator.generateComponents();

// Swagger JSDoc options for Botpress Webhook API (handler.ts)
const swaggerOptionsBotpressWebhook = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Botpress HITL API - Calling Botpress",
      version: "1.0.0",
      description: "The Botpress HITL API to interact with conversations",
    },
    servers: [
      {
        url: "https://webhook.botpress.cloud/YOUR_WEBHOOK_ID",
        description: "The Botpress HITL API endpoint to interact with conversations",
      },
    ],
    components: openApiComponents.components, // Use the generated components from Zod
  },
  apis: ["./src/handler.ts"], // Include only handler.ts
};

// Swagger JSDoc options for External Service API (externalService.ts)
const swaggerOptionsExternalService = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Botpress HITL API - Handling Requests",
      version: "1.0.0",
      description: "The API you need to implement on your end to receive HITL requests",
    },
    servers: [
      {
        url: "https://YOUR_EXTERNAL_SERVICE.COM",
        description: "External Service URL",
      },
    ],
    components: openApiComponents.components, // Use the generated components from Zod
  },
  apis: ["./src/externalService.ts"], // Include only externalService.ts
};

// Generate Swagger specifications
const swaggerSpecBotpressWebhook = swaggerJSDoc(swaggerOptionsBotpressWebhook);
const swaggerSpecExternalService = swaggerJSDoc(swaggerOptionsExternalService);

// Write the Swagger specs to separate files
fs.writeFileSync("./openapi-botpress-webhook.json", JSON.stringify(swaggerSpecBotpressWebhook, null, 2));
fs.writeFileSync("./openapi-external-service.json", JSON.stringify(swaggerSpecExternalService, null, 2));

console.log("OpenAPI JSON generated for Botpress Webhook at ./openapi-botpress-webhook.json");
console.log("OpenAPI JSON generated for External Service at ./openapi-external-service.json");