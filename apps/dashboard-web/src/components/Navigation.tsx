'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  { name: 'Dashboard', href: '/' },
  { name: 'Hashrate', href: '/hashrate' },
  { name: 'Policies', href: '/policies' },
  { name: 'Config', href: '/config' },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-gray-800 border-b border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-primary-400">
                XMRig Dashboard
              </h1>
            </div>
            <div className="ml-10">
              <div className="flex items-baseline space-x-4">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`nav-link ${
                        isActive ? 'nav-link-active' : 'nav-link-inactive'
                      }`}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-400">
            Web Dashboard v0.1.0
          </div>
        </div>
      </div>
    </nav>
  );
}