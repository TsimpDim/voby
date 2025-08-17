import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { OptionsComponent } from './pages/options/options.component';
import { TwentyTestComponent } from './pages/twenty-test/twenty-test.component';
import { NounTestComponent } from './pages/german/noun-test/noun-test.component';
import { LoginFormComponent } from './components/forms/login-form/login-form.component';
import { RegisterFormComponent } from './components/forms/register-form/register-form.component';
import { WordListViewComponent } from './pages/word-list-view/word-list-view.component';
import { AuthGuardService } from './services/auth-guard.service';
import { LoggedInGuardService } from './services/logged-in-guard.service';

export const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: 'options',
    component: OptionsComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: 'test',
    component: TwentyTestComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: 'german/noun-test',
    component: NounTestComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: 'login',
    component: LoginFormComponent,
    canActivate: [LoggedInGuardService],
  },
  {
    path: 'register',
    component: RegisterFormComponent,
    canActivate: [LoggedInGuardService],
  },
  {
    path: 'set/:id',
    component: WordListViewComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: 'class/:id',
    component: WordListViewComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: '**',
    redirectTo: '',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
