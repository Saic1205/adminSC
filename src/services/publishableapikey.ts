import { EntityManager } from "typeorm";
import { PublishableApiKey, TransactionBaseService } from "@medusajs/medusa";
import { PublishableApiKeySalesChannel } from "@medusajs/medusa";

class PublishableApiKeyService extends TransactionBaseService {
  private readonly publishableapikeyRepository: any;
  private readonly publishableapikeysaleschannelRepository: any;

  constructor(container) {
    super(container);
    try {
      this.publishableapikeyRepository = container.publishableapikeyRepository;
      this.publishableapikeysaleschannelRepository =
        container.publishableapikeysaleschannelRepository;
    } catch (e) {
      console.error("Error initializing PublishableApiKeyService:", e);
    }
  }

  public runAtomicPhase<T>(
    callback: (manager: EntityManager) => Promise<T>
  ): Promise<T> {
    return this.atomicPhase_(callback);
  }

  // Simplified 

  async create(
    salesChannelId: string,
    keyData: Partial<PublishableApiKey>
  ): Promise<PublishableApiKey> {
    if (!keyData.title) {
      throw new Error("Title is required.");
    }

    const newApiKey = this.publishableapikeyRepository.create({
      ...keyData,
      title: keyData.title,
    });

    const savedApiKey = await this.publishableapikeyRepository.save(newApiKey);

    const publishableApiKeySalesChannel =
      this.publishableapikeysaleschannelRepository.create({
        publishable_key_id: savedApiKey.id,
        sales_channel_id: salesChannelId,
      });

    await this.publishableapikeysaleschannelRepository.save(
      publishableApiKeySalesChannel
    );

    return savedApiKey.id;
  }
}

export default PublishableApiKeyService;
