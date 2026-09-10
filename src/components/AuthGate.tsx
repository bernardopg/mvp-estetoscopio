"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const HUB_LOGIN_URL = "https://scalpel.com.br/login.php";

/**
 * Login é do hub (scalpel.com.br), não deste app. Confere a sessão via
 * GET /api/auth/me.php (delega pro hub, mesmo cookie SCALPELSESS) e manda
 * pro login do hub se não houver sessão — com "next" de volta pra cá.
 */
export default function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/auth/me.php", { credentials: "include" });
        if (cancelled) return;

        if (res.ok) {
          setAuthorized(true);
          return;
        }
      } catch {
        // segue pro redirect abaixo
      }

      if (cancelled) return;
      const currentUrl = `${window.location.origin}${pathname}`;
      // Navegação cross-origin de propósito (login mora no hub, outro
      // subdomínio) — useRouter() não serve pra isso.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = `${HUB_LOGIN_URL}?next=${encodeURIComponent(currentUrl)}`;
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
}
