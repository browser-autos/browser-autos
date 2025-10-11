/**
 * Swagger/OpenAPI Configuration
 *
 * Configures interactive API documentation
 */

import { FastifyDynamicSwaggerOptions } from '@fastify/swagger';
import { FastifySwaggerUiOptions } from '@fastify/swagger-ui';

/**
 * Swagger Configuration
 */
export const swaggerConfig: FastifyDynamicSwaggerOptions = {
  openapi: {
    info: {
      title: 'Browser.autos API',
      description: 'Browser automation CDP API service - control browsers programmatically',
      version: '1.0.0',
      contact: {
        name: 'Browser.autos',
        url: 'https://github.com/browser-autos',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server',
      },
      {
        url: 'https://api.browser.autos',
        description: 'Production server',
      },
    ],
    tags: [
      {
        name: 'Health',
        description: 'Health check and system information',
      },
      {
        name: 'Auth',
        description: 'Authentication and authorization endpoints',
      },
      {
        name: 'Screenshot',
        description: 'Screenshot capture operations',
      },
      {
        name: 'PDF',
        description: 'PDF generation operations',
      },
      {
        name: 'Content',
        description: 'Web content extraction operations',
      },
      {
        name: 'Scrape',
        description: 'Web scraping operations',
      },
      {
        name: 'Sessions',
        description: 'Browser session management',
      },
      {
        name: 'Queue',
        description: 'Task queue management',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token authentication',
        },
        apiKey: {
          type: 'apiKey',
          name: 'X-API-Key',
          in: 'header',
          description: 'API Key authentication',
        },
      },
      schemas: {
        // Common response schemas
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'object',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'object',
              properties: {
                code: {
                  type: 'string',
                },
                message: {
                  type: 'string',
                },
                details: {
                  type: 'object',
                },
              },
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        // Auth schemas
        LoginRequest: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: {
              type: 'string',
              example: 'admin',
            },
            password: {
              type: 'string',
              example: 'admin123',
            },
          },
        },
        TokenResponse: {
          type: 'object',
          properties: {
            accessToken: {
              type: 'string',
            },
            refreshToken: {
              type: 'string',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
            },
            username: {
              type: 'string',
            },
            email: {
              type: 'string',
            },
            role: {
              type: 'string',
              enum: ['admin', 'user', 'service'],
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        ApiKey: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
            },
            key: {
              type: 'string',
            },
            name: {
              type: 'string',
            },
            permissions: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
            expiresAt: {
              type: 'string',
              format: 'date-time',
              nullable: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        // Screenshot schemas
        ScreenshotRequest: {
          type: 'object',
          required: ['url'],
          properties: {
            url: {
              type: 'string',
              example: 'https://example.com',
            },
            fullPage: {
              type: 'boolean',
              default: false,
            },
            selector: {
              type: 'string',
              nullable: true,
            },
            viewport: {
              type: 'object',
              properties: {
                width: {
                  type: 'number',
                },
                height: {
                  type: 'number',
                },
              },
            },
            format: {
              type: 'string',
              enum: ['png', 'jpeg', 'webp'],
              default: 'png',
            },
            quality: {
              type: 'number',
              minimum: 0,
              maximum: 100,
            },
          },
        },
        // Queue schemas
        TaskRequest: {
          type: 'object',
          required: ['type', 'url'],
          properties: {
            type: {
              type: 'string',
              enum: ['screenshot', 'pdf', 'content', 'scrape', 'custom'],
            },
            url: {
              type: 'string',
            },
            priority: {
              type: 'number',
              default: 5,
              minimum: 0,
              maximum: 10,
            },
          },
        },
      },
    },
  },
};

/**
 * Swagger UI Configuration
 */
export const swaggerUiConfig: FastifySwaggerUiOptions = {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: true,
    displayRequestDuration: true,
    filter: true,
    tryItOutEnabled: true,
  },
  staticCSP: true,
  transformStaticCSP: (header: string) => header,
};
