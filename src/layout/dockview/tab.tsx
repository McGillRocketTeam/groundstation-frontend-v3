import { IDockviewPanelHeaderProps } from "dockview";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";

const tabComponents = {
  default: DefaultTab,
};

function DefaultTab(props: IDockviewPanelHeaderProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div className="flex h-full w-full flex-row items-center justify-center gap-2 px-2">
          {props.api.title}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>
          Edit
          <ContextMenuShortcut>
            <Pencil1Icon />
          </ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem className="text-destructive">
          Delete
          <ContextMenuShortcut>
            <TrashIcon className="text-destructive" />
          </ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

export default tabComponents;
