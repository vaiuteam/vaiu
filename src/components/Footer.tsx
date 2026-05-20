import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Logo2 } from "@/components/Logo2";

const CURRENT_YEAR = new Date().getFullYear();

const Footer = () => {
  const supportLinks = [
    { label: "Contact", href: "/contact" },
  ];

  const resourceLinks = [
    { label: "Documentation", href: "/docs" },
    { label: "Blog", href: "https://medium.com/@prathyarti/vaiu-d9e33ef48464" },
    { label: "FAQ", href: "/faq" },
  ];

  const socialLinks = [
    {
      label: "GitHub",
      href: "https://github.com/KiranBusari/vaiu",
    },
  ];

  return (
    <footer className="w-full border-t dark:border-slate-800 border-slate-200">
      <div className="container mx-auto px-4 py-6 md:px-6 md:py-8">
        {/* Main Footer Content */}
        <div className="mb-5 flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between sm:gap-10 lg:gap-16">
          {/* Branding - Column 1 */}
          <div className="max-w-sm shrink-0">
            <Link href="/" className="mb-2 -ml-2 inline-flex items-center transition-opacity hover:opacity-80">
              <Logo className="h-7 w-auto dark:hidden" />
              <Logo2 className="hidden h-7 w-auto dark:block" />
            </Link>
            <p className="text-sm leading-snug text-slate-600 dark:text-slate-400">
              Empowering teams to collaborate and build together.
            </p>
          </div>

          <div className="grid shrink-0 grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-3 sm:gap-x-10">

            {/* Support Links */}
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">
                Support
              </h3>
              <nav className="space-y-2">
                {supportLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors font-medium"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Connect */}
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">
                Connect
              </h3>
              <nav className="space-y-2">
                {socialLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors font-medium group"
                  >
                    {link.label}
                  </a>
                ))}
                <a
                  href="mailto:contact.vaiuteam@gmail.com"
                  className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
                >
                  Email
                </a>
              </nav>
            </div>

            {/* Resources */}
            <div className="col-span-2 sm:col-span-1">
              <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">
                Resources
              </h3>
              <nav className="space-y-2">
                {resourceLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors font-medium"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

          </div>
        </div>
        {/* Divider */}
        <div className="border-t border-slate-200 pt-4 dark:border-slate-800 md:pt-5">
          <div className="flex flex-col items-center justify-between gap-3 text-xs text-slate-600 sm:flex-row sm:text-sm dark:text-slate-400">
            <p>© {CURRENT_YEAR} Vaiu. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="/terms" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/privacy" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;