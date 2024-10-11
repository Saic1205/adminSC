import { BeforeInsert, Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { SoftDeletableEntity } from "@medusajs/medusa";
import { generateEntityId } from "@medusajs/medusa/dist/utils";
import { Product } from "./product";
import { User } from "./user";
import { Address } from "./address"; 
import {Store} from "./store"; 
import { SalesChannel } from "./salesChannel"; 
import { Customer } from "./customer";
import { Order } from "./order";


export enum BusinessModel {
  ApparelDesign = "Apparel Design",
  GroceryStore = "GroceryStore",
  PaperDesignPrinting = "PaperDesignPrinting",
  FootballFranchise= "FootballFranchise",
  BaseballFranchise = "Baseball Franchise"
}

@Entity()
export class Vendor extends SoftDeletableEntity {
  @Column({ type: "varchar", length: 250, unique: true })
  company_name: string | null;

  @Column({ type: "varchar", length: 250 })
  contact_name: string | null;

  @Column({ type: "varchar", length: 250, nullable: true })
  registered_number: string | null;

  @Column({ type: "varchar", length: 120, nullable: false})
  contact_email: string | null;

  @Column({ type: "varchar", length: 20, nullable: false })
  contact_phone_number: string | null;

  @Column({ type: "varchar", length: 120, nullable: true })
  tax_number: string | null;

  @Column({type: "varchar", length: 256, nullable: true })
  password: string; 

  @Index("UserId")
  @Column({ type: "varchar", length: 120, nullable: true })
  user_id?: string;

  @Column({ type: "enum", enum: BusinessModel, default: BusinessModel.ApparelDesign })
  business_type: BusinessModel;


  @OneToMany(() => Address, (address) => address.address_of_vendor)
  vendorAddresses?: Address[];

  
  @OneToMany(() => Address, (address) => address.registrared_address_of_vendor)
  vendorRegistrationAddresses?: Address[];

  @OneToMany(() => User, (user) => user.vendor)
  users: User[];

  @OneToMany(() => Product, (product) => product?.vendor)
  products?: Product[];


  @OneToMany(() => Store, (store) => store.vendor)
  stores?: Store[]; 

  @OneToMany(() => SalesChannel, (salesChannel) => salesChannel.vendor)
  salesChannels?: SalesChannel[]; 

  @OneToMany(() => Customer, (customer) => customer?.vendor)  
  customers?: Customer[];

  @OneToMany(() => Order, (order) => order?.vendor)  
  orders?: Order[];

  @BeforeInsert()
  private beforeInsert(): void {
    this.id = generateEntityId(this.id, "vendor");
  }
}
