export { createCampaignSchema, statusUpdateSchema, urlSchema } from './campaign.validator';
export type { CreateCampaignInput, StatusUpdateInput } from './campaign.validator';

export { urlsQuerySchema } from './url.validator';
export type { UrlsQueryInput } from './url.validator';

export { createApiKeySchema } from './api-key.validator';
export type { CreateApiKeyInput } from './api-key.validator';

export { toolsGoogleIndexSchema, toolsVerifyIndexSchema, toolsSitemapAnalyzeSchema } from './tools.validator';
export type { ToolsGoogleIndexInput, ToolsVerifyIndexInput, ToolsSitemapAnalyzeInput } from './tools.validator';
