import { Lifetime } from "awilix";
import {
    Order as MedusaOrder,
    OrderService as MedusaOrderService,
} from "@medusajs/medusa";
import OrderRepository from "@medusajs/medusa/dist/repositories/order";
import { DeepPartial, FindOptionsWhere } from "typeorm";

type Order = MedusaOrder & {
    vendor_id?: string;
    line_items: object;
    total_amount?: string;
    public_api_key?: string; // Include the public_api_key field
};

interface CreateOrderData {
    vendor_id?: string; // Make vendor_id optional
    line_items: object;
    total_amount?: string;
    public_api_key: string; // Add public_api_key to the order data
}

class OrderService extends MedusaOrderService {
    static readonly LIFE_TIME = Lifetime.SCOPED;
    protected readonly orderRepository_: typeof OrderRepository;

    constructor(container) {
        super(container);
        this.orderRepository_ = container.orderRepository;
    }

    async retrieveOrder(orderId: string): Promise<Order> {
        if (!orderId) {
            throw new Error("Order ID is required.");
        }

        const order = await this.orderRepository_.findOne({
            where: { id: orderId },
        }) as Order;  // Casting the result for type safety
        if (!order) {
            throw new Error("Order not found.");
        }

        return order;
    }

    async createOrder(orderData: CreateOrderData): Promise<Order> {
        if (!orderData.public_api_key) {
            throw new Error("Public API key is required to create an order.");
        }

        const order: DeepPartial<Order> = {
            ...orderData,
            // No status is included
        };

        const newOrder = this.orderRepository_.create(order);
        return await this.orderRepository_.save(newOrder) as Order;
    }

    async listOrdersByVendorId(vendorId: string): Promise<Order[]> {
        if (!vendorId) {
            throw new Error("vendorId is required to list orders.");
        }

        const whereClause: FindOptionsWhere<Order> = {
            vendor_id: vendorId, // Filter by public_api_key
        };

        return this.orderRepository_.find({ where: whereClause }) as Promise<Order[]>;
    }

    // async listOrdersByVendorAndPublicApiKey(vendorId?: string, publicApiKey: string): Promise<Order[]> {
    //     const whereClause: FindOptionsWhere<Order> = {
    //         public_api_key: publicApiKey, // Filter by public_api_key
    //     };

    //     // If vendorId is provided, add it to the whereClause
    //     if (vendorId) {
    //         whereClause.vendor_id = vendorId;
    //     }

    //     return this.orderRepository_.find({ where: whereClause }) as Promise<Order[]>;
    // }

    async deleteOrder(orderId: string): Promise<void> {
        if (!orderId) {
            throw new Error("Order ID is required to delete an order.");
        }

        const existingOrder = await this.orderRepository_.findOne({
            where: { id: orderId },
        });
        if (!existingOrder) {
            throw new Error(`Order with ID ${orderId} not found.`);
        }

        await this.orderRepository_.delete({ id: orderId });
    }
}

export default OrderService;
