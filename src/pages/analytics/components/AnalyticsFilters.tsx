import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Building, Search } from 'lucide-react';
import { Input, Button } from '../../../components/Shared/SharedComponents';
import type { AnalyticsFilters as AnalyticsFiltersType, GrainEntry } from '../types/analyticsTypes';

interface AnalyticsFiltersProps {
  filters: AnalyticsFiltersType;
  onChange: (filters: AnalyticsFiltersType) => void;
  masterData: GrainEntry[];
}

interface FilterOption {
  id: string;
  name: string;
  code?: string;
}

export const AnalyticsFilters: React.FC<AnalyticsFiltersProps> = ({
  filters,
  onChange,
  masterData
}) => {
  const [elevatorSearch, setElevatorSearch] = useState('');
  const [townSearch, setTownSearch] = useState('');

  // Extract unique options from master data
  const filterOptions = useMemo(() => {
    const cropClasses = new Map();
    const regions = new Map();
    const elevators = new Map();
    const towns = new Map();

    masterData.forEach(entry => {
      // Crop classes (with codes)
      if (entry.class_code && entry.class_name) {
        cropClasses.set(entry.class_code, {
          id: entry.class_code,
          name: entry.class_name,
          code: entry.class_code
        });
      }

      // Regions
      if (entry.region_id && entry.region_name) {
        regions.set(entry.region_id, {
          id: entry.region_id,
          name: entry.region_name
        });
      }

      // Elevators
      if (entry.elevator_id && entry.elevator_name) {
        elevators.set(entry.elevator_id, {
          id: entry.elevator_id,
          name: entry.elevator_name
        });
      }

      // Towns
      if (entry.town_id && entry.town_name) {
        towns.set(entry.town_id, {
          id: entry.town_id,
          name: entry.town_name
        });
      }
    });

    return {
      cropClasses: Array.from(cropClasses.values()).sort((a, b) => a.code.localeCompare(b.code)),
      regions: Array.from(regions.values()).sort((a, b) => a.name.localeCompare(b.name)),
      elevators: Array.from(elevators.values()).sort((a, b) => a.name.localeCompare(b.name)),
      towns: Array.from(towns.values()).sort((a, b) => a.name.localeCompare(b.name))
    };
  }, [masterData]);

  // Filter elevators based on search
  const filteredElevators = useMemo(() => {
    if (!elevatorSearch) return filterOptions.elevators;
    return filterOptions.elevators.filter(elevator =>
      elevator.name.toLowerCase().includes(elevatorSearch.toLowerCase())
    );
  }, [filterOptions.elevators, elevatorSearch]);

  // Filter towns based on search
  const filteredTowns = useMemo(() => {
    if (!townSearch) return filterOptions.towns;
    return filterOptions.towns.filter(town =>
      town.name.toLowerCase().includes(townSearch.toLowerCase())
    );
  }, [filterOptions.towns, townSearch]);

  const handleFilterChange = (key: keyof AnalyticsFiltersType, value: string) => {
    onChange({
      ...filters,
      [key]: value || undefined
    });
  };

  const clearFilters = () => {
    onChange({ crop_class_code: 'CWRS' }); // Keep default CWRS
    setElevatorSearch('');
    setTownSearch('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Crop Class Buttons */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Crop Class</label>
        <div className="flex flex-wrap gap-2">
          {filterOptions.cropClasses.map((cropClass) => (
            <button
              key={cropClass.code}
              onClick={() => handleFilterChange('crop_class_code', cropClass.code)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                filters.crop_class_code === cropClass.code
                  ? 'bg-tg-primary text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cropClass.code}
            </button>
          ))}
        </div>
      </div>

      {/* Region Buttons */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Region</label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleFilterChange('region_id', '')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
              !filters.region_id
                ? 'bg-tg-green text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Regions
          </button>
          {filterOptions.regions.map((region) => (
            <button
              key={region.id}
              onClick={() => handleFilterChange('region_id', region.id)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                filters.region_id === region.id
                  ? 'bg-tg-green text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {region.name}
            </button>
          ))}
        </div>
      </div>

      {/* Dropdown Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

        {/* Searchable Elevator Dropdown */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            <Building className="w-4 h-4 inline mr-1" />
            Elevator
          </label>
          <div className="relative">
            <Input
              type="text"
              placeholder="Search elevators..."
              value={elevatorSearch}
              onChange={(e) => setElevatorSearch(e.target.value)}
              size="sm"
              icon={Search}
            />
            {elevatorSearch && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                <button
                  onClick={() => {
                    handleFilterChange('elevator_id', '');
                    setElevatorSearch('');
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 border-b border-gray-100"
                >
                  All Elevators
                </button>
                {filteredElevators.map((elevator) => (
                  <button
                    key={elevator.id}
                    onClick={() => {
                      handleFilterChange('elevator_id', elevator.id);
                      setElevatorSearch(elevator.name);
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                  >
                    {elevator.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Searchable Town Dropdown */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            <MapPin className="w-4 h-4 inline mr-1" />
            Town
          </label>
          <div className="relative">
            <Input
              type="text"
              placeholder="Search towns..."
              value={townSearch}
              onChange={(e) => setTownSearch(e.target.value)}
              size="sm"
              icon={Search}
            />
            {townSearch && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                <button
                  onClick={() => {
                    handleFilterChange('town_id', '');
                    setTownSearch('');
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 border-b border-gray-100"
                >
                  All Towns
                </button>
                {filteredTowns.map((town) => (
                  <button
                    key={town.id}
                    onClick={() => {
                      handleFilterChange('town_id', town.id);
                      setTownSearch(town.name);
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                  >
                    {town.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Clear Filters */}
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
        >
          Clear Filters
        </Button>
      </div>

      {/* Active Filters Summary */}
      {(Object.keys(filters).length > 1 || filters.crop_class_code !== 'CWRS') && (
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Active Filters:</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(filters).map(([key, value]) => {
              if (!value) return null;
              
              let displayValue = value;
              let displayKey = key.replace('_', ' ').replace('id', '');
              
              // Get display names for IDs
              if (key === 'crop_class_code') {
                displayKey = 'Crop Class';
                displayValue = value;
              } else if (key === 'region_id') {
                const region = filterOptions.regions.find(r => r.id === value);
                displayValue = region?.name || value;
                displayKey = 'Region';
              } else if (key === 'elevator_id') {
                const elevator = filterOptions.elevators.find(e => e.id === value);
                displayValue = elevator?.name || value;
                displayKey = 'Elevator';
              } else if (key === 'town_id') {
                const town = filterOptions.towns.find(t => t.id === value);
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