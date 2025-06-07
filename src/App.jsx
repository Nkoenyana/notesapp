import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import Homepage from "~pages/home.jsx";
import { Routes, Route } from "react-router-dom";
import NotFound from "~pages/code/404.jsx";
import { CustomAuth, formFields  } from "~components/CustomAuth.jsx";
/*
 * @type {import('aws-amplify/data').Client<import('../amplify/data/resource').Schema>}
 */


export default function App() {
  return (
      <Authenticator socialProviders={["Google"]}
        components={CustomAuth}
        formFields={formFields}
      >
      {({ signOut }) => (
          <Routes>
            <Route
              path="/"
              element={<Homepage />}
            />
            <Route
              path="*"
              element={<NotFound />}
              cache="no-store"
            />
          </Routes>
      )}
    </Authenticator>
  );
}
