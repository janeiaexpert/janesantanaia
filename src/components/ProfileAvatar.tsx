interface ProfileAvatarProps {
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  className?: string;
  src?: string | null;
}

const sizes = {
  sm: "w-14 h-14 sm:w-16 sm:h-16",
  md: "w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28",
  lg: "w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36",
};

const ProfileAvatar = ({ size = "lg", onClick, className = "", src }: ProfileAvatarProps) => {
  return (
    <div
      className={`cursor-pointer shrink-0 flex items-center justify-center ${className}`}
      onClick={onClick}
      style={{ width: "auto", height: "auto" }}
    >
      <img
        src={src || "/avatar-jane.png"}
        alt="Avatar"
        loading="eager"
        decoding="sync"
        fetchPriority="high"
        className="rounded-full object-contain"
        style={{ width: "100%", height: "100%", maxWidth: size === "lg" ? "180px" : size === "md" ? "120px" : "80px", maxHeight: size === "lg" ? "180px" : size === "md" ? "120px" : "80px" }}
        onError={(e) => {
          (e.target as HTMLImageElement).src = "/avatar-jane.png";
        }}
      />
    </div>
  );
};

export default ProfileAvatar;
