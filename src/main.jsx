
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

import { createBrowserRouter, RouterProvider} from 'react-router';
import Layout from '~layouts/dashboard.jsx';
import Homepage from '~pages/home.jsx';
import Testpage from '~pages/test.jsx';
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
            Component: Homepage,
          },
          {
            path: '/',
            Component: Testpage,
          }
        ]
      },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
)
