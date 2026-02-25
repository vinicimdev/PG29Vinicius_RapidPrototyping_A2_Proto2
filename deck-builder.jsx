import { useState, useRef } from "react";

const CATEGORIES = ["All", "Fire", "Ice", "Earth", "Magic", "Physical"];

const ALL_CARDS = [
  { id: 1, title: "Fire Sky", category: "Fire", description: "Summons a blazing sky that rains down fire upon all enemies in the field for 3 turns." },
  { id: 2, title: "Fire Shield", category: "Fire", description: "Wraps the caster in a shield of flames, absorbing incoming damage and burning attackers." },
  { id: 3, title: "Burning Flames", category: "Fire", description: "Engulfs a single target in relentless flames, dealing damage over time for 5 turns." },
  { id: 4, title: "Ice Spike", category: "Ice", description: "Launches a razor-sharp spike of ice at an enemy, piercing armor and slowing movement." },
  { id: 5, title: "Blizzard", category: "Ice", description: "Calls forth a raging blizzard that freezes all enemies and deals heavy area damage." },
  { id: 6, title: "Frost Nova", category: "Ice", description: "Releases an icy explosion centered on the caster, freezing all nearby enemies in place." },
  { id: 7, title: "Stone Wall", category: "Earth", description: "Raises a massive wall of stone from the ground, blocking enemy advances and projectiles." },
  { id: 8, title: "Earthquake", category: "Earth", description: "Shakes the battlefield violently, stunning all ground units and dealing massive area damage." },
  { id: 9, title: "Magic Missile", category: "Magic", description: "Fires a bolt of pure arcane energy that always finds its target, ignoring most defenses." },
  { id: 10, title: "Magic Wall", category: "Magic", description: "Conjures an invisible wall of force that deflects spells and physical projectiles alike." },
  { id: 11, title: "Heal Area", category: "Magic", description: "Radiates healing energy to all allies within range, restoring health over several turns." },
  { id: 12, title: "Kick", category: "Physical", description: "A powerful kick that deals physical damage and pushes the enemy back two spaces." },
  { id: 13, title: "Face Punch", category: "Physical", description: "A brutal direct punch to the face, stunning the enemy for one turn and dealing high damage." },
  { id: 14, title: "Slash", category: "Physical", description: "A swift diagonal slash that hits all enemies in a line, dealing moderate physical damage." },
  { id: 15, title: "Boulder Toss", category: "Earth", description: "Hurls an enormous boulder at a target, dealing massive damage and knocking them down." },
  { id: 16, title: "Ice Armor", category: "Ice", description: "Encases the user in a shell of enchanted ice, drastically boosting defense for 4 turns." },
  { id: 17, title: "Phoenix Rise", category: "Fire", description: "Channels the spirit of a phoenix to revive with full health once per battle." },
  { id: 18, title: "Shadow Step", category: "Magic", description: "Blinks to any position on the field instantly, bypassing terrain and enemy lines." },
];

const DECK_SIZE = 10;

// Placeholder card image using SVG X pattern
function CardImage({ size = "md" }) {
  const h = size === "lg" ? 220 : size === "md" ? 90 : 70;
  return (
    <svg width="100%" height={h} viewBox="0 0 160 120" preserveAspectRatio="none"
      style={{ display: "block", borderRadius: 6, background: "#e2e8f0" }}>
      <rect width="160" height="120" fill="#e2e8f0" rx="6" />
      <line x1="0" y1="0" x2="160" y2="120" stroke="#94a3b8" strokeWidth="2" />
      <line x1="160" y1="0" x2="0" y2="120" stroke="#94a3b8" strokeWidth="2" />
    </svg>
  );
}

function CategoryBadge({ category }) {
  const colors = {
    Fire: "#f97316",
    Ice: "#38bdf8",
    Earth: "#84cc16",
    Magic: "#a78bfa",
    Physical: "#fb7185",
  };
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, letterSpacing: "0.05em",
      color: colors[category] || "#64748b",
      background: (colors[category] || "#64748b") + "18",
      borderRadius: 4, padding: "1px 6px",
      fontFamily: "inherit",
    }}>{category}</span>
  );
}

