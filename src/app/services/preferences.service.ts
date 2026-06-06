import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * CP025: Preferencias de presentación del usuario (moneda, formato de fecha,
 * zona horaria). Se cargan desde Settings y se aplican en toda la app vía los
 * pipes appDate / appMoney. El idioma (i18n) NO se gestiona aquí.
 */
export interface AppPreferences {
  currency: string;    // 'PEN' | 'USD' | 'EUR'
  dateFormat: string;  // 'dd/mm/yyyy' | 'mm/dd/yyyy' | 'yyyy-mm-dd'
  timezone: string;    // ej. 'America/Lima'
}

const STORAGE_KEY = 'appPreferences';

const DEFAULTS: AppPreferences = {
  currency: 'PEN',
  dateFormat: 'dd/mm/yyyy',
  timezone: 'America/Lima',
};

// Símbolo y código por moneda soportada
const CURRENCY_META: Record<string, { symbol: string; locale: string }> = {
  PEN: { symbol: 'S/', locale: 'es-PE' },
  USD: { symbol: '$',  locale: 'en-US' },
  EUR: { symbol: '€',  locale: 'es-ES' },
};

@Injectable({ providedIn: 'root' })
export class PreferencesService {
  private prefs$ = new BehaviorSubject<AppPreferences>(this.loadInitial());

  /** Observable para que los pipes se re-evalúen cuando cambian las prefs. */
  readonly changes = this.prefs$.asObservable();

  private loadInitial(): AppPreferences {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
    } catch { /* usa defaults */ }
    return { ...DEFAULTS };
  }

  get current(): AppPreferences {
    return this.prefs$.value;
  }

  /** Actualiza las preferencias (parcial) y las persiste. */
  set(prefs: Partial<AppPreferences>): void {
    const merged = { ...this.prefs$.value, ...prefs };
    this.prefs$.next(merged);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(merged)); } catch { /* noop */ }
  }

  // ---- Helpers de formato ----

  /** Formatea una fecha según dateFormat + timezone. */
  formatDate(value: string | number | Date | null | undefined): string {
    if (value === null || value === undefined || value === '') return '—';
    const d = value instanceof Date ? value : new Date(value);
    if (isNaN(d.getTime())) return '—';

    const { dateFormat, timezone } = this.prefs$.value;

    // Extrae día/mes/año en la zona horaria elegida
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: timezone || undefined,
      day: '2-digit', month: '2-digit', year: 'numeric',
    }).formatToParts(d);

    const get = (t: string) => parts.find(p => p.type === t)?.value ?? '';
    const dd = get('day'), mm = get('month'), yyyy = get('year');

    switch (dateFormat) {
      case 'mm/dd/yyyy': return `${mm}/${dd}/${yyyy}`;
      case 'yyyy-mm-dd': return `${yyyy}-${mm}-${dd}`;
      case 'dd/mm/yyyy':
      default:           return `${dd}/${mm}/${yyyy}`;
    }
  }

  /** Formatea un monto según la moneda elegida. */
  formatMoney(value: number | string | null | undefined): string {
    const num = typeof value === 'string' ? parseFloat(value) : (value ?? 0);
    const safe = isNaN(num as number) ? 0 : (num as number);
    const meta = CURRENCY_META[this.prefs$.value.currency] || CURRENCY_META['PEN'];
    const formatted = new Intl.NumberFormat(meta.locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(safe);
    return `${meta.symbol} ${formatted}`;
  }

  get currencySymbol(): string {
    return (CURRENCY_META[this.prefs$.value.currency] || CURRENCY_META['PEN']).symbol;
  }
}
