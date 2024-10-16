import { SalesChannel } from "@medusajs/medusa"
import { Store } from "../models/store"
import { 
  dataSource,
} from "@medusajs/medusa/dist/loaders/database"
import {
  SalesChannelRepository as MedusaSalesChannelRepository,
} from "@medusajs/medusa/dist/repositories/sales-channel"

export const SalesChannelRepository = dataSource
  .getRepository(SalesChannel)
  .extend({
    ...Object.assign(
        MedusaSalesChannelRepository, 
      { target: SalesChannel }
    ),
  })
  
export default SalesChannelRepository