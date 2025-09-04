import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card } from '../../../components/Shared/SharedComponents';
import { LineChartComponent } from './charts/LineChartComponent';
import type { GrainEntry } from '../types/analyticsTypes';

interface PriceTrendReportProps {
  data: GrainEntry[];
  loading: boolean;
  error: string | null;
}

export const PriceTrendReport: React.FC<PriceTrendReportProps> = ({ 
  data, 
  loading, 
  error 
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
          totalCashPrice: 0,
          totalFutures: 0,
          cashCount: 0,
          futuresCount: 0
        };
      }
      
      if (entry.cash_price !== null && entry.cash_price !== undefined) {
        acc[date].entries.push(entry);
        acc[date].totalCashPrice += entry.cash_price;
        acc[date].cashCount += 1;
      }
      
      if (entry.futures !== null && entry.futures !== undefined) {
        acc[date].totalFutures += entry.futures;
        acc[date].futuresCount += 1;
      }
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(groupedData)
      .filter((group: any) => group.cashCount > 0)
      .map((group: any) => ({
        date: group.date,
        cash_price: Number((group.totalCashPrice / group.cashCount).toFixed(2)),
        futures: group.futuresCount > 0 ? Number((group.totalFutures / group.futuresCount).toFixed(2)) : null,
        count: group.cashCount
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data]);

  const statistics = useMemo(() => {
    if (!chartData.length) return null;

    const cashPrices = chartData.map(d => d.cash_price);
    const avgCashPrice = cashPrices.reduce((sum, val) => sum + val, 0) / cashPrices.length;
    const minCashPrice = Math.min(...cashPrices);
    const maxCashPrice = Math.max(...cashPrices);
    
    // Calculate trend (simple linear regression slope)
    const n = chartData.length;
    const sumX = chartData.reduce((sum, _, i) => sum + i, 0);
    const sumY = cashPrices.reduce((sum, val) => sum + val, 0);
    const sumXY = chartData.reduce((sum, d, i) => sum + (i * d.cash_price), 0);
    const sumXX = chartData.reduce((sum, _, i) => sum + (i * i), 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    
    return {
      average: Number(avgCashPrice.toFixed(2)),
      minimum: Number(minCashPrice.toFixed(2)),
      maximum: Number(maxCashPrice.toFixed(2)),
      trend: slope > 0.01 ? 'up' : slope < -0.01 ? 'down' : 'stable',
      trendValue: Number(slope.toFixed(4))
    };
  }, [chartData]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-24 rounded-xl"></div>
            ))}
          </div>
          <div className="bg-gray-200 h-96 rounded-xl"></div>
        </div>
      </div>
    );
  }

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
                  <p className="text-sm text-gray-600">Average Price</p>
                  <p className="text-2xl font-bold text-gray-800">
                    ${statistics.average}
                  </p>
                </div>
                <div className="w-10 h-10 bg-tg-green/10 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-tg-green" />
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
                  <p className="text-sm text-gray-600">Minimum Price</p>
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
                  <p className="text-sm text-gray-600">Maximum Price</p>
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
            <h3 className="text-lg font-semibold text-gray-800">Cash Price Trend Over Time</h3>
            <p className="text-sm text-gray-600">
              Daily average cash prices ({chartData.length} data points)
            </p>
          </div>
          
          <div className="h-96">
            <LineChartComponent
              data={chartData}
              xKey="date"
              yKey="cash_price"
              color="#b7e1cd"
              yAxisLabel="Cash Price ($)"
              formatTooltip={(value, date) => `Date: ${date}\nCash Price: $${value}`}
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