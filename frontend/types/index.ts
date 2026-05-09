export type UserRole = "user" | "admin";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
}

export interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category: Category | string;
  images: string[];
  brand?: string;
  createdAt?: string;
}

export interface CartItem {
  product: Product | string;
  quantity: number;
  _id?: string;
}

export interface Cart {
  _id?: string;
  user?: string;
  items: CartItem[];
}

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  product: Product | string;
  quantity: number;
  price: number;
  _id?: string;
}

export interface Order {
  _id: string;
  user: User | string;
  items: OrderItem[];
  totalPrice: number;
  status: OrderStatus;
  createdAt?: string;
}

/** JWT payload from backend */
export interface JwtUser {
  id: string;
  role: UserRole;
}

export interface ApiErrorBody {
  success: false;
  message: string;
  error?: string;
}

export interface ProductsListResponse {
  success: boolean;
  count: number;
  products: Product[];
}

export interface ProductResponse {
  success: boolean;
  product: Product;
}

export interface CategoriesListResponse {
  success: boolean;
  categories?: Category[];
  count?: number;
}

export interface CategoryResponse {
  success: boolean;
  category: Category;
}

export interface CartResponse {
  success: boolean;
  cart: Cart;
  message?: string;
}

export interface OrdersListResponse {
  success: boolean;
  count: number;
  orders: Order[];
}

export interface OrderResponse {
  success: boolean;
  order: Order;
  message?: string;
}

export interface AuthLoginResponse {
  success: boolean;
  message: string;
  token?: string;
}

export interface AdminLoginResponse extends AuthLoginResponse {
  admin?: Pick<User, "_id" | "name" | "email" | "role"> & { _id: string };
}

export interface SignupResponse {
  success: boolean;
  message: string;
  user?: User;
}

export interface DecreaseStockResponse {
  success: boolean;
  message: string;
  stock: number;
}

export interface UsersListResponse {
  success: boolean;
  count?: number;
  users: User[];
}

export interface UserResponse {
  success: boolean;
  user: User;
}
