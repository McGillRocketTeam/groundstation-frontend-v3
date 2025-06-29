export default function ParameterName({ name }: { name: string }) {
  const components = name.split("/").filter((c) => c !== "");

  return (
    <div>
      <div className="text-xs text-muted-foreground">{components[1]}</div>
      <div>{components.slice(2).join("/")}</div>
    </div>
  );
}
