import { apiKeyRepository } from '../repositories';
import { HttpError, hashApiKey, generateApiKey } from '../utils';

function toApiKeyItem(apiKey: {
  id: string;
  keyHash: string;
  label: string | null;
  lastUsedAt: Date | null;
  requestCount: number;
  isActive: boolean;
  createdAt: Date;
}) {
  return {
    id: apiKey.id,
    label: apiKey.label ?? 'Untitled key',
    keyPreview: `nx_live_sk_...${apiKey.keyHash.slice(-8)}`,
    lastUsedAt: apiKey.lastUsedAt,
    requestCount: apiKey.requestCount,
    isActive: apiKey.isActive,
    createdAt: apiKey.createdAt,
  };
}

export const apiKeyService = {
  async list() {
    const apiKeys = await apiKeyRepository.findAll();
    return apiKeys.map(toApiKeyItem);
  },

  async create(label: string) {
    const rawKey = generateApiKey();
    const apiKey = await apiKeyRepository.create({
      label,
      keyHash: hashApiKey(rawKey),
    });

    return {
      ...toApiKeyItem(apiKey),
      key: rawKey,
    };
  },

  async revoke(id: string) {
    const updated = await apiKeyRepository.deactivate(id);
    if (updated.count === 0) {
      throw new HttpError(404, 'API key not found');
    }
  },
};
