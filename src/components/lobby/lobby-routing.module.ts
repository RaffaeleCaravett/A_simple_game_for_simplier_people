import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { LobbyComponent } from "./lobby.component";

export const routes: Routes = [
    {
        path: '',
        component: LobbyComponent
    }
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class LobbyRoutingModule { }