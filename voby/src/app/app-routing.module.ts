import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginFormComponent } from './login-form/login-form.component';
import { OptionsComponent } from './options/options.component';
import { RegisterFormComponent } from './register-form/register-form.component';
import { TwentyTestComponent } from './twenty-test/twenty-test.component';
import { AuthGuardService as AuthGuard } from './_services/auth-guard.service';
import { LoggedInGuardService as LoggedInGuard} from './_services/logged-in-guard.service';
import { NounTestComponent } from './german/noun-test/noun-test.component';
import { WordListViewComponent } from './word-list-view/word-list-view.component';

const routes: Routes = [
  {
    path: '', component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'dashboard', component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'options', component: OptionsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'test', component: TwentyTestComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'german/noun-test', component: NounTestComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'login', component: LoginFormComponent,
    canActivate: [LoggedInGuard]
  },
  {
    path: 'register', component: RegisterFormComponent,
    canActivate: [LoggedInGuard]
  },
  {
    path: 'set/:id', component: WordListViewComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'class/:id', component: WordListViewComponent,
    canActivate: [AuthGuard]
  },
  {
    path: '**', redirectTo: ''
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
