import { Helmet } from 'react-helmet-async';
import { useStoreSettings } from '@/context/StoreSettingsContext';
import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from '@/hooks/use-auth';
import { CartProvider } from '@/hooks/use-cart';
import { MainLayout } from '@/layouts/MainLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { Toaster } from '@/components/ui/toaster';

const HomePage = lazy(() => import('@/pages/HomePage').then((m) => ({ default: m.HomePage })));
const ProductsPage = lazy(() => import('@/pages/ProductsPage').then((m) => ({ default: m.ProductsPage })));
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage').then((m) => ({ default: m.ProductDetailPage })));
const BundlesPage = lazy(() => import('@/pages/BundlesPage').then((m) => ({ default: m.BundlesPage })));
const AboutPage = lazy(() => import('@/pages/AboutPage').then((m) => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import('@/pages/ContactPage').then((m) => ({ default: m.ContactPage })));
const FaqPage = lazy(() => import('@/pages/FaqPage').then((m) => ({ default: m.FaqPage })));
const AuthPage = lazy(() => import('@/pages/AuthPage').then((m) => ({ default: m.AuthPage })));
const ResetPasswordPage = lazy(() => import('@/pages/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })));
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage').then((m) => ({ default: m.CheckoutPage })));
const AdminPage = lazy(() => import('@/pages/AdminPage').then((m) => ({ default: m.AdminPage })));
const ProfilePage = lazy(() => import('@/pages/ProfilePage').then((m) => ({ default: m.ProfilePage })));

function PageFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}

const withSuspense = (element: React.ReactNode) => <Suspense fallback={<PageFallback />}>{element}</Suspense>;

const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: '/', element: withSuspense(<HomePage />) },
      { path: '/products', element: withSuspense(<ProductsPage />) },
      { path: '/products/:slug', element: withSuspense(<ProductDetailPage />) },
      { path: '/bundles', element: withSuspense(<BundlesPage />) },
      { path: '/about', element: withSuspense(<AboutPage />) },
      { path: '/contact', element: withSuspense(<ContactPage />) },
      { path: '/faq', element: withSuspense(<FaqPage />) },
      { path: '/auth', element: withSuspense(<AuthPage />) },
      { path: '/reset-password', element: withSuspense(<ResetPasswordPage />) },
      { path: '/checkout', element: withSuspense(<CheckoutPage />) },
      { path: '/profile', element: withSuspense(<ProfilePage />) },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [{ index: true, element: withSuspense(<AdminPage />) },
      { path: 'auth', element: withSuspense(<AuthPage />) },
    ],
  },
]);

function SiteMetadata() {
  const { settings } = useStoreSettings();

  const faviconUrl = settings.favicon_url || '/favicon.svg';

  return (
    <Helmet>
      <link rel="icon" href={faviconUrl} />
    </Helmet>
  );
}

export default function App() {
  return (
    <>
      <SiteMetadata />
      <AuthProvider>
        <CartProvider>
          <RouterProvider router={router} />
          <Toaster />
        </CartProvider>
      </AuthProvider>
    </>
  );
}

