import Link from "next/link";

import { cn } from "@/lib/utils/cn";
import Tag from "@/components/ui/tag";

type Props = {
  dex: string | null;
  symbol: string;
  href: string;
  className?: string;
};

const CoinLink = ({ dex, symbol, href, className }: Props) => {
  return (
    <Link
      href={href}
      className={cn(
        "font-medium hover:text-primary flex items-center gap-x-1",
        className,
      )}
    >
      <p className="line-clamp-2">{symbol}</p>

      {dex && <Tag value={dex} />}
    </Link>
  );
};

export default CoinLink;
