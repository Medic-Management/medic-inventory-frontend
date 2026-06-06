import { Pipe, PipeTransform } from '@angular/core';
import { PreferencesService } from '../services/preferences.service';

/**
 * CP025: formatea un monto según la moneda elegida por el usuario.
 * Uso: {{ valor | appMoney }}
 * Impuro para reflejar cambios de preferencia sin recargar.
 */
@Pipe({ name: 'appMoney', standalone: true, pure: false })
export class AppMoneyPipe implements PipeTransform {
  constructor(private prefs: PreferencesService) {}

  transform(value: number | string | null | undefined): string {
    return this.prefs.formatMoney(value);
  }
}
