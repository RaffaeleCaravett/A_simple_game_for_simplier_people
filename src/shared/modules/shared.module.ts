import { provideHttpClient } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { ToastrModule } from "ngx-toastr";
import { SpinnerComponent } from "../components/spinner/spinner.component";
import { CommonModule } from "@angular/common";
import { SkeletonComponent } from "../components/skeleton/skeleton.component";

@NgModule({
      declarations: [
        SpinnerComponent,
        SkeletonComponent
      ],
      imports: [
        CommonModule,
        ToastrModule.forRoot(),
      ],
      exports: [
        SpinnerComponent,
        SkeletonComponent
      ],
      providers: [
        provideHttpClient()
      ]
    })
export class SharedModule {}

