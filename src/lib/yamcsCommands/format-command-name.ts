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
