import { getT } from "@/lib/i18n/server";
import { DIGITAL_CATALOGUE_URL } from "@/lib/config/links";
import { cn } from "@/lib/utils";

const PHOTO = "/catalogue/scenes/mosaic-p4.jpg";
const PHOTO_PORTRAIT = "/catalogue/scenes/mosaic-p4-portrait.jpg";

type Slot = "title" | "name" | "stands" | "registered" | "open";

interface Board {
  cols: number;
  rows: number;
  photo: string;
  /** Tile index → the text tile that replaces the photograph there. */
  slots: Record<number, Slot>;
}

// Never two text tiles side by side; they sit where the photograph has sky, flowers or floor.
const DESKTOP: Board = {
  cols: 6,
  rows: 4,
  photo: PHOTO,
  slots: { 0: "title", 5: "name", 13: "stands", 18: "registered", 23: "open" },
};
// Phones and tablets: the facts run as full-width bands between rows of the photograph.
const PHONE_SEQUENCE: (Slot | number)[] = [
  "title",
  0,
  1,
  "name",
  2,
  3,
  "stands",
  4,
  "registered",
  5,
  "open",
];
const PHONE_COLS = 3;
const PHONE_ROWS = 6;

/**
 * One catalogue photograph cut across a board of square tiles; a few tiles are swapped for flat
 * ones carrying the heading, three facts and the action.
 */
export async function TownMosaic() {
  const t = await getT();
  const town = t.home.town;

  const text: Record<Slot, React.ReactNode> = {
    title: (
      <h2 className="text-2xl font-semibold leading-[1.05] tracking-[-0.02em]">{town.title}</h2>
    ),
    name: <p className="text-base leading-snug">{town.name}</p>,
    stands: <p className="text-base leading-snug">{town.stands}</p>,
    registered: <p className="text-base leading-snug">{town.registered}</p>,
    open: (
      <a
        href={DIGITAL_CATALOGUE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-full flex-col justify-between text-base font-medium text-gold-foreground"
      >
        {town.open}
        <span
          aria-hidden
          className="self-end text-2xl transition-transform duration-300 group-hover:translate-x-1"
        >
          →
        </span>
      </a>
    ),
  };

  return (
    <section aria-label={town.title} className="mt-36 px-4 sm:px-5 md:mt-52">
      <p className="sr-only">{town.photoAlt}</p>
      <PhoneBoard text={text} />
      <BoardGrid board={DESKTOP} text={text} className="hidden lg:grid" />
    </section>
  );
}

function BoardGrid({
  board,
  text,
  className,
}: {
  board: Board;
  text: Record<Slot, React.ReactNode>;
  className: string;
}) {
  const tiles = Array.from({ length: board.cols * board.rows }, (_, i) => i);
  return (
    <div
      className={cn("gap-1.5 lg:gap-2", className)}
      style={{ gridTemplateColumns: `repeat(${board.cols}, minmax(0, 1fr))` }}
    >
      {tiles.map((i) => {
        const slot = board.slots[i];
        const col = i % board.cols;
        const row = Math.floor(i / board.cols);
        if (slot) {
          return (
            <div
              key={i}
              data-reveal
              style={{ "--i": col } as React.CSSProperties}
              className={cn(
                "group aspect-square overflow-hidden rounded-lg p-3 lg:p-4",
                slot === "open" ? "bg-gold" : "bg-card"
              )}
            >
              {text[slot]}
            </div>
          );
        }
        return (
          <div key={i} aria-hidden className="aspect-square overflow-hidden rounded-lg">
            <div
              className="size-full bg-no-repeat transition-transform duration-500 ease-out hover:scale-[1.08]"
              style={{
                backgroundImage: `url(${board.photo})`,
                backgroundSize: `${board.cols * 100}% ${board.rows * 100}%`,
                backgroundPosition: `${(col / (board.cols - 1)) * 100}% ${(row / (board.rows - 1)) * 100}%`,
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

function PhoneBoard({ text }: { text: Record<Slot, React.ReactNode> }) {
  return (
    <div className="grid grid-cols-3 gap-1.5 lg:hidden">
      {PHONE_SEQUENCE.flatMap((item) => {
        if (typeof item !== "number") {
          return [
            <div
              key={item}
              data-reveal
              className={cn(
                "col-span-3 rounded-lg p-4",
                item === "open" ? "min-h-28 bg-gold" : "bg-card"
              )}
            >
              {text[item]}
            </div>,
          ];
        }
        return Array.from({ length: PHONE_COLS }, (_, col) => (
          <div
            key={`${item}-${col}`}
            aria-hidden
            className="aspect-square overflow-hidden rounded-lg"
          >
            <div
              className="size-full bg-no-repeat"
              style={{
                backgroundImage: `url(${PHOTO_PORTRAIT})`,
                backgroundSize: `${PHONE_COLS * 100}% ${PHONE_ROWS * 100}%`,
                backgroundPosition: `${(col / (PHONE_COLS - 1)) * 100}% ${(item / (PHONE_ROWS - 1)) * 100}%`,
              }}
            />
          </div>
        ));
      })}
    </div>
  );
}
