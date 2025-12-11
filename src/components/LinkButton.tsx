import { ExternalLink } from "lucide-react";

interface LinkButtonProps {
  title: string;
  url: string;
  icon?: React.ReactNode;
}

const LinkButton = ({ title, url, icon }: LinkButtonProps) => {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="link-card flex items-center justify-center gap-3 group"
    >
      {icon && <span className="text-primary">{icon}</span>}
      <span className="text-foreground">{title}</span>
      <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </a>
  );
};

export default LinkButton;
