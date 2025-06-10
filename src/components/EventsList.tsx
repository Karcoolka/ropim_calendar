import React from 'react';
import { Event } from '../types/Event';

interface EventsListProps {
  events: Event[];
  loading: boolean;
  onEventClick: (event: Event) => void;
  sortOrder: 'newest' | 'oldest';
  onSortOrderChange: (order: 'newest' | 'oldest') => void;
}

export const EventsList: React.FC<EventsListProps> = ({ 
  events, 
  loading, 
  onEventClick,
  sortOrder,
  onSortOrderChange 
}) => {
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loading}>Načítám události...</div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div style={styles.emptyContainer}>
        <div style={styles.emptyMessage}>
          <h3>Žádné události nenalezeny</h3>
          <p>Zkuste upravit filtry pro zobrazení více událostí.</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return { date: '', time: '' };
    
    try {
      const date = new Date(dateString);
      
      // Format like "30. 12. 2025"
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      
      // Format like "23:00"
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      
      return {
        date: `${day}. ${month.toString().padStart(2, '0')}. ${year}`,
        time: `${hours}:${minutes}`
      };
    } catch {
      return { date: dateString.split(' ')[0] || '', time: dateString.split(' ')[1] || '' };
    }
  };

  const getCategoryTag = (category: string) => {
    console.log('Rendering category tag:', category); // Debug log
    const tagConfig = {
      'Událost ISVS': { 
        color: '#FEF7C3', 
        textColor: '#6B4A0D', 
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="3" fill="none" stroke="#ffc107" strokeWidth="2"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" fill="none" stroke="#ffc107" strokeWidth="2"/>
          </svg>
        )
      },
      'Odstávky': { 
        color: '#FDE3E3', 
        textColor: '#6B4A0D', 
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" fill="none" stroke="#6B4A0D" strokeWidth="2"/>
            <line x1="8" y1="8" x2="16" y2="16" stroke="#6B4A0D" strokeWidth="2"/>
            <line x1="16" y1="8" x2="8" y2="16" stroke="#6B4A0D" strokeWidth="2"/>
          </svg>
        )
      },
      'Veřejná událost': { 
        color: '#17a2b8', 
        textColor: '#fff',
        icon: '👥'  // Simple emoji for now
      },
      'Akce eGovernmentu': { 
        color: '#28a745', 
        textColor: '#fff',
        icon: '💻'  // Simple emoji for now
      },
      'Riziko A': { 
        color: '#28a745', 
        textColor: '#fff', 
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path d="M12 2L2 20h20L12 2z" fill="#fff"/>
          </svg>
        )
      },
      'Riziko B': { 
        color: '#ffc107', 
        textColor: '#000', 
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path d="M12 2L2 20h20L12 2z" fill="#000"/>
          </svg>
        )
      },
      'Riziko C': { 
        color: '#dc3545', 
        textColor: '#fff', 
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path d="M12 2L2 20h20L12 2z" fill="#fff"/>
          </svg>
        )
      }
    };

    const config = tagConfig[category as keyof typeof tagConfig] || { color: '#6c757d', textColor: '#fff' };
    console.log('Tag config:', config); // Debug log
    
    return (
      <span style={{
        ...styles.tag,
        backgroundColor: config.color,
        color: config.textColor,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        {config.icon && <span style={{ fontSize: '14px', lineHeight: 1 }}>{config.icon}</span>}
        {category}
      </span>
    );
  };

  const getRiskTag = (riskLevel: string) => {
    if (!riskLevel) return null;
    console.log('Rendering risk tag:', riskLevel); // Debug log
    
    const riskConfig = {
      'A': { 
        color: '#28a745', 
        textColor: '#fff', 
        label: 'Riziko A',
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path d="M12 2L2 20h20L12 2z" fill="#fff"/>
          </svg>
        )
      },
      'B': { 
        color: '#ffc107', 
        textColor: '#000', 
        label: 'Riziko B',
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path d="M12 2L2 20h20L12 2z" fill="#000"/>
          </svg>
        )
      },
      'C': { 
        color: '#dc3545', 
        textColor: '#fff', 
        label: 'Riziko C',
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path d="M12 2L2 20h20L12 2z" fill="#fff"/>
          </svg>
        )
      }
    };

    const config = riskConfig[riskLevel as keyof typeof riskConfig];
    if (!config) return null;
    console.log('Risk config:', config); // Debug log
    
    return (
      <span style={{
        ...styles.tag,
        backgroundColor: config.color,
        color: config.textColor,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        {config.icon && <span style={{ fontSize: '14px', lineHeight: 1 }}>{config.icon}</span>}
        {config.label}
      </span>
    );
  };

  const getStatusTag = (event: Event) => {
    // Check for different status indicators
    if (event.stav_udalosti === 'Realizováno') {
      return (
        <span style={{
          ...styles.tag,
           backgroundColor: '#FDE3E3',
           color: '#6B4A0D'
        }}>
          Odstávky
        </span>
      );
    }
    
    // Check if it's a future planned event
    if (event.datum_zacatek) {
      const eventDate = new Date(event.datum_zacatek);
      const now = new Date();
      if (eventDate > now) {
        return (
          <span style={{
            ...styles.tag,
            backgroundColor: '#28a745',
            color: '#fff'
          }}>
            Plánováno
          </span>
        );
      }
    }

    return null;
  };

  const renderEventDate = (date: string, time: string) => (
    <div style={styles.dateSection}>
      <div style={styles.eventDate}>
        <svg 
          style={styles.icon}
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        {date}
      </div>
      <div style={styles.eventTime}>
        <svg 
          style={styles.icon}
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        {time}
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h2 style={styles.title}>Plánované události</h2>
          <div style={styles.count}>{events.length} událostí</div>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.sortingSection}>
            <span style={styles.sortLabel}>Řazení:</span>
            <select 
              style={styles.sortSelect}
              value={sortOrder}
              onChange={(e) => onSortOrderChange(e.target.value as 'newest' | 'oldest')}
            >
              <option value="newest">Od nejnovějších</option>
              <option value="oldest">Od nejstarších</option>
            </select>
          </div>
        </div>
      </div>

      <div style={styles.eventsList}>
        {events.map(event => {
          const { date, time } = formatDate(event.datum_zacatek);
          return (
            <div
              key={event.id_zaznamu}
              style={styles.eventCard}
              onClick={() => onEventClick(event)}
            >
              <div style={styles.eventDetails}>
                <h3 style={styles.eventTitle}>
                  {event.nazev_udalosti || `Událost #${event.id_zaznamu}`}
                </h3>
                <div style={styles.eventId}>#{event.id_udalosti || event.id_zaznamu}</div>
                
                {event.organizator && (
                  <div style={styles.eventMeta}>
                    <div style={styles.metaItem}>
                      <svg 
                        style={styles.icon}
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="1.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="3" y1="9" x2="21" y2="9"></line>
                        <line x1="9" y1="21" x2="9" y2="9"></line>
                      </svg>
                      {event.organizator}
                    </div>
                  </div>
                )}

                {renderEventDate(date, time)}

                {event.misto_konani && (
                  <div style={styles.eventMeta}>
                    <div style={styles.metaItem}>
                      <svg 
                        style={styles.icon}
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="1.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      {event.misto_konani}
                    </div>
                  </div>
                )}

                {event.popis_udalosti && (
                  <div style={styles.eventDescription}>
                    {event.popis_udalosti.length > 150 
                      ? `${event.popis_udalosti.substring(0, 150)}...`
                      : event.popis_udalosti
                    }
                  </div>
                )}

                {/* Tags */}
                <div style={styles.tagsContainer}>
                  {event.kategorie_nazev && getCategoryTag(event.kategorie_nazev)}
                  {getRiskTag(event.kategorie_rizika)}
                  {getStatusTag(event)}
                  {event.zkratka_informacniho_systemu && (
                    <span style={{
                      ...styles.tag,
                      backgroundColor: '#e3f2fd',
                      color: '#1976d2',
                      border: '1px solid #1976d2'
                    }}>
                      {event.zkratka_informacniho_systemu}
                    </span>
                  )}
                </div>

                {/* Additional info
                {(event.url_udalosti || event.kontaktni_osoba) && (
                  <div style={styles.additionalInfo}>
                    {event.url_udalosti && (
                      <a 
                        href={event.url_udalosti} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={styles.link}
                      >
                        Více informací
                      </a>
                    )}
                    {event.kontaktni_osoba && (
                      <span style={styles.contact}>
                        Kontakt: {event.kontaktni_osoba}
                      </span>
                    )}
                  </div>
                )} */}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    overflow: 'hidden'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    paddingLeft: '0px',
    borderBottom: '1px solid #eee',
    backgroundColor: '#f8f9fa'
  },
  headerLeft: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px'
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center'
  },
  title: {
    margin: '0',
    fontSize: '24px',
    fontWeight: '600',
    color: '#333'
  },
  count: {
    marginTop: '30px',
    fontSize: '14px',
    color: '#333',
    fontWeight: '400'
  },
  sortingSection: {
    display: 'flex',
    alignItems: 'center',
    marginTop: '60px',
    gap: '8px'
  },
  sortLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#609352'
  },
  sortSelect: {
    padding: '4px 8px',
    border: '0px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '700',
    color: '#609352',
    backgroundColor: '#F6F6F6'
  },
  eventsList: {
    backgroundColor: '#F5F5F5',
    padding: '0',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px'
  },
  eventCard: {
    display: 'flex',
    padding: '20px',
    transition: 'background-color 0.2s ease',
    cursor: 'pointer',
    borderRadius: '8px',
    backgroundColor: '#FFFFFF',
  },
  dateSection: {
    minWidth: '120px',
    marginRight: '20px',
    textAlign: 'left' as const,
  },
  eventDate: {
    fontSize: '14px',
    fontWeight: '400',
    color: '#666',
    marginBottom: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  eventTime: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  eventId: {
    fontSize: '12px',
    color: '#999',
    backgroundColor: '#f8f9fa',
    padding: '2px 6px',
    borderRadius: '3px',
    display: 'inline-block'
  },
  eventDetails: {
    flex: 1,
    minWidth: 0
  },
  eventTitle: {
    margin: '0 0 8px 0',
    fontSize: '16px',
    fontWeight: '600',
    color: '#368537',
    lineHeight: '1.4'
  },
  eventMeta: {
    marginTop: '4px'
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px',
    color: '#666',
    marginBottom: '4px'
  },
  metaIcon: {
    marginRight: '6px',
    fontSize: '12px',
    display: 'none'
  },
  eventDescription: {
    fontSize: '14px',
    color: '#666',
    lineHeight: '1.5',
    marginBottom: '12px'
  },
  tagsContainer: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '6px',
    marginBottom: '8px'
  },
  tag: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500',
    gap: '4px'
  },
  additionalInfo: {
    display: 'flex',
    gap: '15px',
    fontSize: '12px',
    marginTop: '8px'
  },
  link: {
    color: '#007bff',
    textDecoration: 'none'
  },
  contact: {
    color: '#666'
  },
  loadingContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    padding: '60px 20px',
    textAlign: 'center' as const
  },
  loading: {
    fontSize: '16px',
    color: '#666'
  },
  emptyContainer: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '60px 20px',
    textAlign: 'center' as const
  },
  emptyMessage: {
    color: '#666'
  },
  icon: {
    width: '16px',
    height: '16px',
    color: 'currentColor',
    marginRight: '6px'
  },
  tagIcon: {
    width: '16px',
    height: '16px',
    marginRight: '4px',
    display: 'inline-block',
    verticalAlign: 'middle',
    position: 'relative' as const,
    top: '-1px'
  }
}; 