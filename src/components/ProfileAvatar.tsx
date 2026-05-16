import profileImage from "@/assets/profile.jpeg";

interface ProfileAvatarProps {
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  className?: string;
}

const sizes = {
  sm: "w-16 h-16",
  md: "w-28 h-28",
  lg: "w-36 h-36",
};

const ProfileAvatar = ({ size = "lg", onClick, className = "" }: ProfileAvatarProps) => {
  return (
    <div
      className={`profile-ring cursor-pointer ${sizes[size]} shrink-0 flex items-center justify-center overflow-hidden aspect-square ${className}`}
      onClick={onClick}
    >
      <img
        src={profileImage}
        alt="Guia Fácil"
        loading="eager"
        decoding="sync"
        fetchPriority="high"
        width={288}
        height={288}
        className="w-full h-full rounded-full object-cover bg-transparent block"
      />
    </div>
  );
};

export default ProfileAvatar;
