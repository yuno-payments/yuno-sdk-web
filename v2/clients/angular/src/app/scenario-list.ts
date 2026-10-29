import { ChangeDetectionStrategy, Component } from '@angular/core'
import { RouterLink } from '@angular/router'
import { scenarios } from './scenarios'

@Component({
  selector: 'app-scenario-list',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1>Universal SDK (v2) · Angular</h1>
    <p>Each route is one scenario: one standalone component, no shared abstraction beyond startTransaction().</p>
    <ul class="scenarios">
      @for (s of scenarios; track s.path) {
        <li><a [routerLink]="'/' + s.path">{{ s.title }}</a><small>{{ s.blurb }}</small></li>
      }
    </ul>
  `,
})
export class ScenarioList {
  protected readonly scenarios = scenarios
}
