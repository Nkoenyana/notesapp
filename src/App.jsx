import { signInWithRedirect } from "aws-amplify/auth";
import { Authenticator } from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";
import Homepage from "./home.jsx";
import { Routes, Route } from "react-router-dom";
signInWithRedirect({ provider: "Google" });
/**
 * @type {import('aws-amplify/data').Client<import('../amplify/data/resource').Schema>}
 */

Amplify.configure(outputs);

export default function App() {
  return (
      <Authenticator socialProviders={["Google"]}>
      {({ signOut }) => (
          <Routes>
            <Route
              path="/home"
              element={<Homepage />}
            />
            <Route
              path="*"
              element={<div>Page Not Found</div>}
              cache="no-store"
            />
          </Routes>
      )}
    </Authenticator>
  );
}
