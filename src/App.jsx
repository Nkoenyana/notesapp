import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import Homepage from "~pages/home.jsx";
import NotFound from "~pages/code/404.jsx";
import { CustomAuth, formFields  } from "~components/CustomAuth.jsx";

/*
 * @type {import('aws-amplify/data').Client<import('../amplify/data/resource').Schema>}
 */
import { ReactRouterAppProvider } from '@toolpad/core/react-router';
import { Outlet } from "react-router";
import DashBoardIcon from "@mui/icons-material/Dashboard";
/** @typedef {import("@toolpad/core").Navigation} Navigation */

// import icon 
import HomeIcon from '@mui/icons-material/Home';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LogoutIcon from '@mui/icons-material/Logout';
const NAVIGATION = [
  {
    kind: 'header',
    title: 'Menu',
  },
  {
    segment: 'home',
    title: 'Home',
    icon: <HomeIcon />,
  },
  {
    segment: 'notes',
    title: 'Notes',
    icon: <AssignmentIcon />,
  },
  {
    kind: 'divider',
  },
  {
    kind: 'header',
    title: 'Settings',
    icon: <SettingsIcon />,
  },
  {
    segment: 'profile',
    title: 'Profile',
    icon: <AccountCircleIcon />,
  },
  {
    segment: 'logout',
    title: 'Logout',
    icon: <LogoutIcon />,
    action: ({ signOut }) => {
      signOut();
    },
  }
];

const BRANDING = {
  title: "Note App",
  logo: <img src="https://cdn-icons-png.flaticon.com/512/3982/3982361.png" alt="logo" width="30" height="30" />,
  homeURL: "/",
};

export default function App() {
  return (
      <Authenticator socialProviders={["Google"]}
        components={CustomAuth}
        formFields={formFields}
      >
      {({ signOut }) => (
        <ReactRouterAppProvider navigation={NAVIGATION} branding={BRANDING}>
          <Outlet />
        </ReactRouterAppProvider>
      )}
    </Authenticator>
  );
}
