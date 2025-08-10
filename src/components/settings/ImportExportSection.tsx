
import { useUserSettingsStore } from "@/lib/dashboard-persistance";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Button } from "../ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { ChangeEvent, Fragment, useRef } from "react";
import { cn } from "@/lib/utils";

export default function SettingsImportExportSection() {
  const { 
    getDashboardList,
    settings,
    overwriteSettings
  } = useUserSettingsStore()

  const inputFile = useRef<HTMLInputElement>(null)

  function pickFile() {
    inputFile.current?.click()
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.item(0); // Get the first selected file
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (!text) throw new Error("File text was empty");

        const parsedData = JSON.parse(text as string);
        if (parsedData.dashboards === undefined) 
          throw new Error("Unexpected JSON format (didn't find dashboards)");

        overwriteSettings(parsedData)
      } catch (err) {
        console.error('Error parsing JSON:', err);
      }
    };

    reader.onerror = (e) => {
      console.error('Error reading file:', e);
    };

    // Read the file as text
    reader.readAsText(file);
  };

  const downloadSettings = () => {
    const now = new Date();

    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const day = now.getDate().toString().padStart(2, "0");

    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const seconds = now.getSeconds().toString().padStart(2, "0");

    const timestamp = `${hours}:${minutes}:${seconds}`;

    // Construct the filename
    const filename = `mrt_user_settings_${year}_${month}_${day}_${timestamp}.json`;

    const jsonString = JSON.stringify(settings, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename; // Set the desired filename for the download

    // 5. Programmatically click the <a> element to trigger the download
    document.body.appendChild(a); // Append to body is good practice, though often not strictly necessary for programmatic click
    a.click();

    // 6. Revoke the Blob URL to free up resources
    document.body.removeChild(a); // Clean up the temporary element
    URL.revokeObjectURL(url);
  }

  return(
    <section className="space-y-4">
      <div className="flex flex-row justify-between">
        <h2>Import/Export Settings</h2>
        <input 
          type='file' 
          accept=".json,application/json" 
          onChange={handleFileChange}
          ref={inputFile} 
          className="hidden" 
        />
        <div className="flex flex-row gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                Import
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete any existing configuration you have. All settings will be replaced with the imported versions.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={pickFile}>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button onClick={downloadSettings} variant="default" size="sm">
            Export
          </Button>
        </div>
      </div>
      <div>Saved Dashboards</div>
      <div className="grid border divide-y">
        {getDashboardList().map((dashboard) => (
          <div className="p-4 " key={dashboard.slug}>
            <span>{dashboard.name}</span>
            {Object.entries(dashboard.dockview!.panels!).map(([id, panel], index, list) => (
              <div key={id} className="relative pl-4 text-muted-foreground text-light">
                {/* Vertical Marker */}
                <div
                  className={cn(
                    "bg-border absolute top-0 left-0 h-full w-px",
                    // make the last vertical marker half height
                    index === list.length - 1 && "h-1/2",
                  )}
                ></div>
                {/* Horizontal Marker */}
                <div className="bg-border absolute bottom-1/2 left-0 h-px w-3"></div>
                <div className="pl-0">{panel.title}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  )
} 
