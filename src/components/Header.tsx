import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { EnterFullScreenIcon, ExitFullScreenIcon } from "@radix-ui/react-icons";
import { yamcs } from "@/lib/yamcsClient/api";
import { Time } from "@/lib/yamcsClient/lib/client";
import { Link } from "react-router";
import { SidebarTrigger } from "./ui/sidebar";

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
      <div className="flex flex-row items-center gap-2">
        <SidebarTrigger />
        <Link to="/">
          <h1 className="text-mrt">Home Dashboard</h1>
        </Link>
      </div>

      <div className="flex flex-row items-center gap-2">
        <YAMCSIndicator />
        <Button onClick={toggleFullscreen} variant="ghost" size="icon">
          {isFullscreen ? <ExitFullScreenIcon /> : <EnterFullScreenIcon />}
        </Button>
      </div>
    </header>
  );
}

function YAMCSIndicator() {
  const [time, setTime] = useState<Time | undefined>();
  const [connected, setConnected] = useState<boolean | undefined>();

  useEffect(() => {
    const subscription = yamcs.connected$.subscribe((value) =>
      setConnected(value),
    );
    return subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const listener = (serverTime: Time) => {
      setTime(serverTime);
    };

    const subscription = yamcs.createTimeSubscription(
      {
        instance: "gs_backend",
      },
      listener,
    );

    return () => {
      subscription.removeMessageListener(listener);
    };
  }, []);

  return (
    <>
      {time && (
        <div className="text-right text-xs">
          <div>{new Date(time.value).toLocaleString()}</div>
          <div className="text-success">{"YAMCS Connected"}</div>
        </div>
      )}
    </>
  );
}
