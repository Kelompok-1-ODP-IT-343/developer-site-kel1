//edit masih di console log

"use client";

import { useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Property } from "@/components/data/properties";

export default function ViewPropertyDialog({
  open,
  onOpenChange,
  property,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: Property | null;
}) {
  if (!property) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({ ...property });

  const handleChange = (field: string, value: string | number) => {
    setEditedData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    console.log("Updated Property Data:", editedData);
    setIsEditing(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1500] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold leading-tight mb-0 text-gray-900 dark:!text-white flex justify-between items-center">
            Property Overview
          </DialogTitle>
        </DialogHeader>

        {/* === MAIN CONTENT === */}
        <div className="overflow-y-auto pr-2 space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ---------- LEFT: IMAGE & SUMMARY ---------- */}
            <div className="space-y-4">
              {/* Image */}
              <div className="relative w-full h-56 rounded-lg overflow-hidden border">
                <Image
                  src={editedData.image_url}
                  alt={editedData.title}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                {isEditing ? (
                  <>
                    <Input
                      value={editedData.title}
                      onChange={(e) => handleChange("title", e.target.value)}
                      className="text-lg font-semibold"
                    />
                    <Input
                      value={editedData.description}
                      onChange={(e) => handleChange("description", e.target.value)}
                      className="text-sm"
                    />
                  </>
                ) : (
                  <>
                    <h2 className="font-semibold text-lg text-gray-900 dark:!text-white">
                      {editedData.title}
                    </h2>
                    <p className="text-sm text-muted-foreground">{editedData.description}</p>
                  </>
                )}
              </div>

              {/* Info Ringkas */}
              <div className="rounded-lg border bg-muted/30 p-4 text-sm grid grid-cols-2 gap-y-2">
                {[
                  ["Developer", "company_name"],
                  ["Tipe", "property_type"],
                  ["Harga", "price"],
                  ["Harga/m²", "price_per_sqm"],
                  ["Lokasi", "city"],
                  ["Alamat", "address"],

                ].map(([label, key]) => (
                  <div key={key} className="flex justify-between items-center gap-3">
                    <strong className="min-w-[110px]">{label}:</strong>
                    {isEditing ? (
                      <Input
                        value={(editedData as any)[key]}
                        onChange={(e) => handleChange(key, e.target.value)}
                        className="h-7 text-sm max-w-[180px] sm:max-w-[140px]"
                      />
                    ) : (
                      <span className="text-right w-[55%] truncate">
                        {key.includes("price")
                          ? `Rp${(editedData as any)[key].toLocaleString("id-ID")}`
                          : (editedData as any)[key]}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ---------- RIGHT: DETAIL & LOCATION ---------- */}
            <div className="flex flex-col gap-4">
              {/* Property Details */}
              <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                <h3 className="font-semibold text-base text-gray-900 dark:!text-white">
                  Property Details
                </h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  {[
                    ["Luas Tanah (m²)", "land_area", "m²"],
                    ["Luas Bangunan (m²)", "building_area", "m²"],
                    ["Kamar Tidur", "bedrooms", ""],
                    ["Kamar Mandi", "bathrooms", ""],
                    ["Lantai", "floors", ""],
                    ["Garasi", "garage", ""],
                    ["Tahun Bangun", "year_built", ""],
                    ["Sertifikat", "certificate_type", ""],
                    ["Biaya Pemeliharaan", "maintenance_fee", "Rp"],
                    ["Nilai PBB", "pbb_value", "Rp"],
                    ["Koordinat", "latitude_longitude", ""],
                    ["Kode Pos", "postal_code", ""],
                  ].map(([label, key, unit]) => {
                    const value =
                      key === "latitude_longitude"
                        ? `${(editedData as any).latitude}, ${(editedData as any).longitude}`
                        : (editedData as any)[key];

                    const displayValue =
                      key === "maintenance_fee" || key === "pbb_value"
                        ? `Rp${(Number(value) || 0).toLocaleString("id-ID")}`
                        : key === "latitude_longitude"
                        ? value
                        : unit === "m²"
                        ? `${value} ${unit}`
                        : value;

                    return (
                      <div
                        key={key}
                        className="flex justify-between items-center gap-3"
                      >
                        <strong className="min-w-[120px]">{label}:</strong>
                        {isEditing ? (
                          key === "latitude_longitude" ? (
                            <div className="flex items-center gap-2">
                              <Input
                                value={(editedData as any).latitude}
                                onChange={(e) => handleChange("latitude", e.target.value)}
                                className="h-7 text-sm w-[80px]"
                                placeholder="Lat"
                              />
                              <Input
                                value={(editedData as any).longitude}
                                onChange={(e) => handleChange("longitude", e.target.value)}
                                className="h-7 text-sm w-[80px]"
                                placeholder="Long"
                              />
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              {unit === "Rp" && <span className="text-gray-500 text-xs">Rp</span>}
                              <Input
                                value={value}
                                onChange={(e) => handleChange(key, e.target.value)}
                                className="h-7 text-sm max-w-[140px]"
                              />
                              {unit === "m²" && <span className="text-gray-500 text-xs">m²</span>}
                            </div>
                          )
                        ) : (
                          <span className="text-right truncate max-w-[180px]">{displayValue}</span>
                        )}
                      </div>
                    );
                  })}
                </div>

              </div>

              {/* Location Details */}
              <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                <h3 className="font-semibold text-base text-gray-900 dark:!text-white">
                  Location Details
                </h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  {[
                    ["Alamat", "address"],
                    ["Kelurahan", "sub_district"],
                    ["Kecamatan", "district"],
                    ["Kota", "city"],
                    ["Provinsi", "province"],
                    ["Kode Pos", "postal_code"],
                  ].map(([label, key]) => (
                    <div key={key} className="flex justify-between items-center gap-3">
                      <strong className="min-w-[120px]">{label}:</strong>
                      {isEditing ? (
                        <Input
                          value={(editedData as any)[key]}
                          onChange={(e) => handleChange(key, e.target.value)}
                          className="h-7 text-sm max-w-[180px] sm:max-w-[140px]"
                        />
                      ) : (
                        <span className="text-right truncate max-w-[180px]">
                          {(editedData as any)[key]}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* === FOOTER BUTTONS === */}
        <div className="flex justify-end gap-2 mt-4">
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

        <div className="mt-6 text-xs text-muted-foreground text-center">
          Data properti dilindungi oleh kebijakan privasi dan peraturan BNI.
        </div>
      </DialogContent>
    </Dialog>
  );
}
