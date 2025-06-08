import { StrictMode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ReactDOM from 'react-dom/client'
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import './types/leaflet-draw.d.ts'
// import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import './styles.css'

import { CookiesProvider } from 'react-cookie'
import { ToastContainer } from 'react-toastify'
import EndUserMap from './components/screens/EndUserMap.tsx'
import AdminPanel from './components/screens/AdminPanel.tsx'
import { GeoProvider } from './contexts/GeoContext.tsx'
import { BusLineProvider } from './contexts/BusLineContext.tsx'
import { TooltipProvider } from './components/ui/tooltip.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      {/* <TanStackRouterDevtools /> */}
    </>
  ),
})

const mapRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: EndUserMap,
})

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/',
  component: AdminPanel,
})

const routeTree = rootRoute.addChildren([mapRoute, adminRoute])

const router = createRouter({
  routeTree,
  context: {},
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const queryClient = new QueryClient()

const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <CookiesProvider defaultSetOptions={{ path: '/' }}>
        <QueryClientProvider client={queryClient}>
          <GeoProvider>
            <AuthProvider>
              <BusLineProvider>
                <TooltipProvider>
                  <RouterProvider router={router} />
                  <ToastContainer />
                </TooltipProvider>
              </BusLineProvider>
            </AuthProvider>
          </GeoProvider>
        </QueryClientProvider>
      </CookiesProvider>
    </StrictMode>,
  )
}
