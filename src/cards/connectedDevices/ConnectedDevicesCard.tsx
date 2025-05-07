import { useEffect, useState } from "react";
import { yamcs } from "@/lib/yamcsClient/api";
import { Link, LinkEvent } from "@/lib/yamcsClient/lib/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import ConnectedDeviceDetail from "./ConnectedDeviceDetail";
import DeviceStatusIndicator from "./DeviceStatusIndicator";

export const ConnectedDevicesCard = () => {
  const [links, setLinks] = useState<Link[] | undefined>();

  useEffect(() => {
    const listener = (event: LinkEvent) => {
      setLinks(event.links.sort((a, b) => a.name.localeCompare(b.name)));
    };

    const subscription = yamcs.createLinkSubscription(
      {
        instance: "gs_backend",
      },
      listener,
    );

    return () => subscription.removeMessageListener(listener);
  }, []);

  return (
    <div>
      {links ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-4" />
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Data In</TableHead>
              <TableHead className="text-right">Data Out</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {links.map((link) => (
              <Popover key={link.name}>
                <PopoverContent className="w-80 p-2">
                  <ConnectedDeviceDetail link={link} />
                </PopoverContent>
                <PopoverTrigger asChild>
                  <TableRow className="data-[state=open]:bg-muted/50 cursor-pointer">
                    <TableCell className="w-4">
                      <DeviceStatusIndicator status={link.status} />
                    </TableCell>
                    <TableCell>{link.name}</TableCell>
                    <TableCell className="w-full max-w-0 truncate">
                      {link.detailedStatus}
                    </TableCell>
                    <TableCell className="text-right">
                      {link.dataInCount}
                    </TableCell>
                    <TableCell className="text-right">
                      {link.dataOutCount}
                    </TableCell>
                  </TableRow>
                </PopoverTrigger>
              </Popover>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-muted-foreground grid h-full animate-pulse place-items-center">
          Awaiting Link Data
        </div>
      )}
    </div>
  );
};
