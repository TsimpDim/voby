import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule, routes } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatOptionModule, MatRippleModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatGridListModule } from '@angular/material/grid-list';
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
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        MatToolbarModule,
        MatIconModule,
        MatButtonModule,
        MatGridListModule,
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
