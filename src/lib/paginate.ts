export interface PageResult<T> {
  items: T[];
  page: number;
  totalPages: number;
  total: number;
}

/** Clamps `page` to a valid 1-based range and slices `items` accordingly. */
export function paginate<T>(
  items: T[],
  rawPage: number | string | undefined,
  pageSize: number,
): PageResult<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, Number(rawPage) || 1), totalPages);
  const start = (page - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), page, totalPages, total };
}
