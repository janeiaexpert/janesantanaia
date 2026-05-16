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
      className={`profile-ring cursor-pointer ${className}`}
      onClick={onClick}
    >
      <img
        src={profileImage}
        alt="Guia Fácil"
        loading="eager"
        decoding="sync"
        fetchPriority="high"
        className={`${sizes[size]} rounded-full object-cover bg-transparent`}
      />
    </div>
  );
};

export default ProfileAvatar;
