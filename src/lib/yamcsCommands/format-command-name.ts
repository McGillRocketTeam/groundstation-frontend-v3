export function formatCommandName(name: string) {
  const components = name
    .split("/")
    .filter(
      (part) => part !== "/" && part !== "FlightComputer" && part.trim() !== "",
    );

  if (components.length == 2) {
    return { container: components[0].trim(), name: components[1].trim() };
  } else return name;
}

/**
 * This function takes a paramater name and removes the "FlightComputer" part.
 * We do this because there are some actions where selecting a parameter for
 * one flight computer should select the second flight computer. In this case,
 * we select one of the parameters and then automatically get the other.
 */
export function anonymizeParameter(name: string) {
  return name.includes("FlightComputer") ? name.substring(6) : name;
}
