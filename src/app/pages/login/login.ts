import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

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

  constructor(
    private router: Router,
    private http: HttpClient,
    private fb: FormBuilder
  ) {}

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
    this.http.post<any>('/api/auth/login', loginData)
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
