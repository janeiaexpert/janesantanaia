interface ProfileAvatarProps {
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  className?: string;
  src?: string | null;
}

const sizes = {
  sm: "w-16 h-16",
  md: "w-28 h-28",
  lg: "w-36 h-36",
};

const ProfileAvatar = ({ size = "lg", onClick, className = "", src }: ProfileAvatarProps) => {
  return (
    <div
      className={`cursor-pointer ${sizes[size]} shrink-0 flex items-center justify-center overflow-hidden aspect-square rounded-full ${className}`}
      onClick={onClick}
    >
      {src ? (
        <img
          src={src}
          alt="Avatar"
          loading="eager"
          decoding="sync"
          fetchPriority="high"
          width={288}
          height={288}
          className="w-full h-full rounded-full object-cover bg-transparent block"
        />
      ) : (
        <div className="w-full h-full rounded-full bg-muted flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-muted-foreground"
          >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default ProfileAvatar;
