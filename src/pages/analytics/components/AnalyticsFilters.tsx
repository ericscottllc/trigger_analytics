import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Building, Wheat } from 'lucide-react';
import { Input, Button } from '../../../components/Shared/SharedComponents';
import { supabase } from '../../../lib/supabase';
import type { AnalyticsFilters as AnalyticsFiltersType } from '../types/analyticsTypes';

interface AnalyticsFiltersProps {
  filters: AnalyticsFiltersType;
  onChange: (filters: AnalyticsFiltersType) => void;
}

interface FilterOption {
  id: string;
  name: string;
}

export const AnalyticsFilters: React.FC<AnalyticsFiltersProps> = ({
  filters,
  onChange
}) => {
  const [cropClasses, setCropClasses] = useState<FilterOption[]>([]);
  const [regions, setRegions] = useState<FilterOption[]>([]);
  const [elevators, setElevators] = useState<FilterOption[]>([]);
  const [towns, setTowns] = useState<FilterOption[]>([]);
  const [loading, setLoading] = useState(false);

  // Load filter options
  useEffect(() => {
    const loadFilterOptions = async () => {
      setLoading(true);
      try {
        // Load crop classes
        const { data: cropClassData } = await supabase
          .from('crop_classes')
          .select('id, name')
          .eq('is_active', true)
          .order('name');

        // Load regions
        const { data: regionData } = await supabase
          .from('master_regions')
          .select('id, name')
          .eq('is_active', true)
          .order('name');

        // Load elevators
        const { data: elevatorData } = await supabase
          .from('master_elevators')
          .select('id, name')
          .eq('is_active', true)
          .order('name');

        // Load towns
        const { data: townData } = await supabase
          .from('master_towns')
          .select('id, name')
          .eq('is_active', true)
          .order('name');

        setCropClasses(cropClassData || []);
        setRegions(regionData || []);
        setElevators(elevatorData || []);
        setTowns(townData || []);
      } catch (error) {
        console.error('Error loading filter options:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFilterOptions();
  }, []);

  const handleFilterChange = (key: keyof AnalyticsFiltersType, value: string) => {
    onChange({
      ...filters,
      [key]: value || undefined
    });
  };

  const clearFilters = () => {
    onChange({});
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
        >
          Clear All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Date Range */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            <Calendar className="w-4 h-4 inline mr-1" />
            Date From
          </label>
          <Input
            type="date"
            value={filters.date_from || ''}
            onChange={(e) => handleFilterChange('date_from', e.target.value)}
            size="sm"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            <Calendar className="w-4 h-4 inline mr-1" />
            Date To
          </label>
          <Input
            type="date"
            value={filters.date_to || ''}
            onChange={(e) => handleFilterChange('date_to', e.target.value)}
            size="sm"
          />
        </div>

        {/* Crop Class */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            <Wheat className="w-4 h-4 inline mr-1" />
            Crop Class
          </label>
          <select
            value={filters.crop_class_id || ''}
            onChange={(e) => handleFilterChange('crop_class_id', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-tg-primary focus:border-transparent"
            disabled={loading}
          >
            <option value="">All Crop Classes</option>
            {cropClasses.map((cropClass) => (
              <option key={cropClass.id} value={cropClass.id}>
                {cropClass.name}
              </option>
            ))}
          </select>
        </div>

        {/* Region */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            <MapPin className="w-4 h-4 inline mr-1" />
            Region
          </label>
          <select
            value={filters.region_id || ''}
            onChange={(e) => handleFilterChange('region_id', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-tg-primary focus:border-transparent"
            disabled={loading}
          >
            <option value="">All Regions</option>
            {regions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.name}
              </option>
            ))}
          </select>
        </div>

        {/* Elevator */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            <Building className="w-4 h-4 inline mr-1" />
            Elevator
          </label>
          <select
            value={filters.elevator_id || ''}
            onChange={(e) => handleFilterChange('elevator_id', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-tg-primary focus:border-transparent"
            disabled={loading}
          >
            <option value="">All Elevators</option>
            {elevators.map((elevator) => (
              <option key={elevator.id} value={elevator.id}>
                {elevator.name}
              </option>
            ))}
          </select>
        </div>

        {/* Town */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            <MapPin className="w-4 h-4 inline mr-1" />
            Town
          </label>
          <select
            value={filters.town_id || ''}
            onChange={(e) => handleFilterChange('town_id', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-tg-primary focus:border-transparent"
            disabled={loading}
          >
            <option value="">All Towns</option>
            {towns.map((town) => (
              <option key={town.id} value={town.id}>
                {town.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Filters Summary */}
      {Object.keys(filters).length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Active Filters:</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(filters).map(([key, value]) => {
              if (!value) return null;
              
              let displayValue = value;
              let displayKey = key.replace('_', ' ').replace('id', '');
              
              // Try to get display names for IDs
              if (key === 'crop_class_id') {
                const cropClass = cropClasses.find(c => c.id === value);
                displayValue = cropClass?.name || value;
                displayKey = 'Crop Class';
              } else if (key === 'region_id') {
                const region = regions.find(r => r.id === value);
                displayValue = region?.name || value;
                displayKey = 'Region';
              } else if (key === 'elevator_id') {
                const elevator = elevators.find(e => e.id === value);
                displayValue = elevator?.name || value;
                displayKey = 'Elevator';
              } else if (key === 'town_id') {
                const town = towns.find(t => t.id === value);
                displayValue = town?.name || value;
                displayKey = 'Town';
              }
              
              return (
                <span
                  key={key}
                  className="inline-flex items-center px-2 py-1 bg-tg-primary/10 text-tg-primary text-xs rounded-md"
                >
                  {displayKey}: {displayValue}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
};