// Small card in inventory grid
function InventoryCard({ card, selected, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: selected ? "#fff" : "#f8fafc",
        border: `2px solid ${selected ? "#f59e0b" : "#e2e8f0"}`,
        borderRadius: 10,
        padding: "8px 8px 10px",
        cursor: "pointer",
        transition: "all 0.18s ease",
        transform: selected ? "translateY(-6px) scale(1.03)" : "none",
        boxShadow: selected ? "0 8px 24px rgba(245,158,11,0.22)" : "0 1px 3px rgba(0,0,0,0.06)",
        userSelect: "none",
        minWidth: 0,
        position: "relative",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#1e293b", fontFamily: "inherit", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "80%" }}>
          {card.title}
        </span>
        <div style={{
          width: 10, height: 10, borderRadius: "50%",
          background: selected ? "#f59e0b" : "#cbd5e1", flexShrink: 0,
          transition: "background 0.18s"
        }} />
      </div>
      <CardImage size="sm" />
      <div style={{ marginTop: 6 }}>
        <CategoryBadge category={card.category} />
      </div>
      <p style={{
        fontSize: 9.5, color: "#64748b", margin: "5px 0 0", lineHeight: 1.4,
        display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden",
        fontFamily: "inherit",
      }}>
        {card.description}
      </p>
    </div>
  );
}

