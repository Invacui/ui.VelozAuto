   import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { MarketingLayout } from '@/routes/marketing/Layout';
import { AuthLayout } from '@/routes/auth/Layout';
import { AccountLayout } from '@/routes/account/Layout';
import { AdminLayout } from '@/routes/admin/Layout';
import { AuthGuard, StaffGuard } from '@/guards/AuthGuard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ROUTES } from '@/constants/routes';

const withSuspense = (node: React.ReactNode) => (
  <Suspense fallback={<LoadingSpinner className="min-h-[50vh]" size="lg" />}>{node}</Suspense>
);

/* ---- Marketing ---- */
const Home = lazy(() => import('@/routes/marketing/Home'));
const Vehicles = lazy(() => import('@/routes/marketing/Vehicles'));
const VehicleDetail = lazy(() => import('@/routes/marketing/VehicleDetail'));
const Compare = lazy(() => import('@/routes/marketing/Compare'));
const Wishlist = lazy(() => import('@/routes/marketing/Wishlist'));
const Sell = lazy(() => import('@/routes/marketing/Sell'));
const EmiCalculator = lazy(() => import('@/routes/marketing/EmiCalculator'));
const About = lazy(() => import('@/routes/marketing/About'));
const Contact = lazy(() => import('@/routes/marketing/Contact'));
const Faq = lazy(() => import('@/routes/marketing/Faq'));
const Privacy = lazy(() => import('@/routes/marketing/Privacy'));
const Terms = lazy(() => import('@/routes/marketing/Terms'));

/* ---- Auth ---- */
const Login = lazy(() => import('@/routes/auth/Login'));
const Signup = lazy(() => import('@/routes/auth/Signup'));
const ForgotPassword = lazy(() => import('@/routes/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('@/routes/auth/ResetPassword'));
const VerifyEmail = lazy(() => import('@/routes/auth/VerifyEmail'));

/* ---- Account ---- */
const AccountOverview = lazy(() => import('@/routes/account/Overview'));
const AccountBuyRequests = lazy(() => import('@/routes/account/BuyRequests'));
const AccountSellRequests = lazy(() => import('@/routes/account/SellRequests'));
const AccountChats = lazy(() => import('@/routes/account/Chats'));
const AccountProfile = lazy(() => import('@/routes/account/Profile'));

/* ---- Admin ---- */
const AdminDashboard = lazy(() => import('@/routes/admin/Dashboard'));
const AdminVehicles = lazy(() => import('@/routes/admin/Vehicles'));
const AdminVehicleForm = lazy(() => import('@/routes/admin/VehicleForm'));
const AdminBuyRequests = lazy(() => import('@/routes/admin/BuyRequests'));
const AdminSellRequests = lazy(() => import('@/routes/admin/SellRequests'));
const AdminMasterData = lazy(() => import('@/routes/admin/MasterData'));
const AdminUsers = lazy(() => import('@/routes/admin/Users'));
const AdminChat = lazy(() => import('@/routes/admin/Chat'));
const AdminBanners = lazy(() => import('@/routes/admin/Banners'));
const AdminTestimonials = lazy(() => import('@/routes/admin/Testimonials'));
const AdminFaq = lazy(() => import('@/routes/admin/Faq'));
const AdminSeo = lazy(() => import('@/routes/admin/Seo'));
const AdminContacts = lazy(() => import('@/routes/admin/Contacts'));
const AdminLegal = lazy(() => import('@/routes/admin/Legal'));
const AdminSettings = lazy(() => import('@/routes/admin/Settings'));

const NotFound = lazy(() => import('@/routes/NotFound'));
const ErrorPage = lazy(() => import('@/routes/ErrorPage'));

export const router = createBrowserRouter([
  {
    path: ROUTES.home,
    element: <MarketingLayout />,
    errorElement: withSuspense(<ErrorPage />),
    children: [
      { index: true, element: withSuspense(<Home />) },
      { path: 'vehicles', element: withSuspense(<Vehicles />) },
      { path: 'vehicles/:slug', element: withSuspense(<VehicleDetail />) },
      { path: 'compare', element: withSuspense(<Compare />) },
      { path: 'wishlist', element: withSuspense(<Wishlist />) },
      { path: 'sell', element: withSuspense(<Sell />) },
      { path: 'emi-calculator', element: withSuspense(<EmiCalculator />) },
      { path: 'about', element: withSuspense(<About />) },
      { path: 'contact', element: withSuspense(<Contact />) },
      { path: 'faq', element: withSuspense(<Faq />) },
      { path: 'privacy', element: withSuspense(<Privacy />) },
      { path: 'terms', element: withSuspense(<Terms />) },
    ],
  },
  {
    element: <AuthLayout />,
    errorElement: withSuspense(<ErrorPage />),
    children: [
      { path: ROUTES.login, element: withSuspense(<Login />) },
      { path: ROUTES.signup, element: withSuspense(<Signup />) },
      { path: ROUTES.forgotPassword, element: withSuspense(<ForgotPassword />) },
      { path: ROUTES.resetPassword, element: withSuspense(<ResetPassword />) },
      { path: ROUTES.verifyEmail, element: withSuspense(<VerifyEmail />) },
    ],
  },
  {
    path: ROUTES.account.root,
    element: <AuthGuard><AccountLayout /></AuthGuard>,
    errorElement: withSuspense(<ErrorPage />),
    children: [
      { index: true, element: withSuspense(<AccountOverview />) },
      { path: 'buy-requests', element: withSuspense(<AccountBuyRequests />) },
      { path: 'sell-requests', element: withSuspense(<AccountSellRequests />) },
      { path: 'chats', element: withSuspense(<AccountChats />) },
      { path: 'profile', element: withSuspense(<AccountProfile />) },
    ],
  },
  {
    path: ROUTES.admin.root,
    element: <StaffGuard><AdminLayout /></StaffGuard>,
    errorElement: withSuspense(<ErrorPage />),
    children: [
      { index: true, element: withSuspense(<AdminDashboard />) },
      { path: 'vehicles', element: withSuspense(<AdminVehicles />) },
      { path: 'vehicles/new', element: withSuspense(<AdminVehicleForm />) },
      { path: 'vehicles/:id/edit', element: withSuspense(<AdminVehicleForm />) },
      { path: 'buy-requests', element: withSuspense(<AdminBuyRequests />) },
      { path: 'sell-requests', element: withSuspense(<AdminSellRequests />) },
      { path: 'master-data', element: withSuspense(<AdminMasterData />) },
      { path: 'users', element: withSuspense(<AdminUsers />) },
      { path: 'chat', element: withSuspense(<AdminChat />) },
      { path: 'banners', element: withSuspense(<AdminBanners />) },
      { path: 'testimonials', element: withSuspense(<AdminTestimonials />) },
      { path: 'faq', element: withSuspense(<AdminFaq />) },
      { path: 'seo', element: withSuspense(<AdminSeo />) },
      { path: 'contacts', element: withSuspense(<AdminContacts />) },
      { path: 'legal', element: withSuspense(<AdminLegal />) },
      { path: 'settings', element: withSuspense(<AdminSettings />) },
    ],
  },
  {
    path: '*',
    element: <MarketingLayout />,
    errorElement: withSuspense(<ErrorPage />),
    children: [{ path: '*', element: withSuspense(<NotFound />) }],
  },
]);

export default router;
