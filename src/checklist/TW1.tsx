import { ConnectedDevicesCard } from "@/cards/connectedDevices/ConnectedDevicesCard";
import { Button } from "@/components/ui/button";

export default function TW1() {
  return (
    <div className="p-10 h-full overflow-y-scroll">
      <div className="flex flex-col max-w-5xl mx-auto ">
        <h1 className="text-2xl font-medium uppercase pb-4">TW1 Procedures</h1>

        <div className="grid grid-cols-[auto_auto_1fr] gap-y-6 ">
          <div className="border-b font-semibold">STEP</div>
          <div className="border-b font-semibold">ROLE</div>
          <div className="border-b font-semibold">ITEM</div>

          <div className="px-4">1</div>
          <div className="px-4">PD</div>
          <div className="px-4">
            Take the arming key and binoculars to the pad site.
          </div>

          <div className="px-4">17</div>
          <div className="px-4">GTC</div>
          <div className="px-4">
            Confirm that the GUI has established a link with FC-433 and FC-900
            by looking at the green indicators on the default page. Data is
            updating with expected values.
          </div>
          <div className="col-span-full">
            <ConnectedDevicesCard />
          </div>

          <div className="px-4">18</div>
          <div className="px-4">GTC</div>
          <div className="px-4 grid grid-cols-[1fr_auto] gap-4">
            <span>
              Press and hold the "Reset AV" button on the GUI. Confirm that the
              GUI stops and restarts receiving data.
            </span>
            <Button>RESET AV</Button>
          </div>

          <div className="px-4">21.2</div>
          <div className="px-4">GTC</div>
          <div className="px-4">
            Confirm Main and Drogue continuity with the following: (1) CH1 and
            CH2 green LEDs are on and (2) GUI states drogue_continuity_HW and
            main_continuity_HW are true for both FC-433 and FC-900.
          </div>

          <div className="col-span-full px-4 grid grid-cols-subgrid gap-4 items-center">
            <Button className="col-span-2 w-full">RECOVERY ARM</Button>
            <span>
              <div className="text-success">drogue_continuity_HW: TRUE</div>
              <div className="text-error">main_continuity_HW: FALSE</div>
            </span>
          </div>

          <div className="px-4">21.3</div>
          <div className="px-4">GTC</div>
          <div className="px-4">
            Press and hold the "Recovery Disarm" button on the GUI. Confirm the
            follow- ing: (1) CH1 and CH2 arm LEDs are off and (2) GUI state
            drogue_armed_HW and main_armed_HW are false for both FC-433 and
            FC-900.
          </div>

          <div className="col-span-full px-4 grid grid-cols-subgrid gap-4 items-center">
            <Button className="col-span-2 w-full">RECOVERY DISARM</Button>
            <span>
              <div className="text-success">drogue_continuity_HW: TRUE</div>
              <div className="text-error">main_continuity_HW: FALSE</div>
            </span>
          </div>

          <div className="px-4">21.2</div>
          <div className="px-4">GTC</div>
          <div className="px-4">
            Confirm Main and Drogue continuity with the following: (1) CH1 and
            CH2 green LEDs are on and (2) GUI states drogue continuity HW and
            main continuity HW are true for both FC-433 and FC-900.
          </div>
        </div>
      </div>
    </div>
  );
}
