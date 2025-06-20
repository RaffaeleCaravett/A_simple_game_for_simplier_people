import { RouterModule, Routes } from "@angular/router";
import { FormsComponent } from "./forms.component";
import { NgModule } from "@angular/core";
import { LoginComponent } from "./components/login/login.component";
import { SignupComponent } from "./components/signup/signup.component";
import { NotFoundComponent } from "../not-found/not-found.component";

export const routes: Routes = [
    {
        path: '',
        component: FormsComponent
    },
    { path: 'login', component: LoginComponent, },
    { path: 'signup', component: SignupComponent },
    {
        path: '**',
        component: NotFoundComponent
    }
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class FormsRoutingModule { }