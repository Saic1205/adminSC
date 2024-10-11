import { Lifetime } from "awilix";
import {
    TransactionBaseService,
    Customer as MedusaCustomer
} from "@medusajs/medusa";
import { EntityManager } from "typeorm";
import { CreateCustomerInput as MedusaCreateCustomerInput, UpdateCustomerInput } from "@medusajs/medusa/dist/types/customers";

type Customer = MedusaCustomer & {
    vendor_id?: string;
};

type CreateCustomerInput = {
    vendor_id?: string; 
} & MedusaCreateCustomerInput;

class CustomerService extends TransactionBaseService {
    static LIFE_TIME = Lifetime.SCOPED;
    protected manager_: EntityManager;
    private readonly customerRepository: any;

    public runAtomicPhase<T>(callback: (manager: EntityManager) => Promise<T>): Promise<T> {
        return this.atomicPhase_(callback);
    }

    constructor(container) {
        super(container);

        try {
            this.customerRepository = container.customerRepository;
        } catch (e) {
            console.error("Error initializing CustomerService:", e);
        }
    }

    async create(customerObject: CreateCustomerInput): Promise<Customer> {
        // Check if the customer already exists
        const existingCustomer = await this.checkCustomerExists(customerObject);

        if (existingCustomer) {
            throw new Error(`Customer with the given details already exists.`);
        }

        // Create a new customer with the provided data
        const newCustomer = this.customerRepository.create({
            email: customerObject.email,
            password_hash: customerObject.password_hash, // Ensure password is hashed before passing
            first_name: customerObject.first_name,
            last_name: customerObject.last_name,
            phone: customerObject.phone,
            vendor_id: customerObject.vendor_id, 
        });

        return await this.customerRepository.save(newCustomer);
    }

    async checkCustomerExists({ email }: { email: string }) {
        const customer = await this.customerRepository.findOne({
            where: { email },
            select: ['id', 'email', 'password_hash', 'first_name', 'last_name'],
        });

        return customer;
    }

    async update(customerId: string, update: UpdateCustomerInput): Promise<Customer> {
        if (!customerId) {
            throw new Error("Customer ID is required to update a customer");
        }

        const existingCustomer = await this.customerRepository.findOne({ where: { id: customerId } });

        if (!existingCustomer) {
            throw new Error(`Customer with ID ${customerId} not found`);
        }

        const updatedCustomer = this.customerRepository.merge(existingCustomer, update);
        return await this.customerRepository.save(updatedCustomer);
    }

    async delete(customerId: string): Promise<void> {
        if (!customerId) {
            throw new Error("Customer ID is required to delete a customer");
        }

        const existingCustomer = await this.customerRepository.findOne({ where: { id: customerId } });

        if (!existingCustomer) {
            throw new Error(`Customer with ID ${customerId} not found`);
        }

        await this.customerRepository.delete({ id: customerId });
    }
}

export default CustomerService;
