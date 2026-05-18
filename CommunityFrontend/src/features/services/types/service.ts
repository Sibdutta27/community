export type ServiceCategoryApiItem = Readonly<{
  createdAt?: string;
  icon: string;
  id: string;
  key: string;
  name: string;
}>;

export type ServiceApiItem = Readonly<{
  actionLabel: string | null;
  actionRoute: string | null;
  actionType: "EXTERNAL" | "INTERNAL" | null;
  actionUrl: string | null;
  category: ServiceCategoryApiItem | null;
  categoryId: string;
  createdAt: string;
  description: string;
  email: string | null;
  highlights: string[];
  icon: string;
  id: string;
  isFeatured: boolean;
  location: string | null;
  name: string;
  phone: string | null;
  status: "ACTIVE" | "INACTIVE" | "CLOSED";
  updatedAt: string;
}>;

export type ServiceRegisterRequest = Readonly<{
  serviceId: string;
}>;

export type ServiceRegisterResponse = Readonly<{
  message: string;
  success: boolean;
}>;

export type ServiceRegistrationApiItem = Readonly<{
  date: string;
  id: string;
  service: ServiceApiItem;
  serviceId: string;
  status: string;
  userId: string;
}>;
