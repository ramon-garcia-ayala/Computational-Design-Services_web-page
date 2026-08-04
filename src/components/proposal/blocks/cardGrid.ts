/**
 * Column classes for the card grids that draw their dividers with `gap-px`
 * over a `bg-line` container.
 *
 * Those grids have no real borders: the gaps are the container's background
 * showing through the cards. That means a half-empty last row does not render
 * as nothing, it renders as a solid bar of border colour. So the column count
 * has to divide the item count exactly — the widest one that does wins, and
 * anything that does not divide falls back to a single column.
 */
export function cardGrid(count: number, max: 2 | 3 = 2): string {
  const classes: string[] = [];
  if (count % 2 === 0) classes.push("sm:grid-cols-2");
  if (max >= 3 && count % 3 === 0) classes.push("lg:grid-cols-3");
  return classes.join(" ");
}
