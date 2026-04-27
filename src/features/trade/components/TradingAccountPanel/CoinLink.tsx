import Link from "next/link";

import { ROUTES } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";
import Tag from "@/components/ui/tag";
import { useSettledOutcomeByCoin } from "@/features/predict/hooks/useSettledOutcomeByCoin";

type Props = {
  dex: string | null;
  symbol: string;
  href: string;
  className?: string;
  questionTitle?: string;
};

const CoinLink = ({ dex, symbol, href, className, questionTitle }: Props) => {
  const data = useSettledOutcomeByCoin(symbol);

  let content = symbol;
  let link = href;

  if (data) {
    if (data.status === "loading") {
      content = "";
    } else {
      content = data.outcome.title;
      link = `${ROUTES.predict.event}/${data.outcome.slug}`;
    }
  }

  return (
    <Link
      href={link}
      className={cn(
        "font-medium hover:text-primary flex items-center gap-x-1",
        className,
      )}
    >
      <div className="flex flex-col lg:flex-row-reverse gap-1 items-start lg:items-center">
        {questionTitle && (
          <span className="text-xs lg:text-3xs text-neutral-gray-400 truncate max-w-52 lg:before:content-['('] lg:after:content-[')']">
            {questionTitle}
          </span>
        )}
        <p className="line-clamp-2">{content}</p>
      </div>

      {dex && <Tag value={dex} />}
    </Link>
  );
};

export default CoinLink;
