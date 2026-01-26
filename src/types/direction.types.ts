export interface Direction {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  countryId: string;
  country?: {
    _id: string;
    name: string;
    slug: string;
    flag: string;
  };
  isActive: boolean;
  requiresSubscription: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDirectionDto {
  name: string;
  slug: string;
  description?: string;
  countryId: string;
  isActive?: boolean;
  requiresSubscription?: boolean;
}

export interface UpdateDirectionDto {
  name?: string;
  slug?: string;
  description?: string;
  countryId?: string;
  isActive?: boolean;
  requiresSubscription?: boolean;
}
