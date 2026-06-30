import Link from 'next/link';

type EntityLinkProps = {
  href: string;
  children: React.ReactNode;
  title?: string;
};

export function EntityLink({ href, children, title }: EntityLinkProps) {
  return (
    <Link
      href={href}
      title={title}
      className="font-black text-cyan-100 underline decoration-cyan-300/30 underline-offset-4 transition hover:text-amber-100 hover:decoration-amber-200"
    >
      {children}
    </Link>
  );
}

export function entityQueryHref(basePath: string, key: string, value: string) {
  const params = new URLSearchParams();
  params.set(key, value);
  return `${basePath}?${params.toString()}`;
}

export function itemHref(slug: string, fallbackName: string) {
  return slug ? `/items/detail/${slug}` : entityQueryHref('/items', 'item', fallbackName);
}
