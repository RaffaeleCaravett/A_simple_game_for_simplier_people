import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AuthGuard } from "../../core/auth.guard";
import { AdministrationComponent } from "./administration.component";
import { AdGiochiComponent } from "./component/ad-giochi/ad-giochi.component";
import { AdCategorieComponent } from "./component/ad-categorie/ad-categorie.component";
import { AdTorneiComponent } from "./component/ad-tornei/ad-tornei.component";
import { AdUtentiComponent } from "./component/ad-utenti/ad-utenti.component";
import { AdMessaggiComponent } from "./component/ad-messaggi/ad-messaggi.component";

export const routes: Routes = [
    {
        path: '',
        component: AdministrationComponent,
        children: [
            {
                path: 'giochi',
                component: AdGiochiComponent
            },
            {
                path: 'categorie',
                component: AdCategorieComponent
            },
            {
                path: 'tornei',
                component: AdTorneiComponent
            },
            {
                path: 'utenti',
                component: AdUtentiComponent
            },
            {
                path: 'messaggi',
                component: AdMessaggiComponent
            },
        ]
    }
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AdministrationRoutingModule { }