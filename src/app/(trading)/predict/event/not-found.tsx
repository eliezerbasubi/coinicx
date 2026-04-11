import Link from "next/link";

import { Button } from "@/components/ui/button";
import PredictError from "@/features/predict/components/PredictError";

const NotFoundPage = () => {
  return (
    <div className="w-full h-[calc(100svh-64px)] max-w-7xl mx-auto px-4 md:px-0">
      <PredictError
        title="Event not found"
        description="We can't seem to find the event you're looking for. Check to see if the link you're trying to visit is correct."
        action={
          <Button asChild className="w-fit px-3" size="sm">
            <Link href="/predict">Go to home</Link>
          </Button>
        }
      />
    </div>
  );
};

export default NotFoundPage;
