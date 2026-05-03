// actorProxy.ts - Thin proxy that passes all calls through to the real backend.
// After pnpm bindgen the generated Backend class has all 264 methods with correct
// Candid-to-TS translation.  This proxy's only job is to provide the SRD-spell
// and any genuinely-missing safeCall wrappers while forwarding everything else.

import type { DndBackend } from "./types";

async function safeCall<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error("[actorProxy] safeCall caught:", err);
    return fallback;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyActor = Record<string, (...args: any[]) => Promise<any>>;

export function createActorProxy(actor: DndBackend): DndBackend {
  const a = actor as unknown as AnyActor;

  // Only override methods where the generated backend needs a safeCall guard
  // or where the DndBackend interface has a different signature than the raw actor.
  const overrides: Partial<DndBackend> & Record<string, unknown> = {
    // SRD Spells — wrap in safeCall so init failure doesn't crash the app
    async initializeSrdSpells(): Promise<bigint> {
      return safeCall(() => a.initializeSrdSpells(), BigInt(0));
    },
    async getSrdSpells() {
      return safeCall(() => a.getSrdSpells(), []);
    },
  };

  return new Proxy(actor, {
    get(target, prop: string) {
      if (prop in overrides) {
        return overrides[prop as keyof typeof overrides];
      }
      const val = (target as unknown as AnyActor)[prop];
      if (typeof val === "function") {
        return val.bind(target);
      }
      return val;
    },
  }) as DndBackend;
}
