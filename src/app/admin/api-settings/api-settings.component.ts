import { Component } from '@angular/core';
import { MatCardHeader, MatCardModule } from "@angular/material/card";
import { MatCard } from "../../../../node_modules/@angular/material/card/index";

@Component({
  selector: 'app-api-settings',
  imports: [
    MatCardModule
  ],
  templateUrl: './api-settings.component.html',
  styleUrl: './api-settings.component.scss'
})
export class ApiSettingsComponent {

}
