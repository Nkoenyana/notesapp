"use client";

import { Amplify } from 'aws-amplify';
import { useEffect, useState } from 'react';

// This component dynamically imports the configuration to avoid build errors if `amplifyconfiguration.json` doesn't exist yet.
export default function ConfigureAmplify() {
  const [isAmplifyEnabled, setIsAmplifyEnabled] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    // Check the environment variable once on the client side.
    setIsAmplifyEnabled(process.env.NEXT_PUBLIC_DATA_SOURCE === 'amplify');
  }, []);

  useEffect(() => {
    const configure = async () => {
      try {
        // Dynamically import the config file.
        const config = (await import('amplifyJson')).default;
        Amplify.configure(config, { ssr: true });
        setIsConfigured(true);
        console.log("Amplify configured successfully.");
      } catch (e) {
        // This is expected if the file doesn't exist.
        console.warn("Could not load amplifyconfiguration.json. This is normal if you haven't set up the Amplify backend yet.");
      }
    };
    
    // Only attempt to configure if Amplify is enabled and it hasn't been configured yet.
    if (isAmplifyEnabled && !isConfigured) {
      configure();
    }

  }, [isAmplifyEnabled, isConfigured]);

  // This component doesn't render anything itself.
  return null;
}
