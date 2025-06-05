export const dateUtils = {
  // Formátování data pro zobrazení
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  },

  // Formátování data a času
  formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  // Získání dnešního data jako string
  getTodayString(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  },

  // Získání začátku týdne
  getWeekStartString(): string {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Pondělí jako začátek týdne
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    return monday.toISOString().split('T')[0];
  },

  // Získání konce týdne
  getWeekEndString(): string {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const sundayOffset = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
    const sunday = new Date(today);
    sunday.setDate(today.getDate() + sundayOffset);
    return sunday.toISOString().split('T')[0];
  },

  // Získání začátku měsíce
  getMonthStartString(): string {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    return firstDay.toISOString().split('T')[0];
  },

  // Získání konce měsíce
  getMonthEndString(): string {
    const today = new Date();
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return lastDay.toISOString().split('T')[0];
  },

  // Získání začátku roku
  getYearStartString(): string {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), 0, 1);
    return firstDay.toISOString().split('T')[0];
  },

  // Získání konce roku
  getYearEndString(): string {
    const today = new Date();
    const lastDay = new Date(today.getFullYear(), 11, 31);
    return lastDay.toISOString().split('T')[0];
  },

  // Kontrola zda je datum v rozmezí
  isDateInRange(dateString: string, startDate: string, endDate: string): boolean {
    const date = new Date(dateString);
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return date >= start && date <= end;
  },

  // Kontrola zda je datum dnes
  isToday(dateString: string): boolean {
    const date = new Date(dateString);
    const today = new Date();
    
    return date.toDateString() === today.toDateString();
  },

  // Kontrola zda je datum tento týden
  isThisWeek(dateString: string): boolean {
    const weekStart = this.getWeekStartString();
    const weekEnd = this.getWeekEndString();
    return this.isDateInRange(dateString, weekStart, weekEnd);
  },

  // Kontrola zda je datum tento měsíc
  isThisMonth(dateString: string): boolean {
    const monthStart = this.getMonthStartString();
    const monthEnd = this.getMonthEndString();
    return this.isDateInRange(dateString, monthStart, monthEnd);
  },

  // Kontrola zda je datum tento rok
  isThisYear(dateString: string): boolean {
    const yearStart = this.getYearStartString();
    const yearEnd = this.getYearEndString();
    return this.isDateInRange(dateString, yearStart, yearEnd);
  }
}; 