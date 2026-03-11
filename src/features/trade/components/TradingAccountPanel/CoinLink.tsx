import Link from "next/link";

import Tag from "@/components/ui/tag";

type Props = {
  dex: string | null;
  symbol: string;
  href: string;
};

const CoinLink = ({ dex, symbol, href }: Props) => {
  return (
    <Link
      href={href}
      className="font-medium hover:text-primary flex items-center gap-x-1"
    >
      <p>{symbol}</p>

      {dex && <Tag value={dex} />}
    </Link>
  );
};

export default CoinLink;
