import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AuthGuard } from "../../core/auth.guard";
import { AdministrationComponent } from "./administration.component";

export const routes: Routes = [
    {
        path: '',
        component: AdministrationComponent
        }
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AdministrationRoutingModule { }