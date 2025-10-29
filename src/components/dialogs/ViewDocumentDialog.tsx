"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Image from "next/image";
import { FileDown } from "lucide-react";
import { motion } from "framer-motion";

export default function ViewDocumentDialog({
  open,
  onOpenChange,
  title,
  imageUrl,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  imageUrl: string | null;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
        className="backdrop-blur-sm bg-white/90 border border-gray-200 shadow-2xl"
        >
        <motion.div
            className="max-w-3xl p-0 overflow-hidden rounded-xl"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
        >
            <DialogHeader className="p-4 border-b flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
            {imageUrl && (
                <a
                href={imageUrl}
                download
                className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-[#0B63E5]/50 text-[#0B63E5] hover:bg-[#0B63E5]/10 text-sm font-medium transition"
                >
                <FileDown className="h-4 w-4" />
                Download
                </a>
            )}
            </DialogHeader>

            {imageUrl ? (
            <div className="p-4 flex justify-center bg-gray-50">
                <Image
                src={imageUrl}
                alt={title}
                width={700}
                height={500}
                className="rounded-lg object-contain max-h-[75vh]"
                />
            </div>
            ) : (
            <div className="p-6 text-center text-gray-500 italic">
                Belum ada foto untuk {title}.
            </div>
            )}
        </motion.div>
        </DialogContent>
    </Dialog>
  );
}
