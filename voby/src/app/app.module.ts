import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule, routes } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HeaderComponent } from './header/header.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatRippleModule } from '@angular/material/core';
import { MatLegacyOptionModule as MatOptionModule } from '@angular/material/legacy-core';
import { FavoriteComponent } from './custom/favorite/favorite.component';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field'; 
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips';
import { MatDividerModule } from '@angular/material/divider';
import { ClassFormComponent } from './class-form/class-form.component';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { WordFormComponent } from './word-form/word-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginFormComponent } from './login-form/login-form.component';
import { RegisterFormComponent } from './register-form/register-form.component';
import { HttpClientModule } from '@angular/common/http';
import { SetFormComponent } from './set-form/set-form.component';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from '@angular/material/legacy-autocomplete';
import { MatGridListModule } from '@angular/material/grid-list';
import { OptionsComponent } from './options/options.component';
import { DashboardFlashComponent } from './dashboard-flash/dashboard-flash.component';
import { LoadingIndComponent } from './custom/loading-ind/loading-ind.component';
import { MatLegacyProgressBarModule as MatProgressBarModule } from '@angular/material/legacy-progress-bar';
import { TwentyTestComponent } from './twenty-test/twenty-test.component';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { SnackbarComponent } from './custom/snackbar/snackbar.component';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';
import { NounTestComponent } from './german/noun-test/noun-test.component';
import { MatBadgeModule } from '@angular/material/badge';
import { WordPreviewComponent } from './custom/word-preview/word-preview.component';
import { WordDetailPanelComponent } from './custom/word-detail-panel/word-detail-panel.component';
import { SingleWordRowComponent } from './custom/single-word-row/single-word-row.component';
import { WordListViewComponent } from './word-list-view/word-list-view.component';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { provideRouter, withRouterConfig } from '@angular/router';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    DashboardComponent,
    FavoriteComponent,
    ClassFormComponent,
    WordFormComponent,
    LoginFormComponent,
    RegisterFormComponent,
    SetFormComponent,
    OptionsComponent,
    DashboardFlashComponent,
    LoadingIndComponent,
    TwentyTestComponent,
    SnackbarComponent,
    NounTestComponent,
    WordPreviewComponent,
    WordDetailPanelComponent,
    SingleWordRowComponent,
    WordListViewComponent,
    ConfirmDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatCardModule,
    MatExpansionModule,
    MatRippleModule,
    MatInputModule,
    MatFormFieldModule,
    MatChipsModule,
    MatDividerModule,
    MatDialogModule,
    MatOptionModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    MatSelectModule,
    MatMenuModule,
    MatAutocompleteModule,
    MatGridListModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatSlideToggleModule,
    MatBadgeModule
  ],
  providers: [
    provideRouter(routes, withRouterConfig({onSameUrlNavigation: 'reload'})),
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
