import React, { useState, useEffect } from 'react';
import { AutocompleteInput } from './AutocompleteInput';
import { MultiSelectAutocomplete } from './MultiSelectAutocomplete';
import { 
  fetchCategories, 
  fetchUrady, 
  fetchISVSSystems, 
  fetchSearchSuggestions,
  type Category, 
  type Urad, 
  type ISVSSystem,
  type SearchSuggestion
} from '../api/eventsApi';

export interface Filters {
  search: string;
  category: string;
  ovm: string[];
  isvs: string[];
  dateFilter: 'all' | 'today' | 'week' | 'month' | 'year' | 'custom';
  dateFrom: string;
  dateTo: string;
}

interface EventFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  eventCounts: {
    dnes: number;
    tyden: number;
    mesic: number;
    rok: number;
  };
}

export const EventFilters: React.FC<EventFiltersProps> = ({
  filters,
  onFiltersChange,
  eventCounts
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [urady, setUrady] = useState<Urad[]>([]);
  const [isvsSystems, setIsvsSystems] = useState<ISVSSystem[]>([]);
  const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFilterData();
  }, []);

  const loadFilterData = async () => {
    try {
      setLoading(true);
      const [categoriesData, uradyData, isvsData, suggestionsData] = await Promise.all([
        fetchCategories(),
        fetchUrady(),
        fetchISVSSystems(),
        fetchSearchSuggestions()
      ]);
      
      setCategories(categoriesData);
      setUrady(uradyData);
      setIsvsSystems(isvsData);
      setSearchSuggestions(suggestionsData);
    } catch (error) {
      console.error('Chyba při načítání filter dat:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof Filters, value: string | string[]) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const handleCategoryToggle = (categoryName: string, checked: boolean) => {
    // Since we only support one category at a time, toggle it
    handleFilterChange('category', checked ? categoryName : '');
  };

  // Convert search suggestions to autocomplete options
  const searchOptions = searchSuggestions.map(suggestion => ({
    id: suggestion.id,
    label: suggestion.label,
    description: suggestion.count > 1 ? `${suggestion.count}×` : undefined
  }));

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingMessage}>Načítám filtry...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Search with autocomplete */}
      <div style={styles.filterGroup}>
        <label style={styles.label}>Jakou událost hledáte?</label>
        <AutocompleteInput
          value={filters.search}
          onChange={(value) => handleFilterChange('search', value)}
          onSearch={(value) => handleFilterChange('search', value)}
          options={searchOptions}
          placeholder="Zadejte název..."
          maxSuggestions={8}
          minInputLength={2}
          showCount={false}
        />
      </div>

      {/* Categories as checkboxes */}
      <div style={styles.filterGroup}>
        <label style={styles.label}>Kategorie</label>
        <div style={styles.checkboxGroup}>
          {categories.filter(category => category.count > 0).map(category => (
            <label key={category.id} style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={filters.category === category.nazev}
                onChange={(e) => handleCategoryToggle(category.nazev, e.target.checked)}
                style={styles.checkbox}
              />
              <span style={styles.checkboxText}>
                {category.nazev} ({category.count})
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* OVM Autocomplete */}
      <div style={styles.filterGroup}>
        <label style={styles.label}>Orgán veřejné moci</label>
        <MultiSelectAutocomplete
          options={urady.map(urad => ({
            id: urad.id,
            label: urad.nazev
          }))}
          selectedValues={filters.ovm}
          onChange={(values) => handleFilterChange('ovm', values)}
          placeholder="Vyberte orgán veřejné moci..."
          maxSuggestions={10}
          minInputLength={1}
        />
      </div>

      {/* ISVS Autocomplete */}
      <div style={styles.filterGroup}>
        <label style={styles.label}>Název informačního systému veřejné správy</label>
        <MultiSelectAutocomplete
          options={isvsSystems.map(isvs => ({
            id: isvs.zkratka,
            label: `${isvs.zkratka} - ${isvs.nazev}`
          }))}
          selectedValues={filters.isvs}
          onChange={(values) => handleFilterChange('isvs', values)}
          placeholder="Vyberte informační systém..."
          maxSuggestions={10}
          minInputLength={1}
        />
      </div>

      {/* Date filters as radio buttons */}
      <div style={styles.filterGroup}>
        <label style={styles.label}>Datum konání</label>
        <div style={styles.radioGroup}>
          <label style={styles.radioLabel}>
            <input
              type="radio"
              name="dateFilter"
              value="today"
              checked={filters.dateFilter === 'today'}
              onChange={(e) => handleFilterChange('dateFilter', e.target.value)}
              style={styles.radio}
            />
            <span style={styles.radioText}>Dnes ({eventCounts.dnes})</span>
          </label>
          
          <label style={styles.radioLabel}>
            <input
              type="radio"
              name="dateFilter"
              value="week"
              checked={filters.dateFilter === 'week'}
              onChange={(e) => handleFilterChange('dateFilter', e.target.value)}
              style={styles.radio}
            />
            <span style={styles.radioText}>Tento týden ({eventCounts.tyden})</span>
          </label>
          
          <label style={styles.radioLabel}>
            <input
              type="radio"
              name="dateFilter"
              value="month"
              checked={filters.dateFilter === 'month'}
              onChange={(e) => handleFilterChange('dateFilter', e.target.value)}
              style={styles.radio}
            />
            <span style={styles.radioText}>Tento měsíc ({eventCounts.mesic})</span>
          </label>
          
          <label style={styles.radioLabel}>
            <input
              type="radio"
              name="dateFilter"
              value="year"
              checked={filters.dateFilter === 'year'}
              onChange={(e) => handleFilterChange('dateFilter', e.target.value)}
              style={styles.radio}
            />
            <span style={styles.radioText}>Tento rok ({eventCounts.rok})</span>
          </label>
          
          <label style={styles.radioLabel}>
            <input
              type="radio"
              name="dateFilter"
              value="custom"
              checked={filters.dateFilter === 'custom'}
              onChange={(e) => handleFilterChange('dateFilter', e.target.value)}
              style={styles.radio}
            />
            <span style={styles.radioText}>Vybrat datum</span>
          </label>
        </div>
      </div>

      {/* Custom date range */}
      {filters.dateFilter === 'custom' && (
        <>
          <div style={styles.filterGroup}>
            <label style={styles.label}>Datum od</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              style={styles.dateInput}
            />
          </div>
          
          <div style={styles.filterGroup}>
            <label style={styles.label}>Datum do</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              style={styles.dateInput}
            />
          </div>
        </>
      )}
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#F6F6F6',
    padding: '20px',
    marginBottom: '20px',
    fontSize: '14px'
  },
  filterGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    fontWeight: '600',
    color: '#368537',
    marginBottom: '8px',
    fontSize: '14px'
  },
  checkboxGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    padding: '4px 0'
  },
  checkbox: {
    marginRight: '8px',
    transform: 'scale(1.1)',
    accentColor: '#368537'
  },
  checkboxText: {
    color: '#333',
    fontSize: '14px'
  },
  dropdownContainer: {
    position: 'relative' as const
  },
  dropdownButton: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    backgroundColor: '#fff',
    textAlign: 'left' as const,
    cursor: 'pointer',
    fontSize: '14px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'border-color 0.2s ease'
  },
  dropdownButtonOpen: {
    borderColor: '#007bff',
    boxShadow: '0 0 0 2px rgba(0,123,255,0.25)'
  },
  dropdownArrow: {
    fontSize: '12px',
    color: '#666'
  },
  dropdownMenu: {
    position: 'absolute' as const,
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    border: '1px solid #ccc',
    borderTop: 'none',
    borderRadius: '0 0 4px 4px',
    maxHeight: '200px',
    overflowY: 'auto' as const,
    zIndex: 1000,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  dropdownItem: {
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: '14px',
    borderBottom: '1px solid #f0f0f0',
    transition: 'background-color 0.2s ease'
  },
  dropdownItemSelected: {
    backgroundColor: '#e3f2fd',
    color: '#1976d2'
  },
  select: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '14px',
    backgroundColor: '#fff',
    cursor: 'pointer'
  },
  radioGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px'
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    padding: '4px 0'
  },
  radio: {
    marginRight: '8px',
    accentColor: '#368537'
  },
  radioText: {
    color: '#333',
    fontSize: '14px',
  },
  dateInput: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '14px'
  },
  loadingMessage: {
    textAlign: 'center' as const,
    color: '#666',
    fontStyle: 'italic',
    padding: '20px'
  }
}; 