import { useCallback, useEffect, useRef, useState } from "react";
import type { Page } from "../App";
import type { DndBackend } from "../types";

// Local shape aliases — avoid naming conflicts with types.ts duplicates
interface NpcShape {
  id: string;
  name: string;
  relationship: string;
  location: string;
}
interface LocationShape {
  id: string;
  name: string;
  locationType: string;
  region: string;
}
interface LoreShape {
  id: string;
  title: string;
  category: string;
}
interface TimelineShape {
  id: string;
  title: string;
  date: string;
  category: string;
}
interface SessionShape {
  id: string;
  title: string;
  date: string;
}
interface EncounterShape {
  id: string;
  name: string;
  difficulty: string;
  outcome: string;
}
interface CampaignShape {
  id: string;
  name: string;
  description: string;
}
interface FactionShape {
  id: bigint;
  name: string;
  goals: string;
}
interface ArmyShape {
  id: string;
  name: string;
  size: bigint;
}
interface QuestShape {
  id: string;
  title: string;
  status: string;
}

interface Props {
  actor: DndBackend;
  setPage: (p: Page) => void;
  onClose: () => void;
}

type Category =
  | "Characters"
  | "Armies"
  | "Spells"
  | "Abilities"
  | "Items"
  | "Attacks"
  | "Races"
  | "Classes"
  | "Skills"
  | "Feats"
  | "NPCs"
  | "Quests"
  | "Factions"
  | "Locations"
  | "Lore"
  | "Timeline"
  | "Sessions"
  | "Encounters"
  | "Campaigns";

interface SearchResult {
  id: string;
  category: Category;
  name: string;
  secondary?: string;
  page: Page;
}

const CATEGORY_EMOJI: Record<Category, string> = {
  Characters: "🧙",
  Armies: "⚔️",
  Spells: "✨",
  Abilities: "💫",
  Items: "🎒",
  Attacks: "🗡️",
  Races: "🧬",
  Classes: "📜",
  Skills: "🎯",
  Feats: "⭐",
  NPCs: "👤",
  Quests: "📋",
  Factions: "🏴",
  Locations: "📍",
  Lore: "📖",
  Timeline: "🕰️",
  Sessions: "🎲",
  Encounters: "⚡",
  Campaigns: "🏰",
};

const CATEGORY_ORDER: Category[] = [
  "Characters",
  "Armies",
  "Spells",
  "Abilities",
  "Items",
  "Attacks",
  "Races",
  "Classes",
  "Skills",
  "Feats",
  "NPCs",
  "Quests",
  "Factions",
  "Locations",
  "Lore",
  "Timeline",
  "Sessions",
  "Encounters",
  "Campaigns",
];

type DndActor = DndBackend & {
  getAllRaces: () => Promise<
    Array<[bigint, { name: string; description: string }]>
  >;
  getAllClasses: () => Promise<
    Array<[bigint, { name: string; hitDie: bigint }]>
  >;
};

