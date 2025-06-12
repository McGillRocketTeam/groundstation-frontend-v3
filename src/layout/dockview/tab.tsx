import { IDockviewPanelHeaderProps } from "dockview";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  EnterFullScreenIcon,
  ExitFullScreenIcon,
  Pencil1Icon,
  TrashIcon,
} from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import AddCardDialog from "@/components/AddCardDialog";
import { ComponentKey } from "@/cards";

const tabComponents = {
  default: DefaultTab,
};

function DefaultTab(props: IDockviewPanelHeaderProps) {
  const [maximized, setMaximized] = useState(false);

  useEffect(() => {
    const disposable = props.containerApi.onDidMaximizedGroupChange(() => {
      setMaximized(props.api.isMaximized());
    });

    return () => {
      disposable.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.containerApi]);

  return (
    <ContextMenu modal={false}>
      <ContextMenuTrigger>
        <div className="flex h-full w-full flex-row items-center justify-center gap-2 px-2">
          {props.api.title}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        {maximized ? (
          <ContextMenuItem onClick={() => props.api.exitMaximized()}>
            Collapse
            <ContextMenuShortcut>
              <ExitFullScreenIcon />
            </ContextMenuShortcut>
          </ContextMenuItem>
        ) : (
          <ContextMenuItem onClick={() => props.api.maximize()}>
            Maximize
            <ContextMenuShortcut>
              <EnterFullScreenIcon />
            </ContextMenuShortcut>
          </ContextMenuItem>
        )}
        <ContextMenuSeparator />
        <AddCardDialog
          asChild
          defaultValues={{
            component: props.api.component as ComponentKey,
            title: props.api.title ?? "",
            values: props.params,
          }}
          onSubmit={(panel) => {
            props.api.updateParameters(panel.params);
          }}
        >
          <ContextMenuItem onSelect={(e) => e.preventDefault()}>
            Edit
            <ContextMenuShortcut>
              <Pencil1Icon />
            </ContextMenuShortcut>
          </ContextMenuItem>
        </AddCardDialog>
        <ContextMenuItem
          onClick={() => {
            const panel = props.containerApi.getPanel(props.api.id);
            if (panel) props.containerApi.removePanel(panel);
          }}
          className="text-destructive"
        >
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
