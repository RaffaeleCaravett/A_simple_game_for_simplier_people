import { provideHttpClient } from "@angular/common/http";
import { AdministrationComponent } from "./administration.component";
import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { MatDialogModule } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { RouterModule } from "@angular/router";
import { ToastrModule } from "ngx-toastr";
import { SharedModule } from "../../shared/modules/shared.module";
import { AdministrationRoutingModule } from "./administration-routing.module";

@NgModule({
  declarations: [
   AdministrationComponent
  ],
  imports: [
    AdministrationRoutingModule,
    CommonModule,
    ReactiveFormsModule,
    ToastrModule.forRoot(),
    MatDialogModule,
    MatIconModule,
    RouterModule,
    SharedModule
  ],
  exports: [
  ],
  providers: [
    provideHttpClient()
  ]
})
export class AdministrationModule {}