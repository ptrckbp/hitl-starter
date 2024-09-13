import { IntegrationDefinition, messages, interfaces, z } from "@botpress/sdk";
import { name, integrationName } from "./package.json";

export default new IntegrationDefinition({
  name: integrationName ?? name,
  version: "0.2.0",
  readme: "README.md",
  channels: {
    hitl: {
      messages: { ...messages.defaults },
      conversation: {
        tags: {
          externalId: {
            title: "Remote Conversation ID",
          }
        }
      }
    },
  },
  configuration: {
    schema: z.object({
      endpointUrl: z.string(),
    }),
  },
  user: {
    tags: {
      externalId: {
        title: "Remote User ID",
      },
    },
  },
}).extend(interfaces.hitl, () => ({}));
