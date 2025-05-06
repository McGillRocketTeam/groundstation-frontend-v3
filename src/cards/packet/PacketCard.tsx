import { IDockviewPanelProps } from "dockview-react";
import { PacketCardParams } from "./schema";
import { useQuery } from "@tanstack/react-query";
import { yamcs } from "@/lib/yamcsClient/api";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Fragment } from "react/jsx-runtime";

export const PacketCard = (props: IDockviewPanelProps<PacketCardParams>) => {
  const { data } = useQuery({
    queryKey: [props.params.container],
    queryFn: async () => {
      return await yamcs.getContainer("gs_backend", props.params.container);
    },
  });

  if (data?.entry) {
    const svgWidth = data.entry.reduce(
      (acc, current) =>
        (acc += (current.parameter?.type?.dataEncoding?.sizeInBits ?? 0) * 5),
      0,
    );
    const svgHeight = 50;
    return (
      <div className="w-ful h-full">
        <div className="h-full overflow-x-scroll">
          <svg
            width={svgWidth + data.entry.length - 1}
            height={svgHeight}
            // viewBox={`0 0 ${svgWidth + data.entry.length} 15`}
            className=""
          >
            {(() => {
              let cumulativeWidth = 0;
              const totalEntries = data.entry.length;

              return data.entry.map((entry, index) => {
                const width =
                  (entry.parameter?.type?.dataEncoding?.sizeInBits ?? 0) * 5;
                const x = cumulativeWidth;
                const hue =
                  (index / (totalEntries > 1 ? totalEntries - 1 : 1)) * 360;

                // Construct the HSL color string
                const color = `hsl(${hue}, 70%, 50%)`;
                cumulativeWidth += width + 1;

                // Calculate text position for centering
                const textX = x + width / 2;
                const textY = svgHeight / 2 + 0.5; // Add a small offset for vertical centering

                // Determine text color based on background color for readability
                // A simple way is to use black or white based on perceived lightness
                const textColor = hue < 180 ? "black" : "white"; // Basic check

                return (
                  <Fragment key={index}>
                    <rect
                      key={index} // Remember to add a key when mapping
                      width={width}
                      height={svgHeight}
                      fill={color}
                      x={x}
                    />
                    {width > 0 && ( // Only render text if width is greater than 0
                      <text
                        x={textX}
                        y={textY}
                        textAnchor="middle" // Center horizontally
                        dominantBaseline="middle" // Center vertically
                        fontSize="4" // Adjust font size as needed
                        fill={textColor}
                      >
                        {width}
                      </text>
                    )}
                  </Fragment>
                );
              });
            })()}
          </svg>
        </div>
      </div>
    );
  } else {
    return <div></div>;
  }
};
