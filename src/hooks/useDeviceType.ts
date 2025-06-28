import { useEffect, useState } from "react";

export function useDeviceType() {
  const [device, setDevice] = useState<"mobile" | "tablet" | "desktop">(
    "desktop"
  );

  useEffect(() => {
    const updateDevice = () => {
      const width = window.innerWidth;
      if (width <= 640) setDevice("mobile");
      else if (width <= 1024) setDevice("tablet");
      else setDevice("desktop");
    };

    updateDevice();
    window.addEventListener("resize", updateDevice);
    return () => window.removeEventListener("resize", updateDevice);
  }, []);

  return device;
}
