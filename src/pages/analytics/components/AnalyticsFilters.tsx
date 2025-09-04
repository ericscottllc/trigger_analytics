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
    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
      <div className="flex flex-wrap items-center gap-4">
        {/* Crop Class Buttons */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-600">Class:</span>
          <div className="flex gap-1">
            {filterOptions.cropClasses.map((cropClass) => (
              <button
                key={cropClass.code}
                onClick={() => handleFilterChange('crop_class_code', cropClass.code)}
                className={`px-2 py-1 text-xs font-medium rounded transition-all duration-200 ${
                  filters.crop_class_code === cropClass.code
                    ? 'bg-tg-primary text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {cropClass.code}
              </button>
            ))}
          </div>
        </div>

        {/* Region Buttons */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-600">Region:</span>
          <div className="flex gap-1">
            <button
              onClick={() => handleFilterChange('region_id', '')}
              className={`px-2 py-1 text-xs font-medium rounded transition-all duration-200 ${
                !filters.region_id
                  ? 'bg-tg-green text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              All
            </button>
            {filterOptions.regions.map((region) => (
              <button
                key={region.id}
                onClick={() => handleFilterChange('region_id', region.id)}
                className={`px-2 py-1 text-xs font-medium rounded transition-all duration-200 ${
                  filters.region_id === region.id
                    ? 'bg-tg-green text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {region.name}
              </button>
            ))}
          </div>
        </div>

        {/* Date Range */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-600">From:</span>
          <input
            type="date"
            value={filters.date_from || ''}
            onChange={(e) => handleFilterChange('date_from', e.target.value)}
            className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-tg-primary"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-600">To:</span>
          <input
            type="date"
            value={filters.date_to || ''}
            onChange={(e) => handleFilterChange('date_to', e.target.value)}
            className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-tg-primary"
          />
        </div>

        {/* Searchable Elevator */}
        <div className="flex items-center gap-2 relative">
          <span className="text-xs font-medium text-gray-600">Elevator:</span>
          <input
            type="text"
            placeholder="Search..."
            value={elevatorSearch}
            onChange={(e) => setElevatorSearch(e.target.value)}
            className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-tg-primary w-32"
          />
          {elevatorSearch && (
            <div className="absolute top-full left-16 z-10 w-48 mt-1 bg-white border border-gray-200 rounded shadow-lg max-h-32 overflow-y-auto">
              <button
                onClick={() => {
                  handleFilterChange('elevator_id', '');
                  setElevatorSearch('');
                }}
                className="w-full px-2 py-1 text-left text-xs hover:bg-gray-50 border-b border-gray-100"
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
                  className="w-full px-2 py-1 text-left text-xs hover:bg-gray-50"
                >
                  {elevator.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Searchable Town */}
        <div className="flex items-center gap-2 relative">
          <span className="text-xs font-medium text-gray-600">Town:</span>
          <input
            type="text"
            placeholder="Search..."
            value={townSearch}
            onChange={(e) => setTownSearch(e.target.value)}
            className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-tg-primary w-32"
          />
          {townSearch && (
            <div className="absolute top-full left-12 z-10 w-48 mt-1 bg-white border border-gray-200 rounded shadow-lg max-h-32 overflow-y-auto">
              <button
                onClick={() => {
                  handleFilterChange('town_id', '');
                  setTownSearch('');
                }}
                className="w-full px-2 py-1 text-left text-xs hover:bg-gray-50 border-b border-gray-100"
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
                  className="w-full px-2 py-1 text-left text-xs hover:bg-gray-50"
                >
                  {town.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Clear Filters */}
        <button
          onClick={clearFilters}
          className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800 underline"
        >
          Clear
        </button>
      </div>
    </div>
  );
};