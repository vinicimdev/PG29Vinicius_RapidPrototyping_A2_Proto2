import { useState, useRef } from "react";

// ─────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────

const CAT_COLORS = {
  Fire: "#f97316", Ice: "#38bdf8", Earth: "#84cc16",
  Magic: "#a78bfa", Physical: "#fb7185", Fusion: "#e879f9",
};

const BASE_CARDS = [
  { id: 1,  title: "Fire Sky",       category: "Fire",     description: "Rains fire on all enemies for 3 turns.",          str: 85, spd: 60, def: 20 },
  { id: 2,  title: "Fire Shield",    category: "Fire",     description: "Flame shield burns attackers.",                   str: 50, spd: 45, def: 75 },
  { id: 3,  title: "Burning Flames", category: "Fire",     description: "DoT flames on a single target for 5 turns.",      str: 70, spd: 55, def: 15 },
  { id: 4,  title: "Ice Spike",      category: "Ice",      description: "Pierces armor, slows movement.",                  str: 65, spd: 80, def: 30 },
  { id: 5,  title: "Blizzard",       category: "Ice",      description: "Freezes all enemies, heavy area damage.",         str: 90, spd: 40, def: 25 },
  { id: 6,  title: "Frost Nova",     category: "Ice",      description: "Icy explosion freezes nearby enemies.",           str: 60, spd: 70, def: 45 },
  { id: 7,  title: "Stone Wall",     category: "Earth",    description: "Blocks enemy advances and projectiles.",          str: 20, spd: 15, def: 95 },
  { id: 8,  title: "Earthquake",     category: "Earth",    description: "Stuns ground units, massive area damage.",        str: 95, spd: 30, def: 20 },
  { id: 9,  title: "Magic Missile",  category: "Magic",    description: "Arcane bolt that ignores most defenses.",         str: 75, spd: 90, def: 10 },
  { id: 10, title: "Magic Wall",     category: "Magic",    description: "Deflects spells and physical projectiles.",       str: 15, spd: 25, def: 90 },
  { id: 11, title: "Heal Area",      category: "Magic",    description: "Restores health to allies over several turns.",   str: 10, spd: 50, def: 80 },
  { id: 12, title: "Kick",           category: "Physical", description: "Deals damage, pushes enemy two spaces.",          str: 55, spd: 75, def: 30 },
  { id: 13, title: "Face Punch",     category: "Physical", description: "Stuns enemy for one turn, high damage.",          str: 80, spd: 65, def: 15 },
  { id: 14, title: "Slash",          category: "Physical", description: "Hits all enemies in a line.",                    str: 60, spd: 85, def: 20 },
  { id: 15, title: "Boulder Toss",   category: "Earth",    description: "Massive damage and knockdown.",                   str: 88, spd: 20, def: 30 },
  { id: 16, title: "Ice Armor",      category: "Ice",      description: "Boosts defense drastically for 4 turns.",        str: 10, spd: 30, def: 92 },
  { id: 17, title: "Phoenix Rise",   category: "Fire",     description: "Revive with full health once per battle.",        str: 40, spd: 55, def: 70 },
  { id: 18, title: "Shadow Step",    category: "Magic",    description: "Blink to any position instantly.",                str: 35, spd: 99, def: 25 },
];

// Fusion recipes: [cardId_A, cardId_B] → fusion template
// Same result card can come from different pairs → stats will differ based on input stats
const FUSION_RECIPES = [
  { inputs: [1, 5],  result: { id: 101, title: "Storm of Cinders",  category: "Fusion", description: "A tempest of fire and ice tears through the battlefield." } },
  { inputs: [3, 5],  result: { id: 101, title: "Storm of Cinders",  category: "Fusion", description: "A tempest of fire and ice tears through the battlefield." } },
  { inputs: [8, 13], result: { id: 102, title: "Titan Crash",        category: "Fusion", description: "A devastating physical shockwave from pure brute force." } },
  { inputs: [7, 13], result: { id: 102, title: "Titan Crash",        category: "Fusion", description: "A devastating physical shockwave from pure brute force." } },
  { inputs: [9, 4],  result: { id: 103, title: "Arcane Needle",      category: "Fusion", description: "A magical ice lance that penetrates any shield." } },
  { inputs: [9, 6],  result: { id: 103, title: "Arcane Needle",      category: "Fusion", description: "A magical ice lance that penetrates any shield." } },
  { inputs: [2, 16], result: { id: 104, title: "Eternal Fortress",   category: "Fusion", description: "An impenetrable barrier of flame and frost." } },
  { inputs: [10, 16],result: { id: 104, title: "Eternal Fortress",   category: "Fusion", description: "An impenetrable barrier of flame and frost." } },
  { inputs: [17, 11],result: { id: 105, title: "Undying Light",      category: "Fusion", description: "A radiant force that heals and revives all allies." } },
  { inputs: [18, 14],result: { id: 106, title: "Phantom Blade",      category: "Fusion", description: "A shadow slash that strikes without warning." } },
  { inputs: [18, 12],result: { id: 106, title: "Phantom Blade",      category: "Fusion", description: "A shadow slash that strikes without warning." } },
];

function computeFusionStats(cardA, cardB) {
  // Stats are a weighted blend influenced by the individual card strengths
  const boost = 1.15; // fusion cards are a bit stronger than average
  return {
    str: Math.min(99, Math.round((cardA.str * 0.6 + cardB.str * 0.4) * boost)),
    spd: Math.min(99, Math.round((cardA.spd * 0.5 + cardB.spd * 0.5) * boost)),
    def: Math.min(99, Math.round((cardA.def * 0.4 + cardB.def * 0.6) * boost)),
  };
}

function findFusion(cardA, cardB) {
  const ids = [cardA.id, cardB.id].sort((a, b) => a - b);
  const recipe = FUSION_RECIPES.find(r => {
    const rIds = [...r.inputs].sort((a, b) => a - b);
    return rIds[0] === ids[0] && rIds[1] === ids[1];
  });
  if (!recipe) return null;
  const stats = computeFusionStats(cardA, cardB);
  return { ...recipe.result, ...stats, isFused: true, sourceIds: [cardA.id, cardB.id] };
}

