type Props = {
  title: string;
  description: string;
  action?: React.ReactNode;
};

const PredictError = ({ title, description, action }: Props) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-mirror-round-icon lucide-mirror-round size-12"
      >
        <path d="M10 6.6 8.6 8" />
        <path d="M12 18v4" />
        <path d="M15 7.5 9.5 13" />
        <path d="M7 22h10" />
        <circle cx="12" cy="10" r="8" />
      </svg>

      <p className="text-white text-2xl font-bold">{title}</p>
      <p className="text-gray-400 text-sm font-medium max-w-sm text-center">
        {description}
      </p>

      {action}
    </div>
  );
};

export default PredictError;
