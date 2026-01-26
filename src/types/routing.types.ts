export interface RoutingConditions {
  countries?: string[];
  directions?: string[];
  sources?: string[];
}

export interface RoutingRule {
  _id: string;
  name: string;
  description?: string;
  sourceId?: string;
  countryId?: string;
  directionId?: string;
  groupId?: string;
  targetGroups?: string[];
  priority: number;
  conditions?: RoutingConditions;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  // Populated fields
  source?: {
    _id: string;
    name: string;
  };
  country?: {
    _id: string;
    name: string;
    code: string;
  };
  direction?: {
    _id: string;
    name: string;
  };
  group?: {
    _id: string;
    name: string;
  };
}

export interface RoutingCondition {
  field: string;
  operator: "equals" | "contains" | "startsWith" | "endsWith" | "regex";
  value: string;
}

export interface CreateRoutingDto {
  name: string;
  description?: string;
  sourceId?: string;
  countryId?: string;
  directionId?: string;
  groupId?: string;
  targetGroups?: string[];
  priority?: number;
  conditions?: RoutingConditions;
  isActive?: boolean;
}

export interface UpdateRoutingDto {
  name?: string;
  description?: string;
  sourceId?: string;
  countryId?: string;
  directionId?: string;
  groupId?: string;
  targetGroups?: string[];
  priority?: number;
  conditions?: RoutingConditions;
  isActive?: boolean;
}
