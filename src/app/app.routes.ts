import { Routes } from '@angular/router';
import { HomeComponent } from '../components/home/home.component';
import { GameFieldComponent } from '../components/game-field/game-field.component';
import { NotFoundComponent } from '../components/not-found/not-found.component';
import { AuthGuard } from '../core/auth.guard';
import { ProfileComponent } from '../components/profile/profile.component';

export const routes: Routes = [
    
    {
        path:'forms',
        loadChildren: () => import('../components/forms/forms.module').then(m => m.FormsModule)
    },
    {
        path:'',
        redirectTo:'home',
        pathMatch: 'full'
    },
    {
        path:'home',
        component:HomeComponent
    },
    {
        path:'lobby',
        loadChildren: () => import('../components/lobby/lobby.module').then(m => m.LobbyModule),
         canActivate:[AuthGuard]
    },
    {
        path:'game-field',
        component:GameFieldComponent, canActivate:[AuthGuard]
    },
    {
        path:'**',
        component:NotFoundComponent
    }
];
