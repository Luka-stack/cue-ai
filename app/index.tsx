import { Redirect } from 'expo-router';

// The `(tabs)` group has no index route (its screens live at /chat and /today),
// so the launch URL "/" has nothing to match. Redirect it to the default tab.
export default function Index() {
  return <Redirect href="/chat" />;
}
