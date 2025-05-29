import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
// import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import './styles.css'

import { CookiesProvider } from 'react-cookie'
import { ToastContainer } from 'react-toastify'
import EndUserMap from './components/screens/EndUserMap.tsx'
import AdminPanel from './components/screens/AdminPanel.tsx'

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

const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <CookiesProvider defaultSetOptions={{ path: '/' }}>
        <RouterProvider router={router} />
        <ToastContainer />
      </CookiesProvider>
    </StrictMode>,
  )
}
