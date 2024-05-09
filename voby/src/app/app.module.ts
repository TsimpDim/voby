import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HeaderComponent } from './header/header.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule, MatRippleModule } from '@angular/material/core';
import { FavoriteComponent } from './custom/favorite/favorite.component';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field'; 
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { ClassFormComponent } from './class-form/class-form.component';
import { MatDialogModule } from '@angular/material/dialog';
import { WordFormComponent } from './word-form/word-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginFormComponent } from './login-form/login-form.component';
import { RegisterFormComponent } from './register-form/register-form.component';
import { HttpClientModule } from '@angular/common/http';
import { SetFormComponent } from './set-form/set-form.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatGridListModule } from '@angular/material/grid-list';
import { OptionsComponent } from './options/options.component';
import { DashboardFlashComponent } from './dashboard-flash/dashboard-flash.component';
import { LoadingIndComponent } from './custom/loading-ind/loading-ind.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TwentyTestComponent } from './twenty-test/twenty-test.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { SnackbarComponent } from './custom/snackbar/snackbar.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { NounTestComponent } from './german/noun-test/noun-test.component';
import { MatBadgeModule } from '@angular/material/badge';
import { WordPreviewComponent } from './custom/word-preview/word-preview.component';
import { WordDetailPanelComponent } from './custom/word-detail-panel/word-detail-panel.component';
import { SingleWordRowComponent } from './custom/single-word-row/single-word-row.component';
import { WordListViewComponent } from './word-list-view/word-list-view.component';

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
    WordListViewComponent
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
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
