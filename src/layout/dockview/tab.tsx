import { AddPanelOptions, IDockviewPanelHeaderProps } from "dockview";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  CopyIcon,
  EnterFullScreenIcon,
  ExitFullScreenIcon,
  Pencil1Icon,
  TrashIcon,
} from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import AddCardDialog from "@/components/AddCardDialog";
import { ComponentKey } from "@/cards";
import { usePanelClipboardStore } from "@/stores/clipboard";

const tabComponents = {
  default: DefaultTab,
};

function DefaultTab(props: IDockviewPanelHeaderProps) {
  const { value, copy, paste } = usePanelClipboardStore();
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
        <ContextMenuItem
          onClick={() => {
            copy({
              id: crypto.randomUUID(),
              title: props.api.title,
              component: props.api.component,
              params: props.containerApi.getPanel(props.api.id)?.params,
            });
          }}
        >
          Copy
          <ContextMenuShortcut>
            <CopyIcon />
          </ContextMenuShortcut>
        </ContextMenuItem>
        {value && (
          <ContextMenuItem
            onClick={() => {
              const panel = paste();
              if (panel)
                props.containerApi.addPanel({
                  ...panel,
                  position: { referenceGroup: props.api.group },
                });
            }}
          >
            Paste
          </ContextMenuItem>
        )}
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
