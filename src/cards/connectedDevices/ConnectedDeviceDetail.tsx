import { Separator } from "@/components/ui/separator";
import { Link } from "@/lib/yamcsClient/lib/client";
import DeviceStatusIndicator from "./DeviceStatusIndicator";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { yamcs } from "@/lib/yamcsClient/api";

export default function ConnectedDeviceDetail({ link }: { link: Link }) {
  const [disablePrimary, setDisablePrimary] = useState(false);
  const [disableSecondary, setDisableSecondary] = useState(false);

  const [optimisticDisabled, setOptimisticDisabled] = useState(link.disabled);

  return (
    <dl className="flex flex-col gap-2 text-sm wrap-anywhere">
      <div>
        <dt className="font-semibold">Link</dt>
        <dd>{link.name}</dd>
      </div>
      <div>
        <dt className="font-semibold">Class</dt>
        <dd>{link.type}</dd>
      </div>
      <Separator />
      <div>
        <dt className="font-semibold">Status</dt>
        <dd className="">
          <DeviceStatusIndicator status={link.status} /> {link.detailedStatus}
        </dd>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <dt className="font-semibold">Data In</dt>
          <dd>{link.dataInCount}</dd>
        </div>
        <div>
          <dt className="font-semibold">Data Out</dt>
          <dd>{link.dataOutCount}</dd>
        </div>
      </div>
      <Separator />
      <div className="grid grid-cols-2 gap-2">
        <Button
          disabled={disableSecondary}
          onClick={async () => {
            setDisableSecondary(true);
            await yamcs.resetLinkCounters(link.instance, link.name);
            setDisableSecondary(false);
          }}
          variant="secondary"
        >
          Reset Counters
        </Button>
        {link.disabled ? (
          <Button
            disabled={disablePrimary || optimisticDisabled !== link.disabled}
            onClick={async () => {
              setDisablePrimary(true);
              const resp = await yamcs.enableLink(link.instance, link.name);
              if (resp.status === 200) setOptimisticDisabled(false);
              setDisablePrimary(false);
            }}
          >
            Enable
          </Button>
        ) : (
          <Button
            disabled={disablePrimary || optimisticDisabled !== link.disabled}
            onClick={async () => {
              setDisablePrimary(true);
              const resp = await yamcs.disableLink(link.instance, link.name);
              if (resp.status === 200) setOptimisticDisabled(true);
              setDisablePrimary(false);
            }}
          >
            Disable
          </Button>
        )}
      </div>
    </dl>
  );
}