export default function GlobalSearch({ actor, setPage, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [allResults, setAllResults] = useState<SearchResult[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const hasFetched = useRef(false);

  // Fetch all data once on first open
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    void (async () => {
      setLoading(true);
      const results: SearchResult[] = [];
      const a = actor as unknown as DndActor;

      const safely = async <T,>(
        fn: () => Promise<T>,
        fallback: T,
      ): Promise<T> => {
        try {
          return await fn();
        } catch {
          return fallback;
        }
      };

      const [
        chars,
        armies,
        spells,
        abilities,
        items,
        attacks,
        races,
        classes,
        skills,
        feats,
        npcs,
        locations,
        lore,
        factions,
        sessions,
        encounters,
        timeline,
        campaigns,
        allChars,
      ] = await Promise.all([
        safely(() => a.getAllCharacters(), []),
        safely(() => a.getArmies(), []),
        safely(() => a.getAllCustomSpells(), []),
        safely(() => a.getAllCustomAbilities(), []),
        safely(() => a.getAllCustomItems(), []),
        safely(() => a.getAllCustomPhysicalAttacks(), []),
        safely(() => a.getAllRaces(), []),
        safely(() => a.getAllClasses(), []),
        safely(() => a.getAllCustomSkills(), []),
        safely(() => a.getAllCustomFeats(), []),
        safely(() => a.getNPCs(), []),
        safely(() => a.getLocations(), []),
        safely(() => a.getLoreEntries(), []),
        safely(() => a.getFactions(), []),
        safely(() => a.getSessionLog(), []),
        safely(() => a.getEncounterLog(), []),
        safely(() => a.getTimelineEvents(), []),
        safely(() => a.getCampaigns(), []),
        // also fetch chars for quest lookups
        safely(() => a.getAllCharacters(), []),
      ]);

      // Characters: tuples [id, Character]
      for (const [id, c] of chars as Array<
        [
          bigint,
          { name: string; race: string; characterClass: string; level: bigint },
        ]
      >) {
        results.push({
          id: `char-${id}`,
          category: "Characters",
          name: c.name || "Unnamed Character",
          secondary: `${c.race} ${c.characterClass} — Lv${c.level}`,
          page: { name: "sheet", characterId: id },
        });
      }

      // Armies: direct objects
      for (const a2 of armies as unknown as ArmyShape[]) {
        results.push({
          id: `army-${a2.id}`,
          category: "Armies",
          name: a2.name || "Unnamed Army",
          secondary: a2.size ? `${a2.size} troops` : undefined,
          page: { name: "army", armyId: a2.id },
        });
      }

      // Spells: tuples [id, CustomSpell]
      for (const [id, s] of spells as Array<
        [bigint, { name: string; level: bigint; school: string }]
      >) {
        results.push({
          id: `spell-${id}`,
          category: "Spells",
          name: s.name,
          secondary: `Level ${s.level} · ${s.school}`,
          page: { name: "settings" },
        });
      }

      // Abilities: tuples [id, CustomAbility]
      for (const [id, ab] of abilities as Array<
        [bigint, { name: string; description: string; abilityType: string }]
      >) {
        results.push({
          id: `ability-${id}`,
          category: "Abilities",
          name: ab.name,
          secondary: ab.abilityType || ab.description.slice(0, 60),
          page: { name: "settings" },
        });
      }

      // Items: tuples [id, CustomItem]
      for (const [id, it] of items as Array<
        [bigint, { name: string; itemType: string }]
      >) {
        results.push({
          id: `item-${id}`,
          category: "Items",
          name: it.name,
          secondary: it.itemType,
          page: { name: "settings" },
        });
      }

      // Attacks: tuples [id, CustomPhysicalAttack]
      for (const [id, at] of attacks as Array<
        [bigint, { name: string; damageType: string }]
      >) {
        results.push({
          id: `attack-${id}`,
          category: "Attacks",
          name: at.name,
          secondary: at.damageType,
          page: { name: "settings" },
        });
      }

      // Races: tuples [id, CustomRace]
      for (const [id, r] of races as Array<
        [bigint, { name: string; description: string }]
      >) {
        results.push({
          id: `race-${id}`,
          category: "Races",
          name: r.name,
          secondary: r.description ? r.description.slice(0, 60) : undefined,
          page: { name: "settings" },
        });
      }

      // Classes: tuples [id, CustomClass]
      for (const [id, cl] of classes as Array<
        [bigint, { name: string; hitDie: bigint }]
      >) {
        results.push({
          id: `class-${id}`,
          category: "Classes",
          name: cl.name,
          secondary: cl.hitDie ? `d${cl.hitDie} hit die` : undefined,
          page: { name: "settings" },
        });
      }

      // Skills: direct objects with id
      for (const sk of skills as Array<{
        id: bigint;
        name: string;
        statBased: string;
      }>) {
        results.push({
          id: `skill-${sk.id}`,
          category: "Skills",
          name: sk.name,
          secondary: sk.statBased,
          page: { name: "settings" },
        });
      }

      // Feats: direct objects with id
      for (const ft of feats as Array<{
        id: bigint;
        name: string;
        description: string;
      }>) {
        results.push({
          id: `feat-${ft.id}`,
          category: "Feats",
          name: ft.name,
          secondary: ft.description ? ft.description.slice(0, 60) : undefined,
          page: { name: "settings" },
        });
      }

      // NPCs: direct objects, id is string
      for (const n of npcs as unknown as NpcShape[]) {
        results.push({
          id: `npc-${n.id}`,
          category: "NPCs",
          name: n.name,
          secondary: n.relationship || n.location,
          page: { name: "world" },
        });
      }

      // Quests: fetch per character
      const charIds = (allChars as Array<[bigint, unknown]>).map(([id]) => id);
      const questArrays = await Promise.all(
        charIds.map((id) => safely(() => a.getQuestsByCharacter(id), [])),
      );
      for (const qs of questArrays) {
        for (const q of qs as unknown as QuestShape[]) {
          results.push({
            id: `quest-${q.id}`,
            category: "Quests",
            name: q.title,
            secondary: q.status,
            page: { name: "campaign" },
          });
        }
      }

      // Factions: direct objects, id is bigint
      for (const f of factions as unknown as FactionShape[]) {
        results.push({
          id: `faction-${f.id}`,
          category: "Factions",
          name: f.name,
          secondary: f.goals ? f.goals.slice(0, 60) : undefined,
          page: { name: "world" },
        });
      }

      // Locations: direct objects, id is string
      for (const lo of locations as unknown as LocationShape[]) {
        results.push({
          id: `loc-${lo.id}`,
          category: "Locations",
          name: lo.name,
          secondary: lo.locationType || lo.region,
          page: { name: "world" },
        });
      }

      // Lore: direct objects, id is string
      for (const lr of lore as unknown as LoreShape[]) {
        results.push({
          id: `lore-${lr.id}`,
          category: "Lore",
          name: lr.title,
          secondary: lr.category,
          page: { name: "world" },
        });
      }

      // Timeline: direct objects, id is string
      for (const te of timeline as unknown as TimelineShape[]) {
        results.push({
          id: `timeline-${te.id}`,
          category: "Timeline",
          name: te.title,
          secondary: te.date || te.category,
          page: { name: "world" },
        });
      }

      // Sessions: direct objects, id is string
      for (const se of sessions as unknown as SessionShape[]) {
        results.push({
          id: `session-${se.id}`,
          category: "Sessions",
          name: se.title,
          secondary: se.date,
          page: { name: "campaign" },
        });
      }

      // Encounters: direct objects, id is string
      for (const en of encounters as unknown as EncounterShape[]) {
        results.push({
          id: `enc-${en.id}`,
          category: "Encounters",
          name: en.name,
          secondary: en.difficulty || en.outcome,
          page: { name: "campaign" },
        });
      }

      // Campaigns: direct objects, id is string
      for (const ca of campaigns as unknown as CampaignShape[]) {
        results.push({
          id: `campaign-${ca.id}`,
          category: "Campaigns",
          name: ca.name,
          secondary: ca.description ? ca.description.slice(0, 60) : undefined,
          page: { name: "campaign" },
        });
      }

      setAllResults(results);
      setLoading(false);
    })();
  }, [actor]);

  // Focus input when opened
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  // Filter results
  const filtered = query.trim()
    ? allResults.filter((r) =>
        `${r.name} ${r.secondary ?? ""} ${r.category}`
          .toLowerCase()
          .includes(query.trim().toLowerCase()),
      )
    : [];

  // Group by category in display order
  const grouped: Array<{ category: Category; results: SearchResult[] }> = [];
  for (const cat of CATEGORY_ORDER) {
    const catItems = filtered.filter((r) => r.category === cat);
    if (catItems.length > 0) grouped.push({ category: cat, results: catItems });
  }

  const flatFiltered = grouped.flatMap((g) => g.results);

  // Reset active index when results change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setActiveIdx(0);
  }, []);

  // Scroll active result into view
  useEffect(() => {
    const el = listRef.current?.querySelector(
      `[data-result-idx="${activeIdx}"]`,
    ) as HTMLElement | null;
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIdx]);

  const handleSelect = useCallback(
    (result: SearchResult) => {
      setPage(result.page);
      onClose();
    },
    [setPage, onClose],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
      return;
    }
    if (flatFiltered.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, flatFiltered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const r = flatFiltered[activeIdx];
      if (r) handleSelect(r);
    }
  };

  // ---- Shared style fragments ----
  const kbdStyle: React.CSSProperties = {
    background: "var(--ds-bg)",
    border: "1px solid var(--ds-border)",
    borderRadius: 4,
    padding: "2px 6px",
    fontSize: 11,
    color: "var(--ds-muted)",
    fontFamily: "Inter, sans-serif",
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        role="presentation"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1000,
          backgroundColor: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(2px)",
        }}
        data-ocid="global_search.backdrop"
      />

      {/* Panel */}
      <div
        role="presentation"
        aria-label="Global search"
        style={{
          position: "fixed",
          zIndex: 1001,
          top: "clamp(16px, 8vh, 80px)",
          left: "50%",
          transform: "translateX(-50%)",
          width: "min(680px, calc(100vw - 32px))",
          maxHeight: "calc(100vh - clamp(32px, 16vh, 160px))",
          backgroundColor: "var(--ds-surface)",
          border: "1px solid var(--ds-border)",
          borderRadius: 12,
          boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
        data-ocid="global_search.dialog"
      >
        {/* Search input row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 16px",
            borderBottom: "1px solid var(--ds-border)",
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 18, opacity: 0.6, flexShrink: 0 }}>🔍</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search everything..."
            aria-label="Search everything"
            autoComplete="off"
            spellCheck={false}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              color: "var(--ds-text)",
              fontSize: 16,
              fontFamily: "Inter, sans-serif",
              minWidth: 0,
            }}
            data-ocid="global_search.input"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              style={{
                background: "transparent",
                border: "none",
                color: "var(--ds-muted)",
                cursor: "pointer",
                fontSize: 18,
                lineHeight: 1,
                padding: 2,
                flexShrink: 0,
              }}
            >
              ✕
            </button>
          )}
          <kbd style={kbdStyle}>Esc</kbd>
        </div>

        {/* Results / hints area */}
        <div
          ref={listRef}
          style={{ overflowY: "auto", flex: 1, minHeight: 0 }}
          aria-label="Search results"
          tabIndex={-1}
        >
          {/* Loading */}
          {loading && (
            <div
              style={{
                padding: "32px 0",
                textAlign: "center",
                color: "var(--ds-muted)",
                fontSize: 14,
              }}
              data-ocid="global_search.loading_state"
            >
              <span style={{ fontSize: 24, display: "block", marginBottom: 8 }}>
                ⏳
              </span>
              Loading your data...
            </div>
          )}

          {/* Hint: empty query */}
          {!loading && !query.trim() && (
            <div
              style={{
                padding: "32px 0",
                textAlign: "center",
                color: "var(--ds-muted)",
                fontSize: 14,
              }}
              data-ocid="global_search.empty_state"
            >
              <span style={{ fontSize: 28, display: "block", marginBottom: 8 }}>
                🔍
              </span>
              Type to search across all characters, armies, spells, and more
              <div style={{ marginTop: 12, fontSize: 12, opacity: 0.6 }}>
                <kbd style={kbdStyle}>↑↓</kbd> to navigate ·{" "}
                <kbd style={kbdStyle}>Enter</kbd> to open
              </div>
            </div>
          )}

          {/* No results */}
          {!loading && query.trim() && flatFiltered.length === 0 && (
            <div
              style={{
                padding: "32px 0",
                textAlign: "center",
                color: "var(--ds-muted)",
                fontSize: 14,
              }}
              data-ocid="global_search.empty_state"
            >
              <span style={{ fontSize: 28, display: "block", marginBottom: 8 }}>
                🧐
              </span>
              No results for &ldquo;
              <strong style={{ color: "var(--ds-text)" }}>{query}</strong>
              &rdquo;
            </div>
          )}

          {/* Results grouped by category */}
          {!loading &&
            grouped.map((group) => {
              let runningIdx = flatFiltered.indexOf(group.results[0]);
              return (
                <div key={group.category}>
                  {/* Category header */}
                  <div
                    style={{
                      padding: "8px 16px 4px",
                      fontSize: 11,
                      fontWeight: 600,
                      color: "var(--ds-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      fontFamily: "Inter, sans-serif",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <span>{CATEGORY_EMOJI[group.category]}</span>
                    <span>{group.category}</span>
                    <span
                      style={{
                        marginLeft: 4,
                        background: "var(--ds-bg)",
                        border: "1px solid var(--ds-border)",
                        borderRadius: 8,
                        padding: "0 6px",
                        fontSize: 10,
                      }}
                    >
                      {group.results.length}
                    </span>
                  </div>

                  {/* Results in category */}
                  {group.results.map((result) => {
                    const idx = runningIdx++;
                    const isActive = idx === activeIdx;
                    return (
                      <button
                        key={result.id}
                        type="button"
                        aria-selected={isActive}
                        data-result-idx={idx}
                        onClick={() => handleSelect(result)}
                        onMouseEnter={() => setActiveIdx(idx)}
                        style={{
                          display: "flex",
                          width: "100%",
                          alignItems: "center",
                          gap: 10,
                          padding: "9px 16px",
                          border: "none",
                          borderLeft: isActive
                            ? "3px solid var(--ds-gold)"
                            : "3px solid transparent",
                          background: isActive
                            ? "rgba(180,140,60,0.08)"
                            : "transparent",
                          cursor: "pointer",
                          textAlign: "left",
                          fontFamily: "Inter, sans-serif",
                          transition: "background 0.1s",
                        }}
                        data-ocid={`global_search.result.${group.category.toLowerCase()}`}
                      >
                        <span style={{ fontSize: 16, flexShrink: 0 }}>
                          {CATEGORY_EMOJI[result.category]}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              color: "var(--ds-text)",
                              fontSize: 14,
                              fontWeight: 500,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {result.name}
                          </div>
                          {result.secondary && (
                            <div
                              style={{
                                color: "var(--ds-muted)",
                                fontSize: 12,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {result.secondary}
                            </div>
                          )}
                        </div>
                        <span
                          style={{
                            flexShrink: 0,
                            fontSize: 10,
                            color: "var(--ds-muted)",
                            background: "var(--ds-bg)",
                            border: "1px solid var(--ds-border)",
                            borderRadius: 4,
                            padding: "1px 5px",
                            fontWeight: 500,
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                          }}
                        >
                          {result.category}
                        </span>
                      </button>
                    );
                  })}
                </div>
              );
            })}
        </div>

        {/* Footer */}
        {!loading && flatFiltered.length > 0 && (
          <div
            style={{
              borderTop: "1px solid var(--ds-border)",
              padding: "6px 16px",
              fontSize: 11,
              color: "var(--ds-muted)",
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexShrink: 0,
              fontFamily: "Inter, sans-serif",
            }}
          >
            <span>
              {flatFiltered.length} result{flatFiltered.length !== 1 ? "s" : ""}
            </span>
            <span style={{ opacity: 0.5 }}>·</span>
            <kbd style={kbdStyle}>↵</kbd>
            <span>to open</span>
          </div>
        )}
      </div>
    </>
  );
}
