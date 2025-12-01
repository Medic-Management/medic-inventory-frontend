import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { InventoryComponent } from './pages/inventory/inventory';
import { LoginComponent } from './pages/login/login';
import { ProductDetailComponent } from './pages/product-detail/product-detail';
import { ReportsComponent } from './pages/reports/reports';
import { ProfileComponent } from './pages/profile/profile';
import { SettingsComponent } from './pages/settings/settings';
import { OrdersComponent } from './pages/orders/orders';
import { RestockDetailComponent } from './pages/restock-detail/restock-detail';
import { EntradasComponent } from './pages/entradas/entradas';
import { SolicitudesComponent } from './pages/solicitudes/solicitudes';
import { UsuariosComponent } from './pages/usuarios/usuarios';
import { ProveedoresComponent } from './pages/proveedores/proveedores';
import { UmbralesComponent } from './pages/umbrales/umbrales';
import { DispensacionesComponent } from './pages/dispensaciones/dispensaciones';
import { MlPredictionsComponent } from './pages/ml-predictions/ml-predictions';
import { AlertasComponent } from './pages/alertas/alertas';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'inventario', component: InventoryComponent },
      { path: 'alertas', component: AlertasComponent },
      { path: 'dispensaciones', component: DispensacionesComponent, data: { roles: ['Farmaceutico', 'JefeDeFarmacia', 'Administrador'] } },
      { path: 'reportes', component: ReportsComponent, data: { roles: ['JefeDeFarmacia', 'Administrador'] } },
      { path: 'ordenes', component: OrdersComponent, data: { roles: ['AuxiliarDeAlmacen', 'JefeDeFarmacia', 'Administrador'] } },
      { path: 'entradas', component: EntradasComponent, data: { roles: ['AuxiliarDeAlmacen', 'JefeDeFarmacia', 'Administrador'] } },
      { path: 'solicitudes', component: SolicitudesComponent, data: { roles: ['AuxiliarDeAlmacen', 'JefeDeFarmacia', 'Administrador'] } },
      { path: 'producto/:id', component: ProductDetailComponent },
      { path: 'reabastecimiento/:id', component: RestockDetailComponent, data: { roles: ['AuxiliarDeAlmacen', 'JefeDeFarmacia', 'Administrador'] } },
      { path: 'usuarios', component: UsuariosComponent, data: { roles: ['JefeDeFarmacia', 'Administrador'] } },
      { path: 'proveedores', component: ProveedoresComponent, data: { roles: ['JefeDeFarmacia', 'Administrador'] } },
      { path: 'umbrales', component: UmbralesComponent, data: { roles: ['JefeDeFarmacia', 'Administrador'] } },
      { path: 'predicciones-ml', component: MlPredictionsComponent, data: { roles: ['JefeDeFarmacia', 'Administrador'] } },
      { path: 'perfil', component: ProfileComponent },
      { path: 'configuracion', component: SettingsComponent }
    ]
  }
];
