import { signInWithRedirect } from "aws-amplify/auth";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import Homepage from "~pages/home.jsx";
import { Routes, Route } from "react-router-dom";
import NotFound from "~pages/code/404.jsx";
signInWithRedirect({ provider: "Google" });
import { client } from "~utils/amplify";
/**
 * @type {import('aws-amplify/data').Client<import('../amplify/data/resource').Schema>}
 */


export default function App() {
  return (
      <Authenticator socialProviders={["Google"]}>
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
