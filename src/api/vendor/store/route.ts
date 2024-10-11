import { MedusaRequest, MedusaResponse } from "@medusajs/medusa";
import StoreService from "../../../services/store";

interface StoreData {
  name: string;
  default_sales_channel_id: string;
  vendor_id: string; 
  default_currency_code?: string; 
  swap_link_template?: string;
  payment_link_template?: string;
  invite_link_template?: string;
  default_location_id?: string;
  metadata?: Record<string, unknown>;
}

// Function to get the StoreService from the request context
const getStoreService = (req: MedusaRequest): StoreService | null => {
  try {
    return req.scope.resolve("storeService") as StoreService;
  } catch (error) {
    console.error("Failed to resolve storeService:", error);
    return null;
  }
};

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> => {
  try {
    const storeService = getStoreService(req);
    if (!storeService) {
      console.error("Store service could not be resolved.");
      res.status(500).json({ error: "Store service could not be resolved." });
      return;
    }


    // Assuming vendor_id comes from the logged-in session or token
    const vendor_id = req.query.vendor_id as string;

    // Validate vendor ID
    if (!vendor_id) {
      console.error("Vendor ID is missing in request.");
      res.status(400).json({ error: "Vendor ID is required." });
      return;
    }

    // Fetch all stores associated with the vendor
    const stores = await storeService.listStoresByVendor(vendor_id);

    if (!stores || stores.length === 0) {
      console.log(`No stores found for vendor ID: ${vendor_id}`);
      res.status(404).json({ error: "No stores found for this vendor." });
      return;
    }

    // Return the list of stores
    res.status(200).json(stores);
  } catch (error) {
    console.error("Error in GET /stores:", error);
    res.status(500).json({ error: error.message || "An unknown error occurred." });
  }
};

// Main POST function for creating a store
export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> => {
  try {
    console.log("Request body:", req.body);

    const storeService = getStoreService(req);
    if (!storeService) {
      console.error("Store service could not be resolved.");
      res.status(500).json({ error: "Store service could not be resolved." });
      return;
    }

    const { vendor_id, default_sales_channel_id, name } = req.body as StoreData; 

    // Validate required fields
    if (!vendor_id) {
      console.error("Vendor ID is missing in request body.");
      res.status(400).json({ error: "Vendor ID is required." });
      return;
    }
    if (!default_sales_channel_id) {
      console.error("Default sales channel ID is missing in request body.");
      res.status(400).json({ error: "Default sales channel ID is required." });
      return;
    }
    if (!name) {
      console.error("Store name is missing in request body.");
      res.status(400).json({ error: "Store name is required." });
      return;
    }

    const newStoreData: Partial<StoreData> = req.body;
    const storeDataWithVendor = {
      ...newStoreData,
      vendor_id,
      default_sales_channel_id,
    };

    const newStore = await storeService.createStore(storeDataWithVendor as any);

    res.status(201).json(newStore);
  } catch (error) {
    console.error("Error in POST /stores:", error);
    res.status(500).json({ error: error.message || "An unknown error occurred." });
  }
};
