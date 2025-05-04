export * from "./lib/BitRange";
export * from "./lib/commanding/Acknowledgment";
export * from "./lib/commanding/AdvancementParams";
export * from "./lib/commanding/CommandHistoryRecord";
export * from "./lib/commanding/ParameterCheck";
export * from "./lib/commanding/StackFormatter";
export * from "./lib/commanding/Step";
export * from "./lib/User";
export * as utils from "./lib/utils";

import * as YAMCS from "./lib/client";

function onFrameLoss() {
  console.warn("YAMCS Frame Loss Detected");
}

function onSessionEnd() {
  console.warn("YAMCS Session Eneded");
}

export const yamcs = new YAMCS.YamcsClient(
  `http://${window.location.hostname}:8090/yamcs/`,
  { onFrameLoss },
  { onSessionEnd },
);
