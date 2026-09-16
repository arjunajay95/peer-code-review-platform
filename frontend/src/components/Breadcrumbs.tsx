import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const crumbs: BreadcrumbItem[] = [{ label: "Feed", href: "/" }, ...items];

  return (
    <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={i} className="flex items-center gap-1.5">
            {crumb.href && !isLast ? (
              <Link href={crumb.href} className="hover:text-indigo-600 dark:hover:text-indigo-400">
                {crumb.label}
              </Link>
            ) : (
              <span className={`max-w-xs truncate ${isLast ? "text-zinc-700 dark:text-zinc-300" : ""}`}>{crumb.label}</span>
            )}
            {!isLast && <span aria-hidden="true">/</span>}
          </span>
        );
      })}
    </nav>
  );
}
