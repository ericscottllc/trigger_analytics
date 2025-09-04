import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  BarChart3, 
  LineChart, 
  Filter,
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
import type { AnalyticsFilters as AnalyticsFiltersType, ReportType } from './types/analyticsTypes';

export type AnalyticsTab = 'basis_trend' | 'price_trend';

interface AnalyticsTabConfig {
  id: AnalyticsTab;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  component: React.ComponentType<{ data: any[]; loading: boolean; error: string | null }>;
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
  const [filters, setFilters] = useState<AnalyticsFiltersType>({});
  const [showFilters, setShowFilters] = useState(false);
  
  const { 
    data, 
    loading, 
    error, 
    lastFetched,
    fetchData 
  } = useAnalyticsData();

  const activeTabConfig = analyticsTabs.find(tab => tab.id === activeTab);
  const ActiveComponent = activeTabConfig?.component || (() => null);

  const handleFetchData = () => {
    fetchData(activeTab as ReportType, filters);
  };

  const handleFiltersChange = (newFilters: AnalyticsFiltersType) => {
    setFilters(newFilters);
  };

  const currentData = data[activeTab] || [];
  const currentLoading = loading[activeTab] || false;
  const currentError = error[activeTab] || null;

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
                variant="outline"
                size="sm"
                icon={Filter}
                onClick={() => setShowFilters(!showFilters)}
              >
                Filters
              </Button>
              
              <Button
                variant="primary"
                size="sm"
                icon={RefreshCw}
                loading={currentLoading}
                onClick={handleFetchData}
              >
                Fetch Data
              </Button>
            </div>
          </div>

          {/* Data Status */}
          {lastFetched[activeTab] && (
            <div className="mb-4 flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-gray-600">
                Data last fetched: {new Date(lastFetched[activeTab]!).toLocaleString()}
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600">
                {currentData.length} records loaded
              </span>
            </div>
          )}

          {/* Filters Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <Card className="p-4">
                <AnalyticsFilters
                  filters={filters}
                  onChange={handleFiltersChange}
                />
              </Card>
            </motion.div>
          )}

          {/* Tab Navigation */}
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
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        {currentError && (
          <div className="max-w-7xl mx-auto px-6 py-4">
            <Card className="p-4 border-red-200 bg-red-50">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                <div>
                  <h3 className="font-semibold">Error Loading Data</h3>
                  <p className="text-sm">{currentError}</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {!currentData.length && !currentLoading && !currentError && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Data Loaded</h3>
              <p className="text-gray-500 mb-4">Click "Fetch Data" to load analytics information</p>
              <Button
                variant="primary"
                icon={RefreshCw}
                onClick={handleFetchData}
              >
                Fetch Data
              </Button>
            </div>
          </div>
        )}

        {(currentData.length > 0 || currentLoading) && (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            <ActiveComponent 
              data={currentData} 
              loading={currentLoading} 
              error={currentError} 
            />
          </motion.div>
        )}
      </div>
    </div>
  );
};