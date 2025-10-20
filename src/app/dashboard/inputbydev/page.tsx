"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { properties, Property } from "@/components/data/properties";
import { X, Check, ArrowLeft } from "lucide-react";

export default function InputByDevPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
    const id = searchParams.get("id");
    const property = properties.find((p) => p.id === id);


  if (!property)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-600">
        <p>Data properti tidak ditemukan.</p>
        <Button className="mt-4" onClick={() => router.push("/dashboard")}>
          Kembali ke Dashboard
        </Button>
      </div>
    );

  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<Property>({ ...property });

  const handleChange = (field: string, value: string | number) => {
    setEditedData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    console.log("Updated Property Data:", editedData);
    setIsEditing(false);
  };

  return (
    <div className="p-6 max-w-[1300px] mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold text-gray-900 dark:!text-white">
            Input Properti oleh Developer
          </h1>
        </div>
      </div>

      {/* === MAIN CONTENT === */}
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
                <p className="text-sm text-muted-foreground">
                  {editedData.description}
                </p>
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
                    className="h-7 text-sm max-w-[180px]"
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
                  <div key={key} className="flex justify-between items-center gap-3">
                    <strong className="min-w-[120px]">{label}:</strong>
                    {isEditing ? (
                      <Input
                        value={value}
                        onChange={(e) => handleChange(key, e.target.value)}
                        className="h-7 text-sm max-w-[140px]"
                      />
                    ) : (
                      <span className="text-right truncate max-w-[180px]">
                        {displayValue}
                      </span>
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
                      className="h-7 text-sm max-w-[180px]"
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

          {/* === FOOTER (EDIT / SAVE) === */}
          <div className="flex justify-end gap-2 mt-6">
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

        </div>
      </div>
      <div className="mt-6 text-xs text-muted-foreground text-center">
          Data properti dilindungi oleh kebijakan privasi dan peraturan BNI.
      </div>
      {/* === ACTION BUTTONS === */}
      <section className="flex flex-wrap gap-3 justify-end pt-6 border-t mt-6">

        <button
          onClick={() => router.push("/confirm?action=reject")}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl font-medium text-white shadow hover:bg-red-600 transition-colors"
          style={{ background: "#dc2626" }}
        >
          <X className="h-5 w-5" /> Reject
        </button>
        <button
          onClick={() => router.push("/confirm?action=approve")}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl font-medium text-white shadow hover:bg-green-600 transition-colors"
          style={{ background: "#16a34a" }}
        >
          <Check className="h-5 w-5" /> Approve
        </button>
      </section>




    </div>
  );
}
