import { ExternalLink, Globe } from "lucide-react";

interface LinkButtonProps {
  title: string;
  url: string;
  icon?: string | null;
}

const LinkButton = ({ title, url, icon }: LinkButtonProps) => {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="link-card group"
    >
      <span className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex-shrink-0 bg-muted flex items-center justify-center overflow-hidden">
        <img
          src="/avatar-jane.png"
          alt=""
          className="w-full h-full object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
            (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
          }}
        />
        <Globe className="w-5 h-5 text-muted-foreground hidden" />
      </span>
      <span className="text-foreground text-sm sm:text-base font-medium flex-1">{title}</span>
      <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </a>
  );
};

export default LinkButton;
