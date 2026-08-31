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
      className={`cursor-pointer ${sizes[size]} shrink-0 flex items-center justify-center overflow-hidden rounded-full ${className}`}
      onClick={onClick}
    >
      {src ? (
        <img
          src={src}
          alt="Avatar"
          loading="eager"
          decoding="sync"
          fetchPriority="high"
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <div className="w-full h-full rounded-full bg-muted flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default ProfileAvatar;
