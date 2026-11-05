import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core'
import { RouterLink } from '@angular/router'
import { scenarios } from './scenarios'

/** Back link, title, blurb, the scenario's own markup, then the status line. */
@Component({
  selector: 'app-scenario',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="back" routerLink="/">← All scenarios</a>
    <h1>{{ meta().title }}</h1>
    <p>{{ meta().blurb }}</p>
    <ng-content />
    <p id="status" class="status">{{ status() }}</p>
  `,
})
export class ScenarioShell {
  readonly path = input.required<string>()
  readonly status = input('')
  protected readonly meta = computed(() => scenarios.find((s) => s.path === this.path())!)
}
