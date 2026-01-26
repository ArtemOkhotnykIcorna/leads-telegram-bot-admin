export interface Country {
  _id: string;
  name: string;
  flag: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCountryDto {
  name: string;
  slug: string;
  flag?: string;
  isActive?: boolean;
}

export interface UpdateCountryDto {
  name?: string;
  slug?: string;
  flag?: string;
  sortOrder?: number;
  isActive?: boolean;
}
