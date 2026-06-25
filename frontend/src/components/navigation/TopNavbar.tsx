import { ThemeToggle } from "../ThemeToggle";

export function TopNavbar() {
  return (
    <header className="h-14 linear-glass flex items-center justify-between px-6 z-10 sticky top-0">
      <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
        {/* Breadcrumbs or Contextual title could go here */}
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
      </div>
    </header>
  );
}
