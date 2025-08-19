"use client";

import React, { RefObject, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Menu, X } from "lucide-react";
import { useOnClickOutside } from "usehooks-ts";

import { cn } from "@/utils/cn";

type Props = {
  links: Array<{
    href: string;
    label: string;
    id: string;
    icon: React.JSX.Element;
    subPaths?: string[];
  }>;
};

const SideBarMenu = ({ links }: Props) => {
  const pathname = usePathname();

  const ref = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useOnClickOutside(ref as RefObject<HTMLElement>, () => {
    setOpen(false);
  });

  if (!isMounted) return null;

  return (
    <>
      <button onClick={() => setOpen(true)}>
        <Menu />
      </button>
      <div
        className={cn(
          "fixed z-50 flex items-center bg-background p-4 flex-col justify-between translate-x-full top-0 right-0 transition-transform duration-300 h-screen ease-out w-full",
          {
            "translate-x-0": open,
          },
        )}
        ref={ref}
      >
        <div className="w-full flex justify-end py-3">
          <button onClick={() => setOpen(false)}>
            <X className="stroke-3" />
          </button>
        </div>
        <div className="flex-1 w-full p-6">
          <ConnectButton />

          <div className="h-full flex flex-col gap-y-6 text-sm py-12">
            {links.map((link) => {
              return (
                <Link
                  key={link.id}
                  href={link.href}
                  prefetch
                  className={cn(
                    "text-white hover:text-primary font-semibold flex items-center gap-x-3",
                    {
                      "text-primary":
                        link.subPaths?.some((path) =>
                          pathname.startsWith(path),
                        ) || pathname.startsWith(link.href),
                    },
                  )}
                  onClick={() => setOpen(false)}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default SideBarMenu;
