import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class SidebarComponent {
  userRole: string = '';
  isCollapsed: boolean = false;

  constructor(private router: Router) {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      const user = JSON.parse(currentUser);
      this.userRole = user.role || '';
    }

    // Load collapsed state from localStorage
    const savedState = localStorage.getItem('sidebarCollapsed');
    this.isCollapsed = savedState === 'true';
  }

  hasAccess(roles: string[]): boolean {
    return roles.includes(this.userRole);
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    // Save state to localStorage
    localStorage.setItem('sidebarCollapsed', this.isCollapsed.toString());
  }

  logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    this.router.navigate(['/login']);
  }
}
