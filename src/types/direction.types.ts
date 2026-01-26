export interface Direction {
  _id: string;
  name: string;
  description?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDirectionDto {
  name: string;
  description?: string;
  order?: number;
  isActive?: boolean;
}

export interface UpdateDirectionDto {
  name?: string;
  description?: string;
  order?: number;
  isActive?: boolean;
}
