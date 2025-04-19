import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule, routes } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatRippleModule } from '@angular/material/core';
import { MatLegacyOptionModule as MatOptionModule } from '@angular/material/legacy-core';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field'; 
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from '@angular/material/legacy-autocomplete';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatLegacyProgressBarModule as MatProgressBarModule } from '@angular/material/legacy-progress-bar';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';
import { MatBadgeModule } from '@angular/material/badge';
import { provideRouter, withRouterConfig } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { FavoriteComponent } from './components/custom/favorite/favorite.component';
import { ClassFormComponent } from './components/forms/class-form/class-form.component';
import { WordFormComponent } from './components/forms/word-form/word-form.component';
import { LoginFormComponent } from './components/forms/login-form/login-form.component';
import { RegisterFormComponent } from './components/forms/register-form/register-form.component';
import { SetFormComponent } from './components/forms/set-form/set-form.component';
import { OptionsComponent } from './pages/options/options.component';
import { DashboardFlashComponent } from './components/dashboard-flash/dashboard-flash.component';
import { LoadingIndComponent } from './components/custom/loading-ind/loading-ind.component';
import { TwentyTestComponent } from './pages/twenty-test/twenty-test.component';
import { SnackbarComponent } from './components/custom/snackbar/snackbar.component';
import { NounTestComponent } from './pages/german/noun-test/noun-test.component';
import { WordPreviewComponent } from './components/word-preview/word-preview.component';
import { WordDetailPanelComponent } from './components/word-detail-panel/word-detail-panel.component';
import { SingleWordRowComponent } from './components/single-word-row/single-word-row.component';
import { WordListViewComponent } from './pages/word-list-view/word-list-view.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';

@NgModule({
    declarations: [AppComponent],
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
        MatBadgeModule,
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
    providers: [
        provideRouter(routes, withRouterConfig({ onSameUrlNavigation: 'reload' })),
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
