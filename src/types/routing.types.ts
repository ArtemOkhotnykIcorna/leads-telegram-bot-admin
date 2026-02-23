export type DistributionMode = "all" | "round_robin";

export interface RoutingConditions {
  countries?: string[];
  directions?: string[];
  sources?: string[];
}

export interface RoutingRule {
  _id: string;
  name: string;
  description?: string;
  conditions: RoutingConditions;
  targetGroupIds: string[];
  distributionMode: DistributionMode;
  roundRobinIndex: number;
  priority: number;
  isActive: boolean;
  leadsRouted: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoutingDto {
  name: string;
  description?: string;
  conditions?: RoutingConditions;
  targetGroupIds: string[];
  distributionMode?: DistributionMode;
  priority?: number;
  isActive?: boolean;
}

export interface UpdateRoutingDto {
  name?: string;
  description?: string;
  conditions?: RoutingConditions;
  targetGroupIds?: string[];
  distributionMode?: DistributionMode;
  priority?: number;
  isActive?: boolean;
}
