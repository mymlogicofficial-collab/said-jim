import { useState, useEffect } from "react";
import SplashScreen from "./pages/SplashScreen";
import MainApp from "./pages/MainApp";

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ height: "100vh", width: "100vw", overflow: "hidden", background: "#050508" }}>
      {showSplash ? (
        <SplashScreen onComplete={() => setShowSplash(false)} />
      ) : (
        <MainApp />
      )}
    </div>
  );
}

export default App;