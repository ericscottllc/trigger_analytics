import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { LineChart, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card } from '../../../components/Shared/SharedComponents';
import { LineChartComponent } from './charts/LineChartComponent';
import type { GrainEntry, AnalyticsFilters } from '../types/analyticsTypes';
import { CheckCircle } from 'lucide-react';

interface BasisTrendReportProps {
  data: GrainEntry[];
  filters: AnalyticsFilters;
  lastFetched?: string | null;
  totalRecords?: number;
}

export const BasisTrendReport: React.FC<BasisTrendReportProps> = ({ 
  data,
  filters,
  lastFetched,
  totalRecords = 0
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

  // Calculate elevator-specific statistics
  const elevatorStats = useMemo(() => {
    if (!data.length) return [];

    // Group data by elevator
    const elevatorData = data.reduce((acc, entry) => {
      if (entry.basis !== null && entry.basis !== undefined) {
        if (!acc[entry.elevator_name]) {
          acc[entry.elevator_name] = [];
        }
        acc[entry.elevator_name].push(entry.basis);
      }
      return acc;
    }, {} as Record<string, number[]>);

    // Calculate stats for each elevator
    return Object.entries(elevatorData)
      .map(([elevatorName, basisValues]) => {
        const avg = basisValues.reduce((sum, val) => sum + val, 0) / basisValues.length;
        const min = Math.min(...basisValues);
        const max = Math.max(...basisValues);
        
        return {
          name: elevatorName,
          average: Number(avg.toFixed(2)),
          minimum: Number(min.toFixed(2)),
          maximum: Number(max.toFixed(2)),
          count: basisValues.length
        };
      })
      .sort((a, b) => b.average - a.average) // Sort by average descending
      .slice(0, 3); // Show top 3 elevators
  }, [data]);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Average Basis</p>
                  <p className="text-lg font-bold text-gray-800">
                    ${statistics.average}
                  </p>
                </div>
                <div className="w-8 h-8 bg-tg-primary/10 rounded-lg flex items-center justify-center">
                  <LineChart className="w-4 h-4 text-tg-primary" />
                </div>
              </div>
              {elevatorStats.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-medium">By Elevator:</p>
                  {elevatorStats.map((elevator, index) => (
                    <div key={elevator.name} className="flex justify-between text-xs">
                      <span className="text-gray-600 truncate max-w-[100px]" title={elevator.name}>
                        {elevator.name}
                      </span>
                      <span className="text-gray-800 font-medium">
                        ${elevator.average}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Minimum Basis</p>
                  <p className="text-lg font-bold text-gray-800">
                    ${statistics.minimum}
                  </p>
                </div>
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <TrendingDown className="w-4 h-4 text-red-600" />
                </div>
              </div>
              {elevatorStats.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-medium">By Elevator:</p>
                  {elevatorStats.map((elevator, index) => (
                    <div key={elevator.name} className="flex justify-between text-xs">
                      <span className="text-gray-600 truncate max-w-[100px]" title={elevator.name}>
                        {elevator.name}
                      </span>
                      <span className="text-gray-800 font-medium">
                        ${elevator.minimum}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Maximum Basis</p>
                  <p className="text-lg font-bold text-gray-800">
                    ${statistics.maximum}
                  </p>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
              </div>
              {elevatorStats.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-medium">By Elevator:</p>
                  {elevatorStats.map((elevator, index) => (
                    <div key={elevator.name} className="flex justify-between text-xs">
                      <span className="text-gray-600 truncate max-w-[100px]" title={elevator.name}>
                        {elevator.name}
                      </span>
                      <span className="text-gray-800 font-medium">
                        ${elevator.maximum}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Trend</p>
                  <p className="text-lg font-bold text-gray-800 capitalize">
                    {statistics.trend}
                  </p>
                </div>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  statistics.trend === 'up' ? 'bg-green-100' :
                  statistics.trend === 'down' ? 'bg-red-100' : 'bg-gray-100'
                }`}>
                  {statistics.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : statistics.trend === 'down' ? (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  ) : (
                    <Minus className="w-4 h-4 text-gray-600" />
                  )}
                </div>
              </div>
              {elevatorStats.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-medium">Top Elevators:</p>
                  {elevatorStats.map((elevator, index) => (
                    <div key={elevator.name} className="flex justify-between text-xs">
                      <span className="text-gray-600 truncate max-w-[100px]" title={elevator.name}>
                        {elevator.name}
                      </span>
                      <span className="text-gray-800 font-medium">
                        {elevator.count} entries
                      </span>
                    </div>
                  ))}
                </div>
              )}
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
      {chartData.length > 0 && (
        <div className="flex justify-end">
          <div 
            className="group relative bg-white border border-gray-200 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md overflow-hidden"
          >
            {/* Collapsed State */}
            <div className="px-3 py-2 group-hover:hidden">
              <div className="text-xs text-gray-500">Data Summary</div>
            </div>
            
            {/* Expanded State */}
            <div className="hidden group-hover:block px-3 py-2">
              <div className="text-xs text-gray-600 space-y-1 whitespace-nowrap">
                {lastFetched && (
                  <>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-green-600" />
                      <span>Loaded: {new Date(lastFetched).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })} {new Date(lastFetched).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div>{totalRecords} total • {data.length} filtered</div>
                  </>
                )}
                <div>Record count: {data.length}</div>
                <div>Start Date: {new Date(chartData[0].date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })}</div>
                <div>End Date: {new Date(chartData[chartData.length - 1].date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })}</div>
                <div>Unique Dates: {chartData.length}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};