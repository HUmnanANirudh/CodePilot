import { createRouter, createRoute, createRootRoute } from '@tanstack/react-router';
import { AppLayout } from '@/components/layout/AppLayout';
import { LandingPage } from '@/features/repositories/pages/LandingPage';
import { RepositoryOverviewPage } from '@/features/repositories/pages/RepositoryOverviewPage';

const rootRoute = createRootRoute({
  component: AppLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage,
});

import { RepositoryListPage } from '@/features/repositories/pages/RepositoryListPage';

const repositoriesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/repositories',
  component: RepositoryListPage,
});

// removed unused repositoriesRoute

const repositoryOverviewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/repositories/$repoId',
  component: RepositoryOverviewPage,
});

import { SemanticSearchPage } from '@/features/search/pages/SemanticSearchPage';
import { ArchitecturePage } from '@/features/architecture/pages/ArchitecturePage';
import { DependencyGraphPage } from '@/features/dependency-insights/pages/DependencyGraphPage';
import { DeadCodePage } from '@/features/dead-code/pages/DeadCodePage';
import { HealthDashboardPage } from '@/features/analytics/pages/HealthDashboardPage';
import { GuidedTourPage } from '@/features/guided-tour/pages/GuidedTourPage';
import { OnboardingDocsPage } from '@/features/onboarding/pages/OnboardingDocsPage';
import { RepositorySettingsPage } from '@/features/repositories/pages/RepositorySettingsPage';

// Stubs for the rest of the routes
const searchRoute = createRoute({ getParentRoute: () => rootRoute, path: '/repositories/$repoId/search', component: SemanticSearchPage });
const architectureRoute = createRoute({ getParentRoute: () => rootRoute, path: '/repositories/$repoId/architecture', component: ArchitecturePage });
const dependenciesRoute = createRoute({ getParentRoute: () => rootRoute, path: '/repositories/$repoId/dependencies', component: DependencyGraphPage });
const deadCodeRoute = createRoute({ getParentRoute: () => rootRoute, path: '/repositories/$repoId/dead-code', component: DeadCodePage });
const healthRoute = createRoute({ getParentRoute: () => rootRoute, path: '/repositories/$repoId/health', component: HealthDashboardPage });
const guidedTourRoute = createRoute({ getParentRoute: () => rootRoute, path: '/repositories/$repoId/guided-tour', component: GuidedTourPage });
const onboardingRoute = createRoute({ getParentRoute: () => rootRoute, path: '/repositories/$repoId/onboarding', component: OnboardingDocsPage });
const settingsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/repositories/$repoId/settings', component: RepositorySettingsPage });

const routeTree = rootRoute.addChildren([
  indexRoute,
  repositoriesRoute,
  repositoryOverviewRoute,
  searchRoute,
  architectureRoute,
  dependenciesRoute,
  deadCodeRoute,
  healthRoute,
  guidedTourRoute,
  onboardingRoute,
  settingsRoute,
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