const COPIES = 3;
const DECK_SIZE = 10;
const MAX_COPIES_PER_DECK = 2;
const FROM_INVENTORY = "inventory";
const FROM_DECK = "deck";

// ─────────────────────────────────────────────────────────────
// SMALL HELPERS
// ─────────────────────────────────────────────────────────────

function CardImage({ category, size = "md" }) {
  const h = size === "lg" ? 200 : size === "sm" ? 62 : 90;
  const color = CAT_COLORS[category] || "#94a3b8";
  return (
    <svg width="100%" height={h} viewBox="0 0 160 120" preserveAspectRatio="xMidYMid slice"
      style={{ display: "block", borderRadius: 6, background: color + "22" }}>
      <rect width="160" height="120" fill={color + "18"} rx="6" />
      <line x1="0" y1="0" x2="160" y2="120" stroke={color + "66"} strokeWidth="2.5" />
      <line x1="160" y1="0" x2="0" y2="120" stroke={color + "66"} strokeWidth="2.5" />
      {size === "lg" && (
        <text x="80" y="68" textAnchor="middle" fontSize="28" fill={color + "88"} fontFamily="sans-serif">
          {category === "Fire" ? "🔥" : category === "Ice" ? "❄️" : category === "Earth" ? "🌍"
            : category === "Magic" ? "✨" : category === "Physical" ? "⚡" : "💫"}
        </text>
      )}
    </svg>
  );
}

function CategoryBadge({ category }) {
  return (
    <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.04em", color: CAT_COLORS[category] || "#64748b", background: (CAT_COLORS[category] || "#64748b") + "1a", borderRadius: 4, padding: "1px 6px", fontFamily: "inherit" }}>
      {category}
    </span>
  );
}

function StatBar({ label, value, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <span style={{ fontSize: 9, color: "#94a3b8", width: 22, fontFamily: "inherit", fontWeight: 600 }}>{label}</span>
      <div style={{ flex: 1, height: 5, background: "#e2e8f0", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ width: `${value}%`, height: "100%", background: color, borderRadius: 99, transition: "width 0.3s" }} />
      </div>
      <span style={{ fontSize: 9, color: "#64748b", width: 20, textAlign: "right", fontFamily: "inherit" }}>{value}</span>
    </div>
  );
}

