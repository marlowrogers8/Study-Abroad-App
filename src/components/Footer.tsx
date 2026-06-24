import { Logo } from "./Logo";
import { ShieldCheckIcon } from "./icons";

const columns = [
  {
    heading: "Explore",
    links: ["Programs", "Destinations", "Rankings", "Scholarships"],
  },
  {
    heading: "Company",
    links: ["About us", "Our pledge", "Careers", "Press"],
  },
  {
    heading: "Resources",
    links: ["Student guides", "Cost calculator", "Safety reports", "Blog"],
  },
  {
    heading: "Legal",
    links: ["Privacy", "Terms", "Review policy", "Contact"],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-ink-100 bg-white">
      <div className="container-page py-14">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_2fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-600">
              The transparent way to choose a study abroad program. Real reviews,
              real data — never paid, never sponsored.
            </p>
            <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700">
              <ShieldCheckIcon className="h-4 w-4" />
              Zero paid placements, ever
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {columns.map((col) => (
              <div key={col.heading}>
                <h3 className="text-sm font-semibold text-ink-900">{col.heading}</h3>
                <ul className="mt-3 space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-sm text-ink-500 transition-colors hover:text-brand-700"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-ink-100 pt-6 sm:flex-row">
          <p className="text-xs text-ink-400">
            © {new Date().getFullYear()} Abroadly. All rights reserved.
          </p>
          <p className="text-xs text-ink-400">
            Built by students, for students.
          </p>
        </div>
      </div>
    </footer>
  );
}
