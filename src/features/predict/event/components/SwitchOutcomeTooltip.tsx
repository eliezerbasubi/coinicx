import { ArrowLeftRight } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Props = {
  value: string;
  onClick?: () => void;
};

const SwitchOutcomeTooltip = ({ value, onClick }: Props) => {
  return (
    <Tooltip>
      <TooltipTrigger className="pl-2" onClick={onClick}>
        <ArrowLeftRight className="size-4 text-neutral-gray-400" />
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-white">Switch to {value}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default SwitchOutcomeTooltip;
