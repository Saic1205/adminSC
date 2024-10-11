import { Lifetime } from "awilix";
import { StoreService as MedusaStoreService, Store as MedusaStore, FindConfig } from "@medusajs/medusa";
import StoreRepository from "@medusajs/medusa/dist/repositories/store";
import { FindOptionsWhere } from "typeorm";

type Store = MedusaStore & {
  vendor_id?: string;
  default_sales_channel_id?: string;
};

interface StoreData {
  vendor_id: string;
  default_sales_channel_id: string; 
  name: string; 
}

class StoreService extends MedusaStoreService {
  static readonly LIFE_TIME = Lifetime.SCOPED;
  protected readonly storeRepository_: typeof StoreRepository;

  constructor(container) {
    super(container);
    this.storeRepository_ = container.storeRepository;
  }

  async createStore(storeData: StoreData): Promise<Store> {
    if (!storeData.vendor_id) {
      throw new Error("Vendor ID is required to create a store.");
    }
    if (!storeData.default_sales_channel_id) {
      throw new Error("Default sales channel ID is required to create a store.");
    }

    const store = this.storeRepository_.create(storeData);
    return await this.storeRepository_.save(store);
  }
  async listStoresByVendor(vendorId: string | null): Promise<Store[]> {
    const whereClause: FindOptionsWhere<Store> = {};

  if (vendorId !== null) {
    whereClause.vendor_id = vendorId;

    // Check if any store exists for the vendorId
    const store = await this.storeRepository_.findOne({
      where: whereClause,
    });
    
    if (!store) {
      throw new Error(`No Stores are found for vendor ID: ${vendorId}`);
    }
  }

  // Return stores matching the vendorId
  return this.storeRepository_.find({ where: whereClause });
  } 

//   async retrieve(config: FindConfig<Store>): Promise<Store> {
//     const store = await this.storeRepository_.findOne({ where: { id: config.id } });

//     if (!store) {
//         throw new Error("Store not found.");
//     }

//     return store;
// }

}

export default StoreService;
