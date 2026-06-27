import { useState } from "react";

/**
 * Agent portrait. Falls back to a tinted monogram if the remote photo
 * fails to load (offline demo safety).
 */
export function AgentAvatar({
  photo,
  name,
  tint,
  accent,
  className = "",
  rounded = "rounded-3xl",
}: {
  photo: string;
  name: string;
  tint: string;
  accent: string;
  className?: string;
  rounded?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`flex items-center justify-center ${rounded} ${className}`}
        style={{ background: tint }}
      >
        <span className="display text-5xl font-bold deva" style={{ color: accent }}>
          {name.slice(0, 1)}
        </span>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden ${rounded} ${className}`} style={{ background: tint }}>
      <img
        src={photo}
        alt={name}
        loading="lazy"
        onError={() => setFailed(true)}
        className="h-full w-full object-cover"
      />
    </div>
  );
}
