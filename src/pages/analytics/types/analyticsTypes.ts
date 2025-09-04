export interface GrainEntry {
  id: string;
  date: string;
  crop_id: string | null;
  elevator_id: string;
  town_id: string;
  class_id: string | null;
  cash_price: number | null;
  futures: number | null;
  basis: number | null;
  notes: string | null;
  crop_name: string | null;
  class_name: string | null;
  class_code: string | null;
  elevator_name: string;
  town_name: string;
  region_id: string | null;
  region_name: string | null;
}

export interface AnalyticsFilters {
  crop_class_code?: string;
  region_id?: string;
  elevator_id?: string;
  town_id?: string;
  date_from?: string;
  date_to?: string;
}

export type ReportType = 'basis_trend' | 'price_trend';

export interface ChartDataPoint {
  date: string;
  value: number;
  [key: string]: any;
}

export interface StatisticsSummary {
  average: number;
  minimum: number;
  maximum: number;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
}