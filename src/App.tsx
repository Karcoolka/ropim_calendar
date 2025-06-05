import React, { useState, useEffect } from 'react';
import { Event } from './types/Event';
import { EventsList } from './components/EventsList';
import { EventFilters, Filters } from './components/EventFilters';
import { fetchEvents, EventFilters as ApiFilters } from './api/eventsApi';

function App() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeScreen, setActiveScreen] = useState<'seznam' | 'kalendar'>('seznam');
  
  const [filters, setFilters] = useState<Filters>({
    search: '',
    category: '',
    ovm: [],
    isvs: [],
    dateFilter: 'all',
    dateFrom: '',
    dateTo: ''
  });

  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Load events when component mounts or filters change
  useEffect(() => {
    loadEvents();
  }, [filters, sortOrder]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Convert our filters to API format
      const apiFilters: ApiFilters = {
        search: filters.search,
        category: filters.category,
        ovm: filters.ovm,
        isvs: filters.isvs,
        dateFilter: filters.dateFilter === 'all' ? undefined : filters.dateFilter,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo
      };
      
      const data = await fetchEvents(apiFilters);
      setEvents(data);
      
      // Apply sorting to filtered events
      const sortedData = [...data].sort((a, b) => {
        const dateA = new Date(a.datum_zacatek).getTime();
        const dateB = new Date(b.datum_zacatek).getTime();
        
        if (sortOrder === 'newest') {
          return dateB - dateA; // Nejnovější první
        } else {
          return dateA - dateB; // Nejstarší první
        }
      });
      
      setFilteredEvents(sortedData);
    } catch (err) {
      console.error('Error loading events:', err);
      setError('Nepodařilo se načíst události. Zkuste to prosím později.');
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  const getEventsCount = () => {
    if (!events.length) return { dnes: 0, tyden: 0, mesic: 0, rok: 0 };
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);
    const endOfYear = new Date(now.getFullYear(), 11, 31);
    endOfYear.setHours(23, 59, 59, 999);
    
         return {
       dnes: events.filter(event => {
         const eventDate = new Date(event.datum_zacatek);
         return eventDate >= today && eventDate <= endOfDay;
       }).length,
       tyden: events.filter(event => {
         const eventDate = new Date(event.datum_zacatek);
         return eventDate >= startOfWeek && eventDate <= endOfWeek;
       }).length,
       mesic: events.filter(event => {
         const eventDate = new Date(event.datum_zacatek);
         return eventDate >= startOfMonth && eventDate <= endOfMonth;
       }).length,
       rok: events.filter(event => {
         const eventDate = new Date(event.datum_zacatek);
         return eventDate >= startOfYear && eventDate <= endOfYear;
       }).length
     };
  };

  // Define tag type
  interface FilterTag {
    id: string;
    label: string;
    type: string;
    value?: string;
  }

  // Get active filter tags
  const getActiveFilterTags = (): FilterTag[] => {
    const tags: FilterTag[] = [];
    
    if (filters.search) {
      tags.push({
        id: 'search',
        label: filters.search,
        type: 'search'
      });
    }
    
    if (filters.category) {
      tags.push({
        id: 'category',
        label: filters.category,
        type: 'category'
      });
    }
    
    // Multiple OVM selections
    filters.ovm.forEach((ovmId, index) => {
      tags.push({
        id: `ovm-${index}`,
        label: `OVM: ${ovmId}`, // This would be dynamic in real app
        type: 'ovm',
        value: ovmId
      });
    });
    
    // Multiple ISVS selections
    filters.isvs.forEach((isvsId, index) => {
      tags.push({
        id: `isvs-${index}`,
        label: `ISVS: ${isvsId}`,
        type: 'isvs',
        value: isvsId
      });
    });
    
    const dateLabels = {
      'today': 'Dnes',
      'week': 'Tento týden',
      'month': 'Tento měsíc', 
      'year': 'Tento rok',
      'custom': 'Vlastní období'
    };
    
    if (filters.dateFilter !== 'all') {
      tags.push({
        id: 'date',
        label: dateLabels[filters.dateFilter as keyof typeof dateLabels] || 'Datum',
        type: 'date'
      });
    }
    
    return tags;
  };

  const removeFilterTag = (tagId: string) => {
    const newFilters = { ...filters };
    
    if (tagId.startsWith('ovm-')) {
      const tagData = activeFilterTags.find(tag => tag.id === tagId);
      if (tagData && tagData.value) {
        newFilters.ovm = filters.ovm.filter(id => id !== tagData.value);
      }
    } else if (tagId.startsWith('isvs-')) {
      const tagData = activeFilterTags.find(tag => tag.id === tagId);
      if (tagData && tagData.value) {
        newFilters.isvs = filters.isvs.filter(id => id !== tagData.value);
      }
    } else {
      switch (tagId) {
        case 'search':
          newFilters.search = '';
          break;
        case 'category':
          newFilters.category = '';
          break;
        case 'date':
          newFilters.dateFilter = 'all';
          newFilters.dateFrom = '';
          newFilters.dateTo = '';
          break;
      }
    }
    
    setFilters(newFilters);
  };

  const clearAllFilters = () => {
    setFilters({
      search: '',
      category: '',
      ovm: [],
      isvs: [],
      dateFilter: 'all',
      dateFrom: '',
      dateTo: ''
    });
  };

  const activeFilterTags = getActiveFilterTags();

  return (
    <div style={styles.app}>
      <main style={styles.main}>
        <div style={styles.container}>
          <div style={styles.breadcrumb}>
            <span style={styles.breadcrumbLink}>Domů</span>
            <span style={styles.breadcrumbSeparator}> › </span>
            <span style={styles.breadcrumbCurrent}>Plánované události ve veřejné správě</span>
          </div>
          
          <h1 style={styles.title}>Plánované události</h1>
          
          <div style={styles.navigation}>
            <button
              onClick={() => setActiveScreen('seznam')}
              style={{
                ...styles.navButton,
                ...(activeScreen === 'seznam' ? styles.activeNavButton : {})
              }}
            >
              Seznam
            </button>
            <button
              onClick={() => setActiveScreen('kalendar')}
              style={{
                ...styles.navButton,
                ...(activeScreen === 'kalendar' ? styles.activeNavButton : {})
              }}
            >
              Kalendář
            </button>
          </div>
        </div>
        <div style={styles.content}>
          {activeScreen === 'seznam' ? (
            <>
              {/* Filters Section */}
              <div style={styles.filtersSection}>
                <EventFilters
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  eventCounts={getEventsCount()}
                />
              </div>

              {/* Events Section */}
              <div style={styles.eventsSection}>
                {/* Active Filter Tags */}
                {activeFilterTags.length > 0 && (
                  <div style={styles.activeFiltersSection}>
                    <span style={styles.activeFiltersLabel}>Aktivní filtry:</span>
                    <div style={styles.activeFilterTags}>
                      {activeFilterTags.map(tag => (
                        <div key={tag.id} style={styles.filterTag}>
                          <span>{tag.label}</span>
                          <button
                            onClick={() => removeFilterTag(tag.id)}
                            style={styles.removeTagButton}
                            aria-label="Odstranit filtr"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              width="20"
                              height="20"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              fill="none"
                            >
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                    <button onClick={clearAllFilters} style={styles.clearAllButton}>
                      Zrušit filtry
                    </button>
                  </div>
                )}
                
                {/* Events count info */}
                <div style={styles.resultsInfo}>
                  <span style={styles.eventCount}>{filteredEvents.length} událostí</span>
                  <div style={styles.sortingSection}>
                    <span style={styles.sortLabel}>Řazení:</span>
                    <select 
                      style={styles.sortSelect}
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                    >
                      <option value="newest">Od nejnovějších</option>
                      <option value="oldest">Od nejstarších</option>
                    </select>
                  </div>
                </div>
                
                {error && (
                  <div style={styles.errorMessage}>
                    {error}
                  </div>
                )}
                
                <EventsList
                  events={filteredEvents}
                  loading={loading}
                  onEventClick={(event) => {
                    // For now, we'll just log the event
                    console.log('Event clicked:', event);
                  }}
                />
              </div>
            </>
          ) : (
            <div style={styles.calendarPlaceholder}>
              {/* Prázdný kalendář */}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

const styles = {
  app: {
    minHeight: '100vh',
    backgroundColor: '#F6F6F6',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  },
  container: {
    padding: '20px 20px 0 20px'
  },
  header: {
    backgroundColor: '#F6F6F6',
    padding: '20px',
    borderBottom: '1px solid #eee'
  },
  breadcrumb: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '10px'
  },
  breadcrumbLink: {
    color: '#28a745',
    textDecoration: 'none',
    cursor: 'pointer'
  },
  breadcrumbSeparator: {
    color: '#666',
    margin: '0 4px'
  },
  breadcrumbCurrent: {
    color: '#333',
    fontWeight: '500'
  },
  title: {
    margin: '0 0 20px 0',
    fontSize: '28px',
    fontWeight: '600',
    color: '#333'
  },
  navigation: {
    display: 'flex',
    gap: '0',
    marginTop: '20px'
  },
  navButton: {
    backgroundColor: 'transparent',
    color: '#6c757d',
    border: 'none',
    borderBottom: '3px solid transparent',
    padding: '12px 24px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    position: 'relative' as const
  },
  activeNavButton: {
    color: '#28a745',
    borderBottomColor: '#28a745',
    backgroundColor: 'transparent'
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    minHeight: '100vh',
    padding: '0'
  },
  content: {
    display: 'flex',
    gap: '20px',
    padding: '20px'
  },
  filtersSection: {
    width: '300px',
    flexShrink: 0
  },
  eventsSection: {
    flex: 1,
    minWidth: 0
  },
  activeFiltersSection: {
    borderRadius: '6px',
    padding: '12px 16px',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    justifyContent: 'space-between'
  },
  activeFiltersHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexShrink: 0
  },
  activeFiltersLabel: {
    fontWeight: '500',
    fontSize: '14px',
    color: '#495057',
    whiteSpace: 'nowrap'
  },
  clearAllButton: {
    background: 'none',
    border: 'none',
    color: '#368537',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    textDecoration: 'none',
    padding: '0',
    whiteSpace: 'nowrap',
    marginLeft: 'auto'
  },
  activeFilterTags: {
    display: 'flex',
    flexWrap: 'nowrap' as const,
    gap: '6px',
    overflowX: 'auto' as const,
    paddingBottom: '4px',
    flex: 1,
    margin: '0 12px'
  },
  filterTag: {
    backgroundColor: '#f8f9fa',
    color: '#333',
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontWeight: '400',
    border: '1px solid #B0B0B0'
  },
  removeTagButton: {
    background: 'none',
    border: 'none',
    color: '#368537',
    cursor: 'pointer',
    padding: '0',
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s ease',
    '&:hover': {
      backgroundColor: 'rgba(54, 133, 55, 0.1)'
    }
  },
  resultsInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    fontSize: '14px',
    color: '#666'
  },
  eventCount: {
    fontWeight: '600',
    fontSize: '16px',
    color: '#333'
  },
  sortingSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  sortLabel: {
    fontSize: '14px',
    color: '#666'
  },
  sortSelect: {
    padding: '6px 10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '14px',
    backgroundColor: '#FFFFFF',
    cursor: 'pointer'
  },
  errorMessage: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '12px',
    borderRadius: '4px',
    border: '1px solid #f5c6cb',
    marginBottom: '20px'
  },
  calendarPlaceholder: {
    flex: 1,
    backgroundColor: '#F6F6F6',
    borderRadius: '8px',
    padding: '20px',
    minHeight: '400px'
  }
};

export default App;
