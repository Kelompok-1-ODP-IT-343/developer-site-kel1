"use client";
import React from "react";

type Col<T> = { key: keyof T; label: string; render?: (row: T) => React.ReactNode };

export function SimpleTable<T extends { id: string }>({ columns, data }: { columns: Col<T>[]; data: T[] }) {
    return (
        <div className="overflow-hidden rounded-2xl border">
            <table className="min-w-full text-left">
                <thead className="bg-slate-50 text-slate-500">
                    <tr>
                        {columns.map((c) => (
                            <th key={String(c.key)} className="px-6 py-3 text-sm font-medium">{c.label}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, i) => (
                        <tr key={row.id} className={i % 2 ? "bg-white" : "bg-slate-50/40"}>
                            {columns.map((c) => (
                                <td key={String(c.key)} className="px-6 py-4">
                                    {c.render ? c.render(row) : (row as any)[c.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}