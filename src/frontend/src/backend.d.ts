import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Cents = bigint;
export interface Product {
    id: string;
    name: string;
    emoji: string;
    category: Category;
    price: Cents;
}
export enum Category {
    chips = "chips",
    drink = "drink",
    energy = "energy"
}
export interface backendInterface {
    getAllProducts(): Promise<Array<Product>>;
    getProduct(id: string): Promise<Product>;
    getProductsByCategory(category: Category): Promise<Array<Product>>;
}
