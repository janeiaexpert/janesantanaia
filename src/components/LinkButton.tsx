import { ExternalLink, Globe, ExternalLinkIcon } from "lucide-react";

interface LinkButtonProps {
  title: string;
  url: string;
  icon?: string | null;
}

const getFaviconUrl = (url: string): string | null => {
  try {
    const hostname = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
  } catch {
    return null;
  }
};

const LinkButton = ({ title, url, icon }: LinkButtonProps) => {
  const faviconUrl = getFaviconUrl(url);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="link-card group"
    >
      <span className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
        {faviconUrl ? (
          <img
            src={faviconUrl}
            alt=""
            className="w-6 h-6"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
              (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
            }}
          />
        ) : null}
        <Globe className={`w-5 h-5 text-muted-foreground ${faviconUrl ? "hidden" : ""}`} />
      </span>
      <span className="text-foreground text-base font-medium">{title}</span>
      <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
    </a>
  );
};

export default LinkButton;