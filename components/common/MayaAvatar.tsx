interface MayaAvatarProps {
  size?: number;
  className?: string;
}

export function MayaAvatar({ size = 96, className = '' }: MayaAvatarProps) {
  return (
    <span
      className={`maya-avatar ${className}`.trim()}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <img src="/maya.png" alt="" className="maya-avatar-image" loading="eager" decoding="async" draggable={false} />
      <span className="maya-avatar-scan" />
      <span className="maya-avatar-frame" />
    </span>
  );
}

export default MayaAvatar;
