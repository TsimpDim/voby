import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AllWordsComponent } from './all-words/all-words.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginFormComponent } from './login-form/login-form.component';
import { OptionsComponent } from './options/options.component';
import { RegisterFormComponent } from './register-form/register-form.component';
import { SetComponent } from './set/set.component';
import { TwentyTestComponent } from './twenty-test/twenty-test.component';
import { AuthGuardService as AuthGuard } from './_services/auth-guard.service';
import { LoggedInGuardService as LoggedInGuard} from './_services/logged-in-guard.service';

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
    path: 'login', component: LoginFormComponent,
    canActivate: [LoggedInGuard]
  },
  {
    path: 'register', component: RegisterFormComponent,
    canActivate: [LoggedInGuard]
  },
  {
    path: 'set/:id', component: SetComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'class/:id', component: AllWordsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: '*', component: DashboardComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