// Deck slot (carousel)
function DeckSlot({ card, index, onRemove }) {
  if (!card) {
    return (
      <div style={{
        minWidth: 130, height: 175,
        border: "2px dashed #cbd5e1",
        borderRadius: 12,
        background: "#f8fafc",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#94a3b8", fontSize: 24, flexShrink: 0,
      }}>+</div>
    );
  }
  return (
    <div style={{
      minWidth: 130, height: 175,
      background: "#fff",
      border: "2px solid #e2e8f0",
      borderRadius: 12,
      padding: "8px 8px 10px",
      position: "relative",
      flexShrink: 0,
      boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
      display: "flex", flexDirection: "column", gap: 5,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#1e293b", fontFamily: "inherit", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "80%" }}>{card.title}</span>
        <button onClick={() => onRemove(index)} style={{
          width: 16, height: 16, borderRadius: "50%", border: "none",
          background: "#fee2e2", color: "#ef4444", cursor: "pointer",
          fontSize: 10, fontWeight: 700, lineHeight: 1, padding: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>×</button>
      </div>
      <CardImage size="sm" />
      <CategoryBadge category={card.category} />
      <p style={{ fontSize: 9, color: "#64748b", margin: 0, lineHeight: 1.35, fontFamily: "inherit",
        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
        {card.description}
      </p>
    </div>
  );
}

// Modal for expanded card view
function CardModal({ card, onClose, onAdd, alreadyInDeck, deckFull }) {
  if (!card) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, backdropFilter: "blur(3px)",
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#fff",
        border: "3px solid #f59e0b",
        borderRadius: 18,
        padding: "24px 24px 20px",
        width: 340, maxWidth: "90vw",
        boxShadow: "0 24px 60px rgba(245,158,11,0.18), 0 8px 30px rgba(0,0,0,0.15)",
        position: "relative",
        animation: "popIn 0.2s cubic-bezier(0.34,1.56,0.64,1)",
      }}>
        <button onClick={onClose} style={{
          position: "absolute", top: 12, right: 14,
          background: "#f1f5f9", border: "none", borderRadius: 8,
          width: 32, height: 32, cursor: "pointer",
          fontSize: 16, fontWeight: 700, color: "#475569",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>×</button>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "#f59e0b", display: "flex", alignItems: "center",
            justifyContent: "center", color: "#fff", fontSize: 14, fontWeight: 800,
          }}>{card.title[0]}</div>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#0f172a", fontFamily: "inherit" }}>{card.title}</h2>
            <CategoryBadge category={card.category} />
          </div>
        </div>

        <CardImage size="lg" />

        <p style={{ fontSize: 13.5, color: "#334155", lineHeight: 1.6, margin: "14px 0 18px", fontFamily: "inherit" }}>
          {card.description}
        </p>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          {alreadyInDeck ? (
            <span style={{ fontSize: 13, color: "#94a3b8", fontStyle: "italic" }}>Already in deck</span>
          ) : deckFull ? (
            <span style={{ fontSize: 13, color: "#f97316", fontStyle: "italic" }}>Deck is full (10/10)</span>
          ) : (
            <button onClick={() => { onAdd(card); onClose(); }} style={{
              background: "#f59e0b", color: "#fff",
              border: "none", borderRadius: 10,
              padding: "10px 28px", fontSize: 14, fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit",
              boxShadow: "0 4px 14px rgba(245,158,11,0.35)",
              transition: "background 0.15s",
            }}>Add to Deck</button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DeckBuilder() {
  const [deckName, setDeckName] = useState("My Deck");
  const [editingName, setEditingName] = useState(false);
  const [activeDeck, setActiveDeck] = useState(1);
  const [deck, setDeck] = useState(Array(DECK_SIZE).fill(null));
  const [selectedCard, setSelectedCard] = useState(null);
  const [modalCard, setModalCard] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [filterOpen, setFilterOpen] = useState(false);
  const carouselRef = useRef(null);

  const filteredCards = ALL_CARDS.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || c.category === category;
    return matchSearch && matchCat;
  });

  const deckFull = deck.filter(Boolean).length >= DECK_SIZE;

  function handleInventoryClick(card) {
    if (selectedCard?.id === card.id) {
      setModalCard(card);
      setSelectedCard(null);
    } else {
      setSelectedCard(card);
    }
  }

  function handleAddToDeck(card) {
    const idx = deck.findIndex(s => s === null);
    if (idx !== -1) {
      const newDeck = [...deck];
      newDeck[idx] = card;
      setDeck(newDeck);
    }
  }

  function handleRemoveFromDeck(index) {
    const newDeck = [...deck];
    newDeck[index] = null;
    setDeck(newDeck);
  }

  function isInDeck(card) {
    return deck.some(c => c?.id === card.id);
  }

  const playerStats = { level: 42, rank: "Diamond", gold: 1280 };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        .carousel::-webkit-scrollbar { height: 4px; }
        .carousel::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 99px; }
        .carousel::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 99px; }
        .inventory-grid::-webkit-scrollbar { width: 6px; }
        .inventory-grid::-webkit-scrollbar-track { background: transparent; }
        .inventory-grid::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 99px; }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.88); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{
        minHeight: "100vh", background: "#f0f4f8",
        fontFamily: "'DM Sans', sans-serif",
        padding: 20, display: "flex", flexDirection: "column", gap: 16,
      }}>

        {/* DECK PANEL */}
        <div style={{
          background: "#fff", borderRadius: 18,
          border: "1.5px solid #e2e8f0",
          padding: "18px 20px 16px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
          animation: "fadeIn 0.3s ease",
        }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {editingName ? (
                <input
                  autoFocus
                  value={deckName}
                  onChange={e => setDeckName(e.target.value)}
                  onBlur={() => setEditingName(false)}
                  onKeyDown={e => e.key === "Enter" && setEditingName(false)}
                  style={{
                    fontSize: 22, fontWeight: 800, color: "#0f172a",
                    border: "2px solid #f59e0b", borderRadius: 8,
                    padding: "2px 10px", fontFamily: "inherit",
                    background: "#fffbeb", outline: "none",
                  }}
                />
              ) : (
                <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#0f172a", fontFamily: "inherit" }}>
                  {deckName}
                </h1>
              )}
              <button onClick={() => setEditingName(true)} style={{
                background: "#f8fafc", border: "1.5px solid #e2e8f0",
                borderRadius: 8, padding: "4px 8px", cursor: "pointer",
                fontSize: 14, color: "#64748b",
              }}>✏️</button>
            </div>

            {/* Player stats */}
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "#f8fafc", border: "1.5px solid #e2e8f0",
              borderRadius: 10, padding: "6px 14px",
            }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🎮</div>
              <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.4 }}>
                <span style={{ fontWeight: 700, color: "#0f172a" }}>Lv.{playerStats.level}</span>
                {" · "}<span style={{ color: "#f59e0b", fontWeight: 700 }}>{playerStats.rank}</span>
                {" · "}<span>🪙 {playerStats.gold}</span>
              </div>
            </div>

            {/* Deck slots 1-4 + edit */}
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              {[1, 2, 3, 4].map(n => (
                <button key={n} onClick={() => setActiveDeck(n)} style={{
                  width: 34, height: 34, borderRadius: 8,
                  border: `2px solid ${activeDeck === n ? "#f59e0b" : "#e2e8f0"}`,
                  background: activeDeck === n ? "#fffbeb" : "#f8fafc",
                  color: activeDeck === n ? "#f59e0b" : "#64748b",
                  fontWeight: 700, fontSize: 14, cursor: "pointer",
                  fontFamily: "inherit", transition: "all 0.15s",
                }}>{n}</button>
              ))}
            </div>
          </div>

          {/* Carousel */}
          <div style={{ position: "relative" }}>
            <div ref={carouselRef} className="carousel" style={{
              display: "flex", gap: 10, overflowX: "auto",
              paddingBottom: 8, paddingTop: 2, scrollSnapType: "x mandatory",
            }}>
              {deck.map((card, i) => (
                <div key={i} style={{ scrollSnapAlign: "start" }}>
                  <DeckSlot card={card} index={i} onRemove={handleRemoveFromDeck} />
                </div>
              ))}
            </div>
            <div style={{ textAlign: "right", fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
              {deck.filter(Boolean).length}/{DECK_SIZE} cards
            </div>
          </div>

          {/* Back + Save */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
            <button style={{
              padding: "8px 22px", borderRadius: 10, border: "1.5px solid #e2e8f0",
              background: "#f8fafc", color: "#475569", fontWeight: 600, fontSize: 13,
              cursor: "pointer", fontFamily: "inherit",
            }}>← Back</button>
            <button style={{
              padding: "8px 22px", borderRadius: 10, border: "none",
              background: "#0f172a", color: "#fff", fontWeight: 700, fontSize: 13,
              cursor: "pointer", fontFamily: "inherit",
              boxShadow: "0 4px 14px rgba(15,23,42,0.2)",
            }}>Save Deck</button>
          </div>
        </div>

        {/* INVENTORY PANEL */}
        <div style={{
          background: "#fff", borderRadius: 18,
          border: "1.5px solid #e2e8f0",
          padding: "16px 20px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
          flex: 1, display: "flex", flexDirection: "column", gap: 14,
          animation: "fadeIn 0.4s ease",
        }}>
          {/* Search + filter row */}
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{
              flex: 1, display: "flex", alignItems: "center", gap: 8,
              background: "#f8fafc", border: "1.5px solid #e2e8f0",
              borderRadius: 10, padding: "8px 14px",
            }}>
              <span style={{ color: "#94a3b8", fontSize: 14 }}>🔍</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search cards..."
                style={{
                  flex: 1, border: "none", background: "transparent",
                  fontSize: 13, color: "#0f172a", outline: "none",
                  fontFamily: "inherit",
                }}
              />
              {search && (
                <button onClick={() => setSearch("")} style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "#94a3b8", fontSize: 16, padding: 0,
                }}>×</button>
              )}
            </div>

            {/* Filter dropdown */}
            <div style={{ position: "relative" }}>
              <button onClick={() => setFilterOpen(o => !o)} style={{
                display: "flex", alignItems: "center", gap: 6,
                background: category !== "All" ? "#fffbeb" : "#f8fafc",
                border: `1.5px solid ${category !== "All" ? "#f59e0b" : "#e2e8f0"}`,
                borderRadius: 10, padding: "8px 14px",
                fontSize: 13, fontWeight: 600,
                color: category !== "All" ? "#f59e0b" : "#475569",
                cursor: "pointer", fontFamily: "inherit",
              }}>
                {category === "All" ? "Filter ▾" : `${category} ▾`}
              </button>
              {filterOpen && (
                <div style={{
                  position: "absolute", top: "calc(100% + 6px)", right: 0,
                  background: "#fff", border: "1.5px solid #e2e8f0",
                  borderRadius: 12, padding: 6, zIndex: 100,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                  minWidth: 130, animation: "popIn 0.15s ease",
                }}>
                  {CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => { setCategory(cat); setFilterOpen(false); }} style={{
                      display: "block", width: "100%", textAlign: "left",
                      padding: "7px 12px", border: "none",
                      background: category === cat ? "#fffbeb" : "transparent",
                      color: category === cat ? "#f59e0b" : "#475569",
                      fontWeight: category === cat ? 700 : 500,
                      fontSize: 13, cursor: "pointer", fontFamily: "inherit",
                      borderRadius: 8,
                    }}>{cat}</button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Card count */}
          <div style={{ fontSize: 12, color: "#94a3b8" }}>
            {filteredCards.length} card{filteredCards.length !== 1 ? "s" : ""} found
            {selectedCard && (
              <span style={{ marginLeft: 10, color: "#f59e0b", fontWeight: 600 }}>
                · Click <strong>{selectedCard.title}</strong> again to expand
              </span>
            )}
          </div>

          {/* Grid */}
          <div className="inventory-grid" style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(148px, 1fr))",
            gap: 12,
            overflowY: "auto",
            maxHeight: 480,
            paddingRight: 4,
          }}>
            {filteredCards.map(card => (
              <InventoryCard
                key={card.id}
                card={card}
                selected={selectedCard?.id === card.id}
                onClick={() => handleInventoryClick(card)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      <CardModal
        card={modalCard}
        onClose={() => setModalCard(null)}
        onAdd={handleAddToDeck}
        alreadyInDeck={modalCard ? isInDeck(modalCard) : false}
        deckFull={deckFull}
      />
    </>
  );
}
