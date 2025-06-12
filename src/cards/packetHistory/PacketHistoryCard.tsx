// import { useEffect, useState } from "react";
// import { yamcs } from "@/lib/yamcsClient/api";
// import { Statistics, TmStatistics } from "@/lib/yamcsClient/lib/client";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
//
export const PacketHistoryCard = () => {
  return <div className="grid place-items-center h-full">Work in Progress</div>;
};

/*
export const PacketHistoryCard = () => {
  const [packets, setPackets] = useState<TmStatistics[]>([]);
  const listener = (time: Statistics) => {
    // setPackets(time.tmstats);
  };

  useEffect(() => {
    const subscription = yamcs.createTMStatisticsSubscription(
      {
        instance: "gs_backend",
        processor: "realtime",
      },
      listener,
    );
    return () => subscription.removeMessageListener(listener);
  });
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Packet Name</TableHead>
          <TableHead>Packet Time</TableHead>
          <TableHead className="text-right">Received</TableHead>
          <TableHead className="text-right">Packet Rate</TableHead>
          <TableHead className="text-right">Data Rate</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {packets.map((tm) => (
          <TableRow key={tm.packetName}>
            <TableCell className="w-full max-w-0 truncate">
              {tm.packetName}
            </TableCell>
            <TableCell>
              {new Date(tm.lastPacketTime).toLocaleTimeString()}
            </TableCell>
            <TableCell className="text-right">
              +{Date.parse(tm.lastPacketTime) - Date.parse(tm.lastReceived)} ms
            </TableCell>
            <TableCell className="text-right">{tm.packetRate} p/s</TableCell>
            <TableCell className="text-right">{tm.dataRate} bps</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
*/
