export interface Country {
  _id: string;
  name: string;
  code: string;
  flag: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCountryDto {
  name: string;
  code: string;
  flag?: string;
  order?: number;
  isActive?: boolean;
}

export interface UpdateCountryDto {
  name?: string;
  code?: string;
  flag?: string;
  order?: number;
  isActive?: boolean;
}
