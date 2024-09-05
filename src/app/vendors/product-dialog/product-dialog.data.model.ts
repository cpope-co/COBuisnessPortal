import { Product } from "../../models/product.model";

export type ProductDialogDataModel = {
    mode: 'view';
    title: string;
    product?: Product;
}