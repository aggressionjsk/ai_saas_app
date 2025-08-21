"use client"

import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const POLLINATIONS_BASE = "https://image.pollinations.ai/prompt/";

export default function AIGeneratePage() {
  const [prompt, setPrompt] = useState("");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const canGenerate = useMemo(() => prompt.trim().length > 0, [prompt]);

  const generateImage = async () => {
    if (!canGenerate) return;
    setIsGeneratingImage(true);
    setVideoUrl(null);
    try {
      const url = `${POLLINATIONS_BASE}${encodeURIComponent(prompt)}?width=1024&height=1024&seed=${Math.floor(Math.random() * 1e9)}`;
      const res = await fetch(url, { cache: "no-store" });
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      setImageUrl(objectUrl);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const downloadBlobUrl = (url: string, filename: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const generateVideo = async () => {
    if (!imageUrl) {
      await generateImage();
      if (!imageUrl) return;
    }

    setIsGeneratingVideo(true);
    setVideoUrl(null);

    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageUrl!;
      await img.decode();

      const canvas = canvasRef.current!;
      const size = 768;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d")!;

      const stream = canvas.captureStream(30);
      const recorder = new MediaRecorder(stream, { mimeType: "video/webm;codecs=vp9" });
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);

      const durationMs = 4000;
      const start = performance.now();
      recorder.start();

      const render = (now: number) => {
        const t = Math.min(1, (now - start) / durationMs);
        const zoom = 1 + 0.15 * t; // subtle zoom-in
        const dx = (img.width * (zoom - 1)) / 2;
        const dy = (img.height * (zoom - 1)) / 2;

        ctx.clearRect(0, 0, size, size);
        ctx.drawImage(
          img,
          dx,
          dy,
          img.width - 2 * dx,
          img.height - 2 * dy,
          0,
          0,
          size,
          size
        );

        if (t < 1) {
          requestAnimationFrame(render);
        } else {
          recorder.stop();
        }
      };

      requestAnimationFrame(render);

      await new Promise<void>((resolve) => (recorder.onstop = () => resolve()));
      const blob = new Blob(chunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  return (
    <section className="flex flex-col gap-6">
      <h1 className="h2-bold">AI Generate</h1>

      <div className="flex w-full flex-col gap-3 sm:flex-row">
        <Input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe what you want to create"
          className="input-field flex-1"
        />
        <div className="flex gap-2">
          <Button onClick={generateImage} disabled={!canGenerate || isGeneratingImage} className="submit-button">
            {isGeneratingImage ? "Generating..." : "Generate Image"}
          </Button>
          <Button onClick={generateVideo} disabled={isGeneratingVideo || (!canGenerate && !imageUrl)} className="submit-button">
            {isGeneratingVideo ? "Rendering..." : "Generate Video"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-3">
          <h3 className="p-20-semibold">Image</h3>
          <div className="flex min-h-72 items-center justify-center rounded-[12px] border bg-purple-100/10 p-4">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt="generated" className="max-h-[420px] rounded-md" />
            ) : (
              <span className="text-dark-400">No image yet</span>
            )}
          </div>
          {imageUrl && (
            <Button onClick={() => downloadBlobUrl(imageUrl, "zukku_generated.png")} className="submit-button w-40">
              Download Image
            </Button>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="p-20-semibold">Video</h3>
          <div className="flex min-h-72 items-center justify-center rounded-[12px] border bg-purple-100/10 p-4">
            {videoUrl ? (
              <video src={videoUrl} controls className="max-h-[420px] rounded-md" />
            ) : (
              <span className="text-dark-400">No video yet</span>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>
          {videoUrl && (
            <Button onClick={() => downloadBlobUrl(videoUrl, "zukku_generated.webm")} className="submit-button w-40">
              Download Video
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}


