import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { LobbyComponent } from "./lobby.component";
import { ProfileComponent } from "../profile/profile.component";
import { AuthGuard } from "../../core/auth.guard";
import { PreferitiComponent } from "./components/preferiti/preferiti.component";
import { ChatComponent } from "./components/chat/chat.component";

export const routes: Routes = [
    {
        path: '',
        component: LobbyComponent
    },
    {
        path: 'profile',
        component: ProfileComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'preferiti',
        component: PreferitiComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'chat',
        component: ChatComponent,
        canActivate: [AuthGuard]
    }
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class LobbyRoutingModule { }