function Toast({ message, visible }) {
  return (
    <div style={{ position: "fixed", bottom: 24, left: "50%", transform: `translateX(-50%) translateY(${visible ? 0 : 12}px)`, opacity: visible ? 1 : 0, background: "#0f172a", color: "#fff", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.2)", transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)", zIndex: 9999, pointerEvents: "none", fontFamily: "inherit" }}>
      {message}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CARD MODAL
// ─────────────────────────────────────────────────────────────

function CardModal({ card, onClose, onAdd, copiesInDeck, deckFull }) {
  if (!card) return null;
  const atMax = copiesInDeck >= MAX_COPIES_PER_DECK;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", border: `3px solid ${CAT_COLORS[card.category] || "#e2e8f0"}`, borderRadius: 20, padding: "24px 24px 20px", width: 340, maxWidth: "90vw", boxShadow: "0 24px 60px rgba(0,0,0,0.18)", position: "relative", animation: "popIn 0.2s cubic-bezier(0.34,1.56,0.64,1)" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 12, right: 14, background: "#f1f5f9", border: "none", borderRadius: 8, width: 30, height: 30, cursor: "pointer", fontSize: 15, fontWeight: 700, color: "#475569", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: CAT_COLORS[card.category] || "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, fontWeight: 800, flexShrink: 0 }}>{card.title[0]}</div>
          <div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#0f172a", fontFamily: "inherit" }}>{card.title}</h2>
            <CategoryBadge category={card.category} />
            {card.isFused && <span style={{ marginLeft: 5, fontSize: 9.5, color: "#e879f9", fontWeight: 700 }}>✦ FUSION</span>}
          </div>
        </div>
        <CardImage category={card.category} size="lg" />
        <p style={{ fontSize: 13, color: "#334155", lineHeight: 1.6, margin: "12px 0 10px", fontFamily: "inherit" }}>{card.description}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 16, padding: "10px 12px", background: "#f8fafc", borderRadius: 10 }}>
          <StatBar label="STR" value={card.str} color="#f97316" />
          <StatBar label="SPD" value={card.spd} color="#38bdf8" />
          <StatBar label="DEF" value={card.def} color="#84cc16" />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "#94a3b8" }}>{copiesInDeck}/{MAX_COPIES_PER_DECK} copies in deck</span>
          {atMax ? <span style={{ fontSize: 12, color: "#f97316", fontStyle: "italic" }}>Max copies reached</span>
            : deckFull ? <span style={{ fontSize: 12, color: "#f97316", fontStyle: "italic" }}>Deck full</span>
              : <button onClick={() => { onAdd(card); onClose(); }} style={{ background: CAT_COLORS[card.category] || "#0f172a", color: "#fff", border: "none", borderRadius: 10, padding: "9px 24px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Add to Deck</button>}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// INVENTORY CARD
// ─────────────────────────────────────────────────────────────

function InventoryCard({ card, selected, copiesInDeck, fusionSelected, onClick, onDragStart, onDragEnd }) {
  const [isDragging, setIsDragging] = useState(false);
  const inDeck = copiesInDeck > 0;

  function handleDragStart(e) {
    setIsDragging(true);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", JSON.stringify({ source: FROM_INVENTORY, card }));
    onDragStart?.();
  }

  return (
    <div draggable onClick={onClick} onDragStart={handleDragStart} onDragEnd={() => { setIsDragging(false); onDragEnd?.(); }}
      style={{ background: fusionSelected ? "#fdf4ff" : inDeck ? "#f0fdf4" : selected ? "#fff" : "#f8fafc", border: `2px solid ${fusionSelected ? "#e879f9" : selected ? "#f59e0b" : inDeck ? "#86efac" : "#e2e8f0"}`, borderRadius: 10, padding: "8px 8px 10px", cursor: isDragging ? "grabbing" : "grab", transition: "all 0.18s ease", transform: isDragging ? "scale(0.9) rotate(-3deg)" : fusionSelected ? "translateY(-4px) scale(1.02)" : selected ? "translateY(-6px) scale(1.03)" : "none", opacity: isDragging ? 0.35 : 1, boxShadow: fusionSelected ? "0 6px 20px rgba(232,121,249,0.3)" : selected ? "0 8px 24px rgba(245,158,11,0.22)" : "0 1px 3px rgba(0,0,0,0.06)", userSelect: "none", minWidth: 0, position: "relative" }}>
      {inDeck && <div style={{ position: "absolute", top: 5, right: 5, width: 14, height: 14, borderRadius: "50%", background: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7, color: "#fff", fontWeight: 800 }}>{copiesInDeck}</div>}
      {fusionSelected && <div style={{ position: "absolute", top: 5, left: 5, width: 14, height: 14, borderRadius: "50%", background: "#e879f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, color: "#fff", fontWeight: 800 }}>✦</div>}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <span style={{ fontSize: 10.5, fontWeight: 700, color: "#1e293b", fontFamily: "inherit", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "85%" }}>{card.title}</span>
        <div style={{ width: 9, height: 9, borderRadius: "50%", background: selected ? "#f59e0b" : "#cbd5e1", flexShrink: 0 }} />
      </div>
      <CardImage category={card.category} size="sm" />
      <div style={{ marginTop: 5, marginBottom: 5 }}><CategoryBadge category={card.category} /></div>
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <StatBar label="STR" value={card.str} color="#f97316" />
        <StatBar label="SPD" value={card.spd} color="#38bdf8" />
        <StatBar label="DEF" value={card.def} color="#84cc16" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DECK SLOT
// ─────────────────────────────────────────────────────────────

const SLOT_W = 96;
const SLOT_H = 142;

function DeckSlot({ card, index, isOver, onRemove, onDragOver, onDragLeave, onDrop }) {
  const [isDragging, setIsDragging] = useState(false);

  function handleDragStart(e) {
    if (!card) return;
    setIsDragging(true);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", JSON.stringify({ source: FROM_DECK, card, fromIndex: index }));
  }

  if (!card) {
    return (
      <div onDragOver={e => { e.preventDefault(); onDragOver(index); }} onDragLeave={onDragLeave} onDrop={e => onDrop(e, index)}
        style={{ width: SLOT_W, height: SLOT_H, flexShrink: 0, border: `2px dashed ${isOver ? "#f59e0b" : "#cbd5e1"}`, borderRadius: 10, background: isOver ? "#fffbeb" : "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", color: isOver ? "#f59e0b" : "#94a3b8", fontSize: 20, transition: "all 0.15s", transform: isOver ? "scale(1.06)" : "none", boxShadow: isOver ? "0 0 0 3px #fde68a" : "none" }}>
        {isOver ? "⬇" : "+"}
      </div>
    );
  }

  const color = CAT_COLORS[card.category] || "#94a3b8";
  return (
    <div draggable onDragStart={handleDragStart} onDragEnd={() => setIsDragging(false)}
      onDragOver={e => { e.preventDefault(); onDragOver(index); }} onDragLeave={onDragLeave} onDrop={e => onDrop(e, index)}
      onDoubleClick={e => { e.stopPropagation(); onRemove(index); }}
      title="Double-click or drag to inventory to remove"
      style={{ width: SLOT_W, height: SLOT_H, flexShrink: 0, background: isOver ? "#fffbeb" : "#fff", border: `2px solid ${isOver ? "#f59e0b" : color + "55"}`, borderRadius: 10, padding: "6px 6px 7px", display: "flex", flexDirection: "column", gap: 3, cursor: isDragging ? "grabbing" : "grab", transition: "all 0.15s", transform: isDragging ? "scale(0.9) rotate(-2deg)" : isOver ? "scale(1.04)" : "none", opacity: isDragging ? 0.35 : 1, boxShadow: isOver ? `0 0 0 3px #fde68a` : `0 2px 8px ${color}22`, userSelect: "none", position: "relative" }}>
      <div style={{ width: "100%", aspectRatio: "4/3", borderRadius: 6, overflow: "hidden", flexShrink: 0, background: color + "18" }}>
        <svg width="100%" height="100%" viewBox="0 0 160 120" preserveAspectRatio="xMidYMid slice">
          <rect width="160" height="120" fill={color + "18"} />
          <line x1="0" y1="0" x2="160" y2="120" stroke={color + "55"} strokeWidth="2" />
          <line x1="160" y1="0" x2="0" y2="120" stroke={color + "55"} strokeWidth="2" />
        </svg>
      </div>
      <span style={{ fontSize: 9, fontWeight: 700, color: "#1e293b", fontFamily: "inherit", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", lineHeight: 1.2 }}>{card.title}</span>
      <CategoryBadge category={card.category} />
      <div style={{ display: "flex", gap: 3, marginTop: 1 }}>
        {[{ v: card.str, c: "#f97316" }, { v: card.spd, c: "#38bdf8" }, { v: card.def, c: "#84cc16" }].map((s, i) => (
          <div key={i} style={{ flex: 1, height: 3, background: "#e2e8f0", borderRadius: 99, overflow: "hidden" }}>
            <div style={{ width: `${s.v}%`, height: "100%", background: s.c }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// FUSION MODAL
// ─────────────────────────────────────────────────────────────

function FusionModal({ cardA, cardB, result, onClose, onConfirm }) {
  if (!result) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100, backdropFilter: "blur(6px)" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#0f172a", border: "2px solid #e879f9", borderRadius: 22, padding: "28px 28px 24px", width: 440, maxWidth: "93vw", boxShadow: "0 0 60px #e879f944", animation: "popIn 0.25s cubic-bezier(0.34,1.56,0.64,1)" }}>
        <h2 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 800, color: "#f0abfc", fontFamily: "inherit", textAlign: "center" }}>✦ Fusion Result</h2>
        <p style={{ margin: "0 0 20px", fontSize: 12, color: "#94a3b8", textAlign: "center", fontFamily: "inherit" }}>Stats are influenced by the cards you used</p>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          {/* Card A */}
          <div style={{ flex: 1, background: "#1e293b", borderRadius: 12, padding: "10px 10px 12px", border: "1.5px solid #334155" }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#cbd5e1", fontFamily: "inherit" }}>{cardA.title}</span>
            <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 3 }}>
              <StatBar label="STR" value={cardA.str} color="#f97316" />
              <StatBar label="SPD" value={cardA.spd} color="#38bdf8" />
              <StatBar label="DEF" value={cardA.def} color="#84cc16" />
            </div>
          </div>
          <div style={{ fontSize: 22, color: "#e879f9", fontWeight: 800 }}>+</div>
          {/* Card B */}
          <div style={{ flex: 1, background: "#1e293b", borderRadius: 12, padding: "10px 10px 12px", border: "1.5px solid #334155" }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#cbd5e1", fontFamily: "inherit" }}>{cardB.title}</span>
            <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 3 }}>
              <StatBar label="STR" value={cardB.str} color="#f97316" />
              <StatBar label="SPD" value={cardB.spd} color="#38bdf8" />
              <StatBar label="DEF" value={cardB.def} color="#84cc16" />
            </div>
          </div>
          <div style={{ fontSize: 22, color: "#e879f9", fontWeight: 800 }}>→</div>
          {/* Result */}
          <div style={{ flex: 1, background: "#2d1b4e", borderRadius: 12, padding: "10px 10px 12px", border: "2px solid #e879f9" }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: "#f0abfc", fontFamily: "inherit" }}>{result.title}</span>
            <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 3 }}>
              <StatBar label="STR" value={result.str} color="#f97316" />
              <StatBar label="SPD" value={result.spd} color="#38bdf8" />
              <StatBar label="DEF" value={result.def} color="#84cc16" />
            </div>
          </div>
        </div>

        <p style={{ margin: "0 0 18px", fontSize: 12, color: "#94a3b8", textAlign: "center", fontFamily: "inherit", fontStyle: "italic" }}>{result.description}</p>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1.5px solid #334155", background: "transparent", color: "#94a3b8", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
          <button onClick={onConfirm} style={{ flex: 2, padding: "10px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #a21caf, #7c3aed)", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 14px #a21caf44" }}>✦ Add Fusion to Collection</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SCREENS
// ─────────────────────────────────────────────────────────────

function MainMenuScreen({ onNavigate }) {
  return (
    <div style={{ height: "100vh", background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "inherit", padding: 40, overflow: "hidden" }}>
      <div style={{ textAlign: "center", marginBottom: 56 }}>
        <div style={{ fontSize: 72, marginBottom: 12 }}>⚔️</div>
        <h1 style={{ margin: 0, fontSize: 56, fontWeight: 900, color: "#fff", letterSpacing: "-2px", fontFamily: "inherit" }}>CardForge</h1>
        <p style={{ margin: "10px 0 0", fontSize: 17, color: "#64748b", fontFamily: "inherit", letterSpacing: "0.05em" }}>Build your deck. Forge your destiny.</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%", maxWidth: 320 }}>
        {[
          { label: "▶  Play",         action: "game",  bg: "linear-gradient(135deg, #f59e0b, #f97316)", color: "#fff", shadow: "0 8px 28px #f59e0b55" },
          { label: "🃏  Deck Builder", action: "deck",  bg: "#fff",      color: "#0f172a", shadow: "0 4px 16px rgba(0,0,0,0.2)" },
          { label: "⚙️  Options",      action: "opts",  bg: "#1e293b",   color: "#e2e8f0", shadow: "none", border: "1.5px solid #334155" },
        ].map(btn => (
          <button key={btn.action} onClick={() => onNavigate(btn.action)}
            style={{ padding: "16px 20px", borderRadius: 14, border: btn.border || "none", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", background: btn.bg, color: btn.color, boxShadow: btn.shadow, transition: "transform 0.15s, box-shadow 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.03)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}>
            {btn.label}
          </button>
        ))}
      </div>
      <p style={{ marginTop: 48, fontSize: 12, color: "#1e293b", fontFamily: "inherit" }}>v0.1.0 prototype</p>
    </div>
  );
}

function OptionsScreen({ onBack }) {
  const [sfx, setSfx] = useState(70);
  const [music, setMusic] = useState(50);
  const [fullscreen, setFullscreen] = useState(false);
  const [lang, setLang] = useState("English");
  const [quality, setQuality] = useState("High");

  return (
    <div style={{ height: "100vh", background: "#f0f4f8", fontFamily: "inherit", overflowY: "auto" }}>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "32px 24px" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", fontSize: 14, fontWeight: 600, padding: 0, marginBottom: 24, fontFamily: "inherit" }}>← Back to Menu</button>
        <h1 style={{ margin: "0 0 28px", fontSize: 30, fontWeight: 800, color: "#0f172a", fontFamily: "inherit" }}>⚙️ Options</h1>

        {[
          {
            title: "Audio", items: [
              { label: "SFX Volume", node: <div style={{ display: "flex", alignItems: "center", gap: 10 }}><input type="range" min={0} max={100} value={sfx} onChange={e => setSfx(+e.target.value)} style={{ flex: 1, accentColor: "#f59e0b" }} /><span style={{ fontSize: 12, color: "#64748b", width: 28, fontFamily: "inherit" }}>{sfx}%</span></div> },
              { label: "Music Volume", node: <div style={{ display: "flex", alignItems: "center", gap: 10 }}><input type="range" min={0} max={100} value={music} onChange={e => setMusic(+e.target.value)} style={{ flex: 1, accentColor: "#f59e0b" }} /><span style={{ fontSize: 12, color: "#64748b", width: 28, fontFamily: "inherit" }}>{music}%</span></div> },
            ]
          },
          {
            title: "Display", items: [
              { label: "Fullscreen", node: <button onClick={() => setFullscreen(f => !f)} style={{ width: 44, height: 24, borderRadius: 99, background: fullscreen ? "#22c55e" : "#e2e8f0", border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s" }}><div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: fullscreen ? 23 : 3, transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} /></button> },
              { label: "Quality", node: <div style={{ display: "flex", gap: 6 }}>{["Low", "Medium", "High"].map(q => <button key={q} onClick={() => setQuality(q)} style={{ padding: "4px 12px", borderRadius: 8, border: `1.5px solid ${quality === q ? "#f59e0b" : "#e2e8f0"}`, background: quality === q ? "#fffbeb" : "#f8fafc", color: quality === q ? "#f59e0b" : "#64748b", fontWeight: 600, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>{q}</button>)}</div> },
            ]
          },
          {
            title: "Language", items: [
              { label: "Language", node: <div style={{ display: "flex", gap: 6 }}>{["English", "Português", "Español"].map(l => <button key={l} onClick={() => setLang(l)} style={{ padding: "4px 10px", borderRadius: 8, border: `1.5px solid ${lang === l ? "#f59e0b" : "#e2e8f0"}`, background: lang === l ? "#fffbeb" : "#f8fafc", color: lang === l ? "#f59e0b" : "#64748b", fontWeight: 600, fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>{l}</button>)}</div> },
            ]
          },
        ].map(section => (
          <div key={section.title} style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #e2e8f0", padding: "16px 20px", marginBottom: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <h3 style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "inherit" }}>{section.title}</h3>
            {section.items.map(item => (
              <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ fontSize: 14, color: "#334155", fontWeight: 500, fontFamily: "inherit" }}>{item.label}</span>
                {item.node}
              </div>
            ))}
          </div>
        ))}
        <p style={{ fontSize: 11, color: "#94a3b8", textAlign: "center", fontFamily: "inherit", fontStyle: "italic" }}>Settings are mockup only and don't affect gameplay</p>
      </div>
    </div>
  );
}

function GameScreen({ onBack }) {
  const hand = BASE_CARDS.slice(0, 6);
  const [selected, setSelected] = useState(null);
  const [playerHp, setPlayerHp] = useState(100);
  const [enemyHp, setEnemyHp] = useState(100);
  const [log, setLog] = useState(["Battle started! Choose a card to play."]);

  function playCard(card) {
    if (selected?.id === card.id) {
      const dmg = Math.floor(card.str * 0.4 + card.spd * 0.1);
      const newEnemyHp = Math.max(0, enemyHp - dmg);
      const enemyDmg = Math.floor(Math.random() * 20) + 5;
      const newPlayerHp = Math.max(0, playerHp - enemyDmg);
      setEnemyHp(newEnemyHp);
      setPlayerHp(newPlayerHp);
      setLog(l => [`You played ${card.title} → dealt ${dmg} damage!`, `Enemy counter-attacks → ${enemyDmg} damage!`, ...l.slice(0, 6)]);
      setSelected(null);
    } else {
      setSelected(card);
    }
  }

  const hpColor = hp => hp > 60 ? "#22c55e" : hp > 30 ? "#f59e0b" : "#ef4444";

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)", fontFamily: "inherit", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 28px", borderBottom: "1px solid #1e293b", flexShrink: 0 }}>
        <button onClick={onBack} style={{ background: "#1e293b", border: "1.5px solid #334155", color: "#94a3b8", borderRadius: 8, padding: "6px 16px", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit" }}>← Menu</button>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#f59e0b", fontFamily: "inherit" }}>⚔️ Battle — Round 1</span>
        <span style={{ fontSize: 11, color: "#334155", fontFamily: "inherit", background: "#1e293b", padding: "4px 10px", borderRadius: 6, border: "1px solid #334155" }}>MOCKUP</span>
      </div>

      {/* Main battlefield — horizontal layout */}
      <div style={{ flex: 1, display: "flex", gap: 20, padding: "20px 28px 16px", overflow: "hidden" }}>

        {/* Left: Enemy */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ background: "#1e293b", borderRadius: 16, padding: "18px 22px", border: "1.5px solid #ef444433", flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#7f1d1d", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>👹</div>
                <div>
                  <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#e2e8f0", fontFamily: "inherit" }}>Dark Lord</p>
                  <p style={{ margin: 0, fontSize: 11, color: "#64748b", fontFamily: "inherit" }}>Enemy · Rank SSS</p>
                </div>
              </div>
              <span style={{ fontSize: 18, fontWeight: 800, color: hpColor(enemyHp), fontFamily: "inherit" }}>{enemyHp} HP</span>
            </div>
            <div style={{ height: 10, background: "#0f172a", borderRadius: 99, overflow: "hidden" }}>
              <div style={{ width: `${enemyHp}%`, height: "100%", background: hpColor(enemyHp), borderRadius: 99, transition: "width 0.4s" }} />
            </div>
            {/* Enemy "cards" face down */}
            <div style={{ display: "flex", gap: 8, marginTop: 20, justifyContent: "center" }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} style={{ width: 60, height: 80, borderRadius: 8, background: "linear-gradient(135deg, #1e3a5f, #0f172a)", border: "1.5px solid #334155", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🂠</div>
              ))}
            </div>
          </div>
        </div>

        {/* Center: Battle Log */}
        <div style={{ width: 280, flexShrink: 0, display: "flex", flexDirection: "column", gap: 8 }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "inherit" }}>Battle Log</p>
          <div style={{ flex: 1, background: "#0f172a", borderRadius: 12, padding: "14px 16px", border: "1px solid #1e293b", overflowY: "auto" }}>
            {log.map((line, i) => (
              <p key={i} style={{ margin: "0 0 6px", fontSize: 12, color: i === 0 ? "#f59e0b" : "#475569", fontFamily: "inherit", lineHeight: 1.5 }}>
                {i === 0 ? "▶ " : "  "}{line}
              </p>
            ))}
          </div>
          {selected && (
            <div style={{ background: "#1e293b", borderRadius: 10, padding: "10px 14px", border: "1px solid #f59e0b44", animation: "fadeIn 0.2s" }}>
              <p style={{ margin: 0, fontSize: 12, color: "#f59e0b", fontFamily: "inherit", fontWeight: 600 }}>Click <strong>{selected.title}</strong> again to play</p>
            </div>
          )}
        </div>

        {/* Right: Player */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ background: "#1e293b", borderRadius: 16, padding: "18px 22px", border: "1.5px solid #22c55e33", flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#14532d", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🧙</div>
                <div>
                  <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#e2e8f0", fontFamily: "inherit" }}>You</p>
                  <p style={{ margin: 0, fontSize: 11, color: "#64748b", fontFamily: "inherit" }}>Player · Diamond</p>
                </div>
              </div>
              <span style={{ fontSize: 18, fontWeight: 800, color: hpColor(playerHp), fontFamily: "inherit" }}>{playerHp} HP</span>
            </div>
            <div style={{ height: 10, background: "#0f172a", borderRadius: 99, overflow: "hidden" }}>
              <div style={{ width: `${playerHp}%`, height: "100%", background: hpColor(playerHp), borderRadius: 99, transition: "width 0.4s" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Hand */}
      <div style={{ padding: "12px 28px 16px", display: "flex", gap: 10, justifyContent: "center", borderTop: "1px solid #1e293b", flexShrink: 0 }}>
        <span style={{ fontSize: 11, color: "#334155", fontFamily: "inherit", alignSelf: "center", marginRight: 8, fontWeight: 600 }}>YOUR HAND</span>
        {hand.map(card => {
          const isSelected = selected?.id === card.id;
          const color = CAT_COLORS[card.category];
          return (
            <div key={card.id} onClick={() => playCard(card)}
              style={{ width: 90, flexShrink: 0, background: isSelected ? "#1e293b" : "#0f172a", border: `2px solid ${isSelected ? color : "#1e293b"}`, borderRadius: 10, padding: "8px 8px 10px", cursor: "pointer", transition: "all 0.18s", transform: isSelected ? "translateY(-14px) scale(1.06)" : "translateY(0)", boxShadow: isSelected ? `0 10px 24px ${color}55` : "none" }}>
              <div style={{ width: "100%", aspectRatio: "4/3", borderRadius: 6, background: color + "22", marginBottom: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                {card.category === "Fire" ? "🔥" : card.category === "Ice" ? "❄️" : card.category === "Earth" ? "🌍" : card.category === "Magic" ? "✨" : "⚡"}
              </div>
              <p style={{ margin: "0 0 5px", fontSize: 9.5, fontWeight: 700, color: "#e2e8f0", fontFamily: "inherit", textAlign: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{card.title}</p>
              <div style={{ display: "flex", gap: 2 }}>
                {[{ v: card.str, c: "#f97316" }, { v: card.spd, c: "#38bdf8" }, { v: card.def, c: "#84cc16" }].map((s, i) => (
                  <div key={i} style={{ flex: 1, height: 3, background: "#1e293b", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ width: `${s.v}%`, height: "100%", background: s.c }} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DECK BUILDER
// ─────────────────────────────────────────────────────────────

const CATEGORIES = ["All", "Fire", "Ice", "Earth", "Magic", "Physical", "Fusion"];
const INITIAL_DECKS = [
  { id: 1, name: "Deck 1", cards: Array(DECK_SIZE).fill(null) },
  { id: 2, name: "Deck 2", cards: Array(DECK_SIZE).fill(null) },
  { id: 3, name: "Deck 3", cards: Array(DECK_SIZE).fill(null) },
  { id: 4, name: "Deck 4", cards: Array(DECK_SIZE).fill(null) },
];

function DeckBuilderScreen({ onBack }) {
  const [decks, setDecks] = useState(INITIAL_DECKS);
  const [activeDeckId, setActiveDeckId] = useState(1);
  const [editingName, setEditingName] = useState(false);
  // Extra fused cards added to collection
  const [fusedCards, setFusedCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [modalCard, setModalCard] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [filterOpen, setFilterOpen] = useState(false);
  const [overSlot, setOverSlot] = useState(null);
  const [overInventory, setOverInventory] = useState(false);
  const [fusionMode, setFusionMode] = useState(false);
  const [fusionPickA, setFusionPickA] = useState(null);
  const [fusionPickB, setFusionPickB] = useState(null);
  const [fusionResult, setFusionResult] = useState(null);
  const [toast, setToast] = useState({ message: "", visible: false });
  const toastTimer = useRef(null);

  const activeDeck = decks.find(d => d.id === activeDeckId);
  const deck = activeDeck?.cards || [];

  // Full collection: 3 copies of each base card + any fused cards
  const collection = [...BASE_CARDS, ...fusedCards];

  const filteredCards = collection.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) &&
    (category === "All" || c.category === category)
  );

  const deckFull = deck.filter(Boolean).length >= DECK_SIZE;

  function copiesInDeck(card) {
    return deck.filter(c => c?.id === card.id).length;
  }

  function copiesInCollection(card) {
    return card.isFused ? fusedCards.filter(f => f.id === card.id).length : COPIES;
  }

  function showToast(msg) {
    clearTimeout(toastTimer.current);
    setToast({ message: msg, visible: true });
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, visible: false })), 2200);
  }

  function updateDeck(newCards) {
    setDecks(prev => prev.map(d => d.id === activeDeckId ? { ...d, cards: newCards } : d));
  }

  function renameDeck(name) {
    setDecks(prev => prev.map(d => d.id === activeDeckId ? { ...d, name } : d));
  }

  function addToDeck(card) {
    const copies = copiesInDeck(card);
    if (copies >= MAX_COPIES_PER_DECK) return showToast(`Max ${MAX_COPIES_PER_DECK} copies per deck`);
    if (deckFull) return showToast("Deck is full!");
    const idx = deck.findIndex(s => s === null);
    const newDeck = [...deck];
    newDeck[idx] = card;
    updateDeck(newDeck);
    showToast(`${card.title} added!`);
  }

  function removeFromDeck(index) {
    const newDeck = [...deck];
    newDeck[index] = null;
    updateDeck(newDeck);
  }

  // Inventory click: fusion mode vs normal
  function handleInventoryClick(card) {
    if (fusionMode) {
      if (!fusionPickA) {
        setFusionPickA(card);
      } else if (fusionPickA.id === card.id) {
        setFusionPickA(null);
      } else {
        setFusionPickB(card);
        const result = findFusion(fusionPickA, card);
        if (result) {
          setFusionResult(result);
        } else {
          showToast("No fusion recipe for these two cards");
          setFusionPickB(null);
        }
      }
      return;
    }
    if (selectedCard?.id === card.id) {
      setModalCard(card);
      setSelectedCard(null);
    } else {
      setSelectedCard(card);
    }
  }

  function confirmFusion() {
    setFusedCards(prev => [...prev, { ...fusionResult, id: Date.now() }]);
    showToast(`✦ ${fusionResult.title} added to your collection!`);
    setFusionResult(null);
    setFusionPickA(null);
    setFusionPickB(null);
    setFusionMode(false);
  }

  // Drag & drop
  function handleDragOver(toIndex) { setOverSlot(toIndex); }
  function handleDragLeave() { setTimeout(() => setOverSlot(null), 30); }

  function handleSlotDrop(e, toIndex) {
    e.preventDefault();
    setOverSlot(null);
    let payload;
    try { payload = JSON.parse(e.dataTransfer.getData("text/plain")); } catch { return; }
    const { source, card, fromIndex } = payload;
    const newDeck = [...deck];
    if (source === FROM_DECK) {
      [newDeck[fromIndex], newDeck[toIndex]] = [newDeck[toIndex], newDeck[fromIndex]];
    } else {
      const copies = newDeck.filter(c => c?.id === card.id).length;
      if (copies >= MAX_COPIES_PER_DECK) return showToast(`Max ${MAX_COPIES_PER_DECK} copies per deck`);
      if (newDeck[toIndex] === null) {
        newDeck[toIndex] = card;
        showToast(`${card.title} added!`);
      } else {
        const emptyIdx = newDeck.findIndex(s => s === null);
        if (emptyIdx === -1) return showToast("Deck is full!");
        newDeck[emptyIdx] = card;
        showToast(`${card.title} placed in next open slot`);
      }
    }
    updateDeck(newDeck);
  }

  function handleInventoryPanelDragOver(e) { e.preventDefault(); setOverInventory(true); }
  function handleInventoryPanelDragLeave() { setOverInventory(false); }
  function handleInventoryPanelDrop(e) {
    e.preventDefault();
    setOverInventory(false);
    let payload;
    try { payload = JSON.parse(e.dataTransfer.getData("text/plain")); } catch { return; }
    if (payload.source === FROM_DECK) {
      removeFromDeck(payload.fromIndex);
      showToast(`${payload.card.title} removed from deck`);
    }
  }

  const playerStats = { level: 42, rank: "Diamond", gold: 1280 };

  return (
    <>
      <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#f0f4f8", fontFamily: "inherit", overflow: "hidden" }}>

        {/* TOP BAR */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 24px", background: "#fff", borderBottom: "1.5px solid #e2e8f0", flexShrink: 0, gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", fontSize: 13, fontWeight: 600, padding: 0, whiteSpace: "nowrap", fontFamily: "inherit" }}>← Menu</button>
            <span style={{ color: "#e2e8f0" }}>|</span>
            {editingName
              ? <input autoFocus value={activeDeck.name} onChange={e => renameDeck(e.target.value)} onBlur={() => setEditingName(false)} onKeyDown={e => e.key === "Enter" && setEditingName(false)} style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", border: "2px solid #f59e0b", borderRadius: 8, padding: "2px 10px", fontFamily: "inherit", background: "#fffbeb", outline: "none", width: 160 }} />
              : <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#0f172a", fontFamily: "inherit", whiteSpace: "nowrap" }}>{activeDeck.name}</h1>}
            <button onClick={() => setEditingName(true)} style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "3px 7px", cursor: "pointer", fontSize: 12, color: "#64748b", flexShrink: 0 }}>✏️</button>
          </div>

          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
            {decks.map(d => (
              <button key={d.id} onClick={() => setActiveDeckId(d.id)} style={{ minWidth: 80, height: 32, borderRadius: 8, border: `2px solid ${activeDeckId === d.id ? "#f59e0b" : "#e2e8f0"}`, background: activeDeckId === d.id ? "#fffbeb" : "#f8fafc", color: activeDeckId === d.id ? "#f59e0b" : "#64748b", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s", padding: "0 10px", whiteSpace: "nowrap" }}>
                {d.name}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "5px 12px" }}>
              <span style={{ fontSize: 13 }}>🎮</span>
              <span style={{ fontSize: 12, color: "#475569", fontFamily: "inherit" }}>
                <span style={{ fontWeight: 700, color: "#0f172a" }}>Lv.{playerStats.level}</span>
                {" · "}<span style={{ color: "#f59e0b", fontWeight: 700 }}>{playerStats.rank}</span>
                {" · "}🪙 {playerStats.gold}
              </span>
            </div>
            <button onClick={() => showToast("Deck saved! ✓")} style={{ padding: "7px 20px", borderRadius: 10, border: "none", background: "#0f172a", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 14px rgba(15,23,42,0.2)", whiteSpace: "nowrap" }}>Save Deck</button>
          </div>
        </div>

        {/* DECK PANEL — carousel */}
        <div style={{ background: "#fff", borderBottom: "1.5px solid #e2e8f0", padding: "12px 24px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: "inherit" }}>Your Deck</span>
            <span style={{ fontSize: 11, color: deck.filter(Boolean).length === DECK_SIZE ? "#f97316" : "#94a3b8", fontFamily: "inherit", fontWeight: 600 }}>
              {deck.filter(Boolean).length}/{DECK_SIZE} · dbl-click card to remove · max {MAX_COPIES_PER_DECK} copies/card
            </span>
          </div>
          <div className="carousel" style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 6 }}>
            {deck.map((card, i) => (
              <DeckSlot key={i} card={card} index={i} isOver={overSlot === i} onRemove={removeFromDeck} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleSlotDrop} />
            ))}
          </div>
        </div>

        {/* INVENTORY PANEL — fills remaining height */}
        <div onDragOver={handleInventoryPanelDragOver} onDragLeave={handleInventoryPanelDragLeave} onDrop={handleInventoryPanelDrop}
          style={{ flex: 1, display: "flex", flexDirection: "column", padding: "14px 24px", gap: 10, overflow: "hidden", background: overInventory ? "#fff8f8" : "#f8fafc", outline: overInventory ? "2px solid #fca5a5" : "none", transition: "all 0.15s" }}>

          {/* Search + filter + fusion */}
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexShrink: 0 }}>
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "8px 14px" }}>
              <span style={{ color: "#94a3b8" }}>🔍</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search cards..." style={{ flex: 1, border: "none", background: "transparent", fontSize: 13, color: "#0f172a", outline: "none", fontFamily: "inherit" }} />
              {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 16, padding: 0 }}>×</button>}
            </div>
            <div style={{ position: "relative" }}>
              <button onClick={() => setFilterOpen(o => !o)} style={{ background: category !== "All" ? "#fffbeb" : "#fff", border: `1.5px solid ${category !== "All" ? "#f59e0b" : "#e2e8f0"}`, borderRadius: 10, padding: "8px 14px", fontSize: 13, fontWeight: 600, color: category !== "All" ? "#f59e0b" : "#475569", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
                {category === "All" ? "Filter ▾" : `${category} ▾`}
              </button>
              {filterOpen && (
                <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 12, padding: 6, zIndex: 100, boxShadow: "0 8px 24px rgba(0,0,0,0.1)", minWidth: 130, animation: "popIn 0.15s ease" }}>
                  {CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => { setCategory(cat); setFilterOpen(false); }} style={{ display: "block", width: "100%", textAlign: "left", padding: "7px 12px", border: "none", background: category === cat ? "#fffbeb" : "transparent", color: category === cat ? "#f59e0b" : "#475569", fontWeight: category === cat ? 700 : 500, fontSize: 13, cursor: "pointer", fontFamily: "inherit", borderRadius: 8 }}>{cat}</button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => { setFusionMode(f => !f); setFusionPickA(null); setFusionPickB(null); }}
              style={{ padding: "8px 16px", borderRadius: 10, border: `1.5px solid ${fusionMode ? "#e879f9" : "#e2e8f0"}`, background: fusionMode ? "#fdf4ff" : "#fff", color: fusionMode ? "#e879f9" : "#64748b", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s", whiteSpace: "nowrap" }}>
              ✦ {fusionMode ? "Cancel Fusion" : "Fuse Cards"}
            </button>
          </div>

          {/* Fusion banner */}
          {fusionMode && (
            <div style={{ background: "linear-gradient(135deg, #fdf4ff, #f5f3ff)", border: "1.5px solid #e879f966", borderRadius: 10, padding: "8px 14px", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
              <span style={{ fontSize: 16 }}>✦</span>
              <p style={{ margin: 0, fontSize: 12, color: "#7e22ce", fontFamily: "inherit" }}>
                <strong>Fusion Mode</strong> —
                {!fusionPickA ? " click a card to select it" : ` ${fusionPickA.title} selected — now pick the second card`}
              </p>
            </div>
          )}

          <div style={{ fontSize: 11, color: "#94a3b8", flexShrink: 0, fontFamily: "inherit" }}>
            {filteredCards.length} cards · 3 copies each · drag to deck or click twice to expand · 🟢 badge = copies in deck
          </div>

          {/* Card grid — fills remaining space, scrolls vertically */}
          <div className="inv-grid" style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(165px, 1fr))", gap: 12, overflowY: "auto", paddingRight: 6, alignContent: "start" }}>
            {filteredCards.map((card, idx) => (
              <InventoryCard
                key={card.isFused ? `fused-${idx}` : card.id}
                card={card}
                selected={!fusionMode && selectedCard?.id === card.id}
                copiesInDeck={copiesInDeck(card)}
                fusionSelected={fusionMode && fusionPickA?.id === card.id}
                onClick={() => handleInventoryClick(card)}
              />
            ))}
          </div>
        </div>
      </div>

      <CardModal card={modalCard} onClose={() => setModalCard(null)} onAdd={addToDeck} copiesInDeck={modalCard ? copiesInDeck(modalCard) : 0} deckFull={deckFull} />
      <FusionModal cardA={fusionPickA} cardB={fusionPickB} result={fusionResult} onClose={() => { setFusionResult(null); setFusionPickB(null); }} onConfirm={confirmFusion} />
      <Toast message={toast.message} visible={toast.visible} />
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// ROOT — Navigation
// ─────────────────────────────────────────────────────────────

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; }
  html, body, #root { margin: 0; padding: 0; height: 100%; overflow: hidden; font-family: 'DM Sans', sans-serif; }
  .carousel::-webkit-scrollbar { height: 5px; }
  .carousel::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 99px; }
  .carousel::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 99px; }
  .inv-grid::-webkit-scrollbar { width: 6px; }
  .inv-grid::-webkit-scrollbar-track { background: transparent; }
  .inv-grid::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 99px; }
  @keyframes popIn { from { opacity:0; transform:scale(0.85); } to { opacity:1; transform:scale(1); } }
  @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
`;

export default function App() {
  const [screen, setScreen] = useState("menu"); // menu | deck | opts | game

  return (
    <>
      <style>{STYLES}</style>
      {screen === "menu" && <MainMenuScreen onNavigate={setScreen} />}
      {screen === "deck" && <DeckBuilderScreen onBack={() => setScreen("menu")} />}
      {screen === "opts" && <OptionsScreen onBack={() => setScreen("menu")} />}
      {screen === "game" && <GameScreen onBack={() => setScreen("menu")} />}
    </>
  );
}