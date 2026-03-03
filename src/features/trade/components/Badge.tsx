import React from "react";

import Tag from "@/components/ui/tag";

type Props = {
  value: React.ReactNode;
  className?: string;
};

const Badge = ({ value, className }: Props) => {
  if (!value) return null;

  return <Tag value={value} className={className} />;
};

export default Badge;
