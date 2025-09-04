import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { LineChart, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card } from '../../../components/Shared/SharedComponents';
import { LineChartComponent } from './charts/LineChartComponent';
import type { GrainEntry, AnalyticsFilters } from '../types/analyticsTypes';

interface BasisTrendReportProps {
  data: GrainEntry[];
  filters: AnalyticsFilters;
}

export const BasisTrendReport: React.FC<BasisTrendReportProps> = ({ 
  data,
  filters
}) => {
  const chartData = useMemo(() => {
    if (!data.length) return [];

    // Group data by date and calculate averages
    const groupedData = data.reduce((acc, entry) => {
      const date = entry.date;
      if (!acc[date]) {
        acc[date] = {
          date,
          entries: [],
          totalBasis: 0,
          count: 0
        };
      }
      
      if (entry.basis !== null && entry.basis !== undefined) {
        acc[date].entries.push(entry);
        acc[date].totalBasis += entry.basis;
        acc[date].count += 1;
      }
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(groupedData)
      .filter((group: any) => group.count > 0)
      .map((group: any) => ({
        date: group.date,
        basis: Number((group.totalBasis / group.count).toFixed(2)),
        count: group.count
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data]);

  const statistics = useMemo(() => {
    if (!chartData.length) return null;

    const basisValues = chartData.map(d => d.basis);
    const avgBasis = basisValues.reduce((sum, val) => sum + val, 0) / basisValues.length;
    const minBasis = Math.min(...basisValues);
    const maxBasis = Math.max(...basisValues);
    
    // Calculate trend (simple linear regression slope)
    const n = chartData.length;
    const sumX = chartData.reduce((sum, _, i) => sum + i, 0);
    const sumY = basisValues.reduce((sum, val) => sum + val, 0);
    const sumXY = chartData.reduce((sum, d, i) => sum + (i * d.basis), 0);
    const sumXX = chartData.reduce((sum, _, i) => sum + (i * i), 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    
    return {
      average: Number(avgBasis.toFixed(2)),
      minimum: Number(minBasis.toFixed(2)),
      maximum: Number(maxBasis.toFixed(2)),
      trend: slope > 0.01 ? 'up' : slope < -0.01 ? 'down' : 'stable',
      trendValue: Number(slope.toFixed(4))
    };
  }, [chartData]);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Average Basis</p>
                  <p className="text-2xl font-bold text-gray-800">
                    ${statistics.average}
                  </p>
                </div>
                <div className="w-10 h-10 bg-tg-primary/10 rounded-lg flex items-center justify-center">
                  <LineChart className="w-5 h-5 text-tg-primary" />
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Minimum Basis</p>
                  <p className="text-2xl font-bold text-gray-800">
                    ${statistics.minimum}
                  </p>
                </div>
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Maximum Basis</p>
                  <p className="text-2xl font-bold text-gray-800">
                    ${statistics.maximum}
                  </p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Trend</p>
                  <p className="text-2xl font-bold text-gray-800 capitalize">
                    {statistics.trend}
                  </p>
                </div>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  statistics.trend === 'up' ? 'bg-green-100' :
                  statistics.trend === 'down' ? 'bg-red-100' : 'bg-gray-100'
                }`}>
                  {statistics.trend === 'up' ? (
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  ) : statistics.trend === 'down' ? (
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  ) : (
                    <Minus className="w-5 h-5 text-gray-600" />
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Basis Trend Over Time</h3>
            <p className="text-sm text-gray-600">
              Daily average basis values ({chartData.length} data points)
            </p>
          </div>
          
          <div className="h-96">
            <LineChartComponent
              data={chartData}
              xKey="date"
              yKey="basis"
              color="#acdfeb"
              yAxisLabel="Basis ($)"
              formatTooltip={(value, date) => `Date: ${date}\nBasis: $${value}`}
            />
          </div>
        </Card>
      </motion.div>

      {/* Data Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Data Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Total Records</p>
              <p className="font-semibold text-gray-800">{data.length}</p>
            </div>
            <div>
              <p className="text-gray-600">Date Range</p>
              <p className="font-semibold text-gray-800">
                {chartData.length > 0 ? 
                  `${chartData[0].date} to ${chartData[chartData.length - 1].date}` : 
                  'No data'
                }
              </p>
            </div>
            <div>
              <p className="text-gray-600">Unique Dates</p>
              <p className="font-semibold text-gray-800">{chartData.length}</p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};