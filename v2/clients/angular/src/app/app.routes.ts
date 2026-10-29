import { Routes } from '@angular/router'
import { scenarios } from './scenarios'
import { ScenarioList } from './scenario-list'

export const routes: Routes = [
  { path: '', component: ScenarioList },
  ...scenarios.map((s) => ({ path: s.path, loadComponent: s.load })),
]
