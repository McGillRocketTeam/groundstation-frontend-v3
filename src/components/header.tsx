import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { EnterFullScreenIcon, ExitFullScreenIcon } from "@radix-ui/react-icons";

export default function Header() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <header className="border-border flex flex-row items-center justify-between border-b p-2">
      <h1 className="text-mrt">MCGILL ROCKET TEAM</h1>

      <div>
        <Button onClick={toggleFullscreen} variant="ghost" size="icon">
          {isFullscreen ? <ExitFullScreenIcon /> : <EnterFullScreenIcon />}
        </Button>
      </div>
    </header>
  );
}
