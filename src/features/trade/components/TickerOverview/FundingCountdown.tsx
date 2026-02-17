import React, { useEffect, useState } from "react";

const FundingCountdown = () => {
  const [timeRemaining, setTimeRemaining] = useState("");

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();

      const minutesRemaining = 59 - now.getMinutes();
      const secondsRemaining = 59 - now.getSeconds();

      const min = minutesRemaining.toString().padStart(2, "0");
      const sec = secondsRemaining.toString().padStart(2, "0");

      setTimeRemaining(`00:${min}:${sec}`);
    };

    updateCountdown();

    const intervalId = setInterval(updateCountdown, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return <span>{timeRemaining}</span>;
};
export default FundingCountdown;
