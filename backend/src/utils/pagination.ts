export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function parsePagination(
  page: number,
  limit: number,
  maxLimit = 100,
): PaginationParams {
  const safePage = page > 0 ? page : 1;
  const safeLimit = Math.min(Math.max(limit, 1), maxLimit);

  return { page: safePage, limit: safeLimit };
}

export function buildPaginationMeta(
  page: number,
  limit: number,
  total: number,
): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / limit),
  };
}

export function paginationSkip(page: number, limit: number): number {
  return (page - 1) * limit;
}
