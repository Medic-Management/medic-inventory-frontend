import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';
import { SettingsService } from '../../services/settings.service';
import { PreferencesService } from '../../services/preferences.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  errorMessage: string = '';
  isSubmitting: boolean = false;
  showPassword: boolean = false;

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  constructor(
    private router: Router,
    private http: HttpClient,
    private fb: FormBuilder,
    private settingsService: SettingsService,
    private preferences: PreferencesService
  ) {}

  // CP025: carga las preferencias de presentación del usuario tras autenticar
  private cargarPreferencias(userId: number): void {
    if (!userId) return;
    this.settingsService.getUserSettings(userId).subscribe({
      next: (s) => this.preferences.set({
        currency: s.currency,
        dateFormat: s.dateFormat,
        timezone: s.timezone,
      }),
      error: () => { /* mantiene las preferencias por defecto */ }
    });
  }

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }

  onSubmit() {
    if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.errorMessage = '';
    this.isSubmitting = true;

    const loginData = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password,
      rememberMe: this.loginForm.value.rememberMe
    };

    console.log('[LOGIN] Enviando request de login...');
    this.http.post<any>(`${environment.apiUrl}/auth/login`, loginData)
      .subscribe({
        next: (response) => {
          console.log('[LOGIN] Response recibida:', response);
          localStorage.setItem('token', response.token);
          localStorage.setItem('currentUser', JSON.stringify({
            userId: response.userId,
            email: response.email,
            fullName: response.fullName,
            role: response.role
          }));
          console.log('[LOGIN] Token guardado:', response.token);

          // CP025: aplica las preferencias de presentación del usuario
          this.cargarPreferencias(response.userId);

          this.isSubmitting = false;
          console.log('[LOGIN] Navegando a dashboard...');
          this.router.navigate(['/dashboard']).then(
            () => console.log('[LOGIN] Navegación exitosa'),
            (err) => console.error('[LOGIN] Error en navegación:', err)
          );
        },
        error: (error) => {
          console.error('[LOGIN] Error en request:', error);
          this.errorMessage = 'Credenciales inválidas. Por favor, intente nuevamente.';
          this.isSubmitting = false;
        }
      });
  }
}
