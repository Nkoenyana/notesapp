
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

import { createBrowserRouter, RouterProvider} from 'react-router';
import Layout from '~layouts/dashboard.jsx';
import Test from '~pages/home.jsx';
const router = createBrowserRouter([
  {
    Component: App,
    children: [
      {
        path: '/',
        Component: Layout,
        children:[
          {
            path: 'home',
            Component: Test,
          }
        ]
      },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
)
