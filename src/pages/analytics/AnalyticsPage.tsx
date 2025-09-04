import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  BarChart3, 
  LineChart, 
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Button, Card } from '../../components/Shared/SharedComponents';
import { BasisTrendReport } from './components/BasisTrendReport';
import { PriceTrendReport } from './components/PriceTrendReport';
import { AnalyticsFilters } from './components/AnalyticsFilters';
import { useAnalyticsData } from './hooks/useAnalyticsData';
import type { AnalyticsFilters as AnalyticsFiltersType } from './types/analyticsTypes';

export type AnalyticsTab = 'price_trend' | 'basis_trend';

interface AnalyticsTabConfig {
  id: AnalyticsTab;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  component: React.ComponentType<{ data: any[]; filters: AnalyticsFiltersType }>;
}

const analyticsTabs: AnalyticsTabConfig[] = [
  {
    id: 'basis_trend',
    title: 'Basis Trends',
    icon: LineChart,
    description: 'Track basis trends by crop class and region over time',
    component: BasisTrendReport
  },
  {
    id: 'price_trend',
    title: 'Price Trends',
    icon: TrendingUp,
    description: 'Monitor cash price trends by crop class and region',
    component: PriceTrendReport
  }
];

export const AnalyticsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('basis_trend');
  const [filters, setFilters] = useState<AnalyticsFiltersType>({
    crop_class_code: 'CWRS' // Default to CWRS
  });
  
  const { 
    masterData,
    loading, 
    error, 
    lastFetched,
    fetchMasterData,
    totalRecords
  } = useAnalyticsData();

  const activeTabConfig = analyticsTabs.find(tab => tab.id === activeTab);
  const ActiveComponent = activeTabConfig?.component || (() => null);

  const handleFetchData = () => {
    fetchMasterData();
  };

  const handleFiltersChange = (newFilters: AnalyticsFiltersType) => {
    setFilters(newFilters);
  };

  // Filter master data based on current filters
  const filteredData = React.useMemo(() => {
    if (!masterData.length) return [];
    
    return masterData.filter(entry => {
      // Filter by crop class code
      if (filters.crop_class_code && entry.class_code !== filters.crop_class_code) {
        return false;
      }
      
      // Filter by region
      if (filters.region_id && entry.region_id !== filters.region_id) {
        return false;
      }
      
      // Filter by elevator
      if (filters.elevator_id && entry.elevator_id !== filters.elevator_id) {
        return false;
      }
      
      // Filter by town
      if (filters.town_id && entry.town_id !== filters.town_id) {
        return false;
      }
      
      // Filter by date range
      if (filters.date_from && entry.date < filters.date_from) {
        return false;
      }
      
      if (filters.date_to && entry.date > filters.date_to) {
        return false;
      }
      
      return true;
    });
  }, [masterData, filters]);

  return (
    <div className="flex-1 bg-gray-50 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-tg-primary rounded-xl flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h1>
                <p className="text-sm text-gray-500">Comprehensive grain market analysis and trends</p>
              </div>
            </div>

            <div className="flex items-center gap-3">              
              <Button
                variant="primary"
                size="sm"
                icon={RefreshCw}
                loading={loading}
                onClick={handleFetchData}
              >
                Load Master Data
              </Button>
            </div>
          </div>

          {/* Data Status */}
          {/* Tab Navigation */}
          {/* Two Column Layout: Tabs and Filters */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left Column: Tab Navigation */}
            <div>
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg overflow-x-auto">
                {analyticsTabs.map((tab, index) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <motion.button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                        isActive
                          ? 'bg-white text-tg-primary shadow-sm'
                          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                      }`}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.title}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Filters */}
            <div>
              <AnalyticsFilters
                filters={filters}
                onChange={handleFiltersChange}
                masterData={masterData}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        {error && (
          <div className="max-w-7xl mx-auto px-6 py-4">
            <Card className="p-4 border-red-200 bg-red-50">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                <div>
                  <h3 className="font-semibold">Error Loading Data</h3>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {!masterData.length && !loading && !error && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Data Loaded</h3>
              <p className="text-gray-500 mb-4">Click "Load Master Data" to load analytics information</p>
              <Button
                variant="primary"
                icon={RefreshCw}
                onClick={handleFetchData}
              >
                Load Master Data
              </Button>
            </div>
          </div>
        )}

        {(masterData.length > 0 || loading) && (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            <ActiveComponent 
              data={filteredData}
              filters={filters}
              lastFetched={lastFetched}
              totalRecords={totalRecords}
            />
          </motion.div>
        )}

      </div>
    </div>
  );
};