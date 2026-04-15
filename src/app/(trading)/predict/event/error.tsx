"use client";

import PredictError from "@/features/predict/components/PredictError";

const ErrorPage = () => {
  return (
    <div className="w-full h-svh max-w-7xl mx-auto py-4 flex flex-col items-center justify-center">
      <PredictError
        title="Something went wrong"
        description="We're having trouble loading market events. Please try again later."
      />
    </div>
  );
};

export default ErrorPage;
