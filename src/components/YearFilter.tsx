
import React from 'react';
import { Calendar } from 'lucide-react';

interface YearFilterProps {
  selectedYearRange: [number, number];
  onYearRangeChange: (range: [number, number]) => void;
}

const YearFilter: React.FC<YearFilterProps> = ({ selectedYearRange, onYearRangeChange }) => {
  const currentYear = new Date().getFullYear();
  const presetRanges = [
    { label: 'All Time', range: [1950, currentYear] as [number, number] },
    { label: 'Recent (2020-2024)', range: [2020, currentYear] as [number, number] },
    { label: 'Modern (2010-2019)', range: [2010, 2019] as [number, number] },
    { label: 'Classic (2000-2009)', range: [2000, 2009] as [number, number] },
    { label: 'Retro (1990-1999)', range: [1990, 1999] as [number, number] },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-primary" />
        <h4 className="text-sm font-semibold text-foreground">Filter by Year</h4>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {presetRanges.map((preset) => (
          <button
            key={preset.label}
            onClick={() => onYearRangeChange(preset.range)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              selectedYearRange[0] === preset.range[0] && selectedYearRange[1] === preset.range[1]
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default YearFilter;
