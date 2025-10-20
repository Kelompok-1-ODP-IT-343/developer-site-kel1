//update edit masih di console log
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DeveloperDetail } from "@/components/data/developers";

export default function ViewDeveloperDialog({
  open,
  onOpenChange,
  developer,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  developer: DeveloperDetail | null;
}) {
  if (!developer) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({ ...developer });

  const handleChange = (field: string, value: string) => {
    setEditedData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    console.log("Developer updated:", editedData);
    setIsEditing(false);
  };

  const levelColor =
    editedData.partnership_level === "Platinum"
      ? "bg-blue-500 text-white"
      : editedData.partnership_level === "Gold"
      ? "bg-yellow-400 text-black"
      : "bg-gray-400 text-white";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px] max-h-[90vh] overflow-y-auto rounded-2xl">
        {/* Header */}
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold leading-tight mb-0 text-gray-900 dark:!text-white flex justify-between items-center">
            Developer Details

          </DialogTitle>
        </DialogHeader>

        {/* Developer Summary */}
        <div className="rounded-xl border bg-muted/30 p-6 mt-2 flex flex-col items-center text-center gap-3">
          <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-muted bg-white shadow-sm">
            <Image
              src={editedData.logo || "/images/default-logo.png"}
              alt={editedData.company_name}
              fill
              className="object-fill"
            />
          </div>

          <div>
            {isEditing ? (
              <Input
                value={editedData.company_name}
                onChange={(e) => handleChange("company_name", e.target.value)}
                className="text-center font-semibold text-lg h-8"
              />
            ) : (
              <h2 className="font-semibold text-lg text-gray-900 dark:!text-white">
                {editedData.company_name}
              </h2>
            )}
            {isEditing ? (
              <Input
                value={editedData.partnership_level}
                onChange={(e) => handleChange("partnership_level", e.target.value)}
                className="mt-2 text-center h-8"
              />
            ) : (
              <Badge className={`${levelColor} mt-1`}>{editedData.partnership_level}</Badge>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="mt-4 rounded-xl border bg-card p-4">
          <h3 className="font-semibold text-base mb-2 text-gray-900 dark:!text-white">
            Description
          </h3>
          {isEditing ? (
            <textarea
              value={editedData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="w-full h-24 text-sm border rounded-md p-2"
            />
          ) : (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {editedData.description}
            </p>
          )}
        </div>

        {/* Developer Summary */}
        <div className="mt-4 rounded-xl border bg-card p-4">
          <h3 className="font-semibold text-base mb-3 text-gray-900 dark:!text-white">
            Developer Summary
          </h3>
          <div className="space-y-2 text-sm">
            {[
              ["Contact Person", "contact_person"],
              ["Email", "email"],
              ["Phone", "phone"],
              ["Website", "website"],
              ["Established", "established_year"],
            ].map(([label, key]) => (
              <div key={key} className="flex justify-between border-b py-1 items-center">
                <span className="text-muted-foreground">{label}</span>
                {isEditing ? (
                  <Input
                    value={(editedData as any)[key]}
                    onChange={(e) => handleChange(key, e.target.value)}
                    className="w-[55%] h-7 text-sm"
                  />
                ) : key === "website" ? (
                  <a
                    href={(editedData as any)[key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-blue-600 hover:underline text-right w-[55%]"
                  >
                    {(editedData as any)[key].replace(/^https?:\/\//, "")}
                  </a>
                ) : (
                  <span className="font-medium text-right w-[55%] text-right">
                    {(editedData as any)[key]}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Address Details */}
        <div className="mt-4 rounded-xl border bg-card p-4">
          <h3 className="font-semibold text-base mb-3 text-gray-900 dark:!text-white">
            Address Details
          </h3>
          <div className="space-y-2 text-sm">
            {[
              ["Address", "address"],
              ["City", "city"],
              ["Province", "province"],
              ["Postal Code", "postal_code"],
            ].map(([label, key]) => (
              <div key={key} className="flex justify-between border-b py-1 items-center">
                <span className="text-muted-foreground">{label}</span>
                {isEditing ? (
                  <Input
                    value={(editedData as any)[key]}
                    onChange={(e) => handleChange(key, e.target.value)}
                    className="w-[55%] h-7 text-sm"
                  />
                ) : (
                  <span className="font-medium text-right w-[55%] text-right">
                    {(editedData as any)[key]}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2">
          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          ) : (
            <>
              <Button size="sm" onClick={handleSave}>
                Save
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </>
          )}
        </div>
        <p className="mt-4 text-xs text-center text-muted-foreground">
          Informasi developer bersifat rahasia dan mengikuti kebijakan kerja sama BNI KPR.
        </p>
      </DialogContent>
    </Dialog>
  );
}
