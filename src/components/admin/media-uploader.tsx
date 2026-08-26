"use client";

import { FormEvent, useRef, useState } from "react";
import type { MediaAsset } from "@/types/cms";

export function MediaUploader({ onComplete, replaceProjectImageId }: { onComplete: (media: MediaAsset) => void; replaceProjectImageId?: number }) {
  const inputRef = useRef<HTMLInputElement>(null); const [progress, setProgress] = useState(0); const [message, setMessage] = useState("");
  function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget); const file = inputRef.current?.files?.[0];
    if (!file) return setMessage("Choose a file first."); form.set("file", file); if (replaceProjectImageId) form.set("replaceProjectImageId", String(replaceProjectImageId));
    const xhr = new XMLHttpRequest(); xhr.open("POST", "/api/admin/media");
    xhr.upload.onprogress = (uploadEvent) => { if (uploadEvent.lengthComputable) setProgress(Math.round(uploadEvent.loaded / uploadEvent.total * 100)); };
    xhr.onload = () => { const result = JSON.parse(xhr.responseText || "{}"); if (xhr.status >= 200 && xhr.status < 300) { setMessage("Upload complete. Saved as a draft asset."); setProgress(100); onComplete(result.media); event.currentTarget.reset(); } else { setMessage(result.error || "Upload failed."); setProgress(0); } };
    xhr.onerror = () => { setMessage("Upload failed. Check the connection and try again."); setProgress(0); };
    setMessage("Uploading and creating optimized variants…"); setProgress(1); xhr.send(form);
  }
  return <form className="media-uploader" onSubmit={upload}><div className="field-grid"><label>File<input ref={inputRef} name="file" type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml,application/pdf" required /></label><label>Alternative text<input name="altText" minLength={4} maxLength={240} required placeholder="Describe the image or file purpose" /></label></div>{progress > 0 && <div className="upload-progress" aria-label={`Upload ${progress}% complete`}><span style={{ width: `${progress}%` }} /></div>}<div className="form-actions"><button className="admin-primary">{replaceProjectImageId ? "Upload replacement" : "Upload media"}</button>{message && <p role="status">{message}</p>}</div></form>;
}
