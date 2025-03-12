'use client';

import { lazy, ReactNode, Suspense } from 'react';
import { usePathname } from 'next/navigation';

// project imports
import Loader from 'components/Loader';
import { SimpleLayoutType } from 'config';

const Header = lazy(() => import('./Header'));
const FooterBlock = lazy(() => import('./FooterBlock'));

interface Props {
  children: ReactNode;
}

// ==============================|| LAYOUT - SIMPLE / LANDING ||============================== //

export default function SimpleLayout({ children }: Props) {
  const pathname = usePathname();
  const layout: string = pathname === 'landing' || pathname === '/' ? SimpleLayoutType.LANDING : SimpleLayoutType.SIMPLE;

  return (
    <Suspense fallback={<Loader />}>
      <Header />
      {children}
      <FooterBlock isFull={layout === SimpleLayoutType.LANDING} />
    </Suspense>
  );
}
