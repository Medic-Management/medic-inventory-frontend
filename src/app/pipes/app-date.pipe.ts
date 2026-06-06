import { Pipe, PipeTransform } from '@angular/core';
import { PreferencesService } from '../services/preferences.service';

/**
 * CP025: formatea una fecha según la preferencia del usuario (formato + zona).
 * Uso: {{ valor | appDate }}
 * Impuro para reflejar cambios de preferencia sin recargar.
 */
@Pipe({ name: 'appDate', standalone: true, pure: false })
export class AppDatePipe implements PipeTransform {
  constructor(private prefs: PreferencesService) {}

  transform(value: string | number | Date | null | undefined): string {
    return this.prefs.formatDate(value);
  }
}
