import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  className?: string;
  aspect?: "square" | "video";
}

const ImageUpload = ({ value, onChange, folder = "general", label = "Upload Image", className = "", aspect = "square" }: Props) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${folder}/${Date.now()}.${ext}`;

      const { error } = await supabase.storage
        .from("user-uploads")
        .upload(path, file, { upsert: true });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("user-uploads")
        .getPublicUrl(path);

      onChange(urlData.publicUrl);
      toast.success("Image uploaded");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    onChange("");
  };

  const aspectClass = aspect === "video" ? "aspect-video" : "aspect-square";

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />

      {value ? (
        <div className={`relative group ${aspectClass} w-full overflow-hidden border border-border bg-secondary/30`}>
          <img
            src={value}
            alt="Uploaded"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              onClick={() => inputRef.current?.click()}
              className="text-white/80 hover:text-white text-xs font-mono uppercase tracking-wider px-3 py-1.5 border border-white/30 hover:border-white transition-colors"
            >
              Replace
            </button>
            <button
              onClick={handleRemove}
              className="text-white/80 hover:text-destructive text-xs font-mono uppercase tracking-wider px-3 py-1.5 border border-white/30 hover:border-destructive transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={`${aspectClass} w-full border border-dashed border-border hover:border-primary/50 bg-secondary/20 hover:bg-secondary/40 flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer disabled:cursor-wait`}
        >
          {uploading ? (
            <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
          ) : (
            <Upload className="h-5 w-5 text-muted-foreground" />
          )}
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            {uploading ? "Uploading…" : label}
          </span>
        </button>
      )}
    </div>
  );
};

export default ImageUpload;
