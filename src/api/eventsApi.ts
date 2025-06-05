import { Event } from '../types/Event';

// Import data files
import eventsData from '../data/events.json';
import categoriesData from '../data/categories.json';
import uradyData from '../data/urady.json';
import isvsData from '../data/isvs.json';
import searchSuggestionsData from '../data/search-suggestions.json';

// Types for API responses
export interface Category {
  id: number;
  nazev: string;
  count: number;
}

export interface Urad {
  id: string;
  nazev: string;
}

export interface ISVSSystem {
  id: string;
  zkratka: string;
  nazev: string;
}

export interface SearchSuggestion {
  id: string;
  label: string;
  count: number;
}

export interface EventFilters {
  search?: string;
  category?: string;
  ovm?: string | string[];
  isvs?: string | string[];
  dateFrom?: string;
  dateTo?: string;
  dateFilter?: 'today' | 'week' | 'month' | 'year' | 'custom';
}

// Helper function to check if date is within range
const isDateInRange = (eventDate: string, startDate: Date, endDate: Date): boolean => {
  if (!eventDate) return false;
  const date = new Date(eventDate);
  return date >= startDate && date <= endDate;
};

// Helper function to get date ranges
const getDateRange = (filter: string): { start: Date; end: Date } | null => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (filter) {
    case 'today':
      return {
        start: today,
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      };
    case 'week':
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      return {
        start: weekStart,
        end: new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
      };
    case 'month':
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: new Date(now.getFullYear(), now.getMonth() + 1, 1)
      };
    case 'year':
      return {
        start: new Date(now.getFullYear(), 0, 1),
        end: new Date(now.getFullYear() + 1, 0, 1)
      };
    default:
      return null;
  }
};

// API functions using imported data

export const fetchEvents = async (filters: EventFilters = {}): Promise<Event[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Filter out generic events with names like "Událost #XX.0"
  let filteredEvents = (eventsData as Event[]).filter(event => 
    !event.nazev_udalosti.match(/^Událost #\d+\.0$/)
  );
  
  // Apply filters
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filteredEvents = filteredEvents.filter(event =>
      (event.nazev_udalosti && event.nazev_udalosti.toLowerCase().includes(searchTerm)) ||
      (event.popis_udalosti && event.popis_udalosti.toLowerCase().includes(searchTerm)) ||
      (event.organizator && event.organizator.toLowerCase().includes(searchTerm)) ||
      (event.misto_konani && event.misto_konani.toLowerCase().includes(searchTerm)) ||
      (event.kategorie_nazev && event.kategorie_nazev.toLowerCase().includes(searchTerm)) ||
      (event.zkratka_informacniho_systemu && event.zkratka_informacniho_systemu.toLowerCase().includes(searchTerm))
    );
  }
  
  if (filters.category) {
    filteredEvents = filteredEvents.filter(event => 
      event.kategorie_nazev === filters.category
    );
  }
  
  if (filters.ovm) {
    const ovmFilter = Array.isArray(filters.ovm) ? filters.ovm : [filters.ovm];
    if (ovmFilter.length > 0) {
      filteredEvents = filteredEvents.filter(event => 
        ovmFilter.includes(event.id_organu_verejne_moci)
      );
    }
  }
  
  if (filters.isvs) {
    const isvsFilter = Array.isArray(filters.isvs) ? filters.isvs : [filters.isvs];
    if (isvsFilter.length > 0) {
      filteredEvents = filteredEvents.filter(event => 
        isvsFilter.includes(event.zkratka_informacniho_systemu)
      );
    }
  }
  
  // Date filtering
  if (filters.dateFilter && filters.dateFilter !== 'custom') {
    const dateRange = getDateRange(filters.dateFilter);
    if (dateRange) {
      filteredEvents = filteredEvents.filter(event => 
        isDateInRange(event.datum_zacatek, dateRange.start, dateRange.end)
      );
    }
  } else if (filters.dateFrom || filters.dateTo) {
    filteredEvents = filteredEvents.filter(event => {
      if (!event.datum_zacatek) return false;
      const eventDate = new Date(event.datum_zacatek);
      
      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        if (eventDate < fromDate) return false;
      }
      
      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999); // End of day
        if (eventDate > toDate) return false;
      }
      
      return true;
    });
  }
  
  return filteredEvents;
};

export const fetchCategories = async (): Promise<Category[]> => {
  await new Promise(resolve => setTimeout(resolve, 50));
  return categoriesData as Category[];
};

export const fetchUrady = async (): Promise<Urad[]> => {
  await new Promise(resolve => setTimeout(resolve, 50));
  return uradyData as Urad[];
};

export const fetchISVSSystems = async (): Promise<ISVSSystem[]> => {
  await new Promise(resolve => setTimeout(resolve, 50));
  return isvsData as ISVSSystem[];
};

export const fetchSearchSuggestions = async (): Promise<SearchSuggestion[]> => {
  await new Promise(resolve => setTimeout(resolve, 50));
  return searchSuggestionsData as SearchSuggestion[];
};

// Keep old function names for backward compatibility
export const fetchISVS = fetchISVSSystems; 