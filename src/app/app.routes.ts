import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { LandingComponent } from './components/landing/landing.component';

export const routes: Routes = [
    {
        path:'',component:LoginComponent
    },
    {
        path:'landing',component:LandingComponent
    }
];
