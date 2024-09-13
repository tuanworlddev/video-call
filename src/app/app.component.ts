import {Component, computed, effect, Signal, signal, WritableSignal} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {count} from "rxjs";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
}
