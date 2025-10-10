import type { Group, GroupDTO, LaravelPaginationDTO, Page } from '@/types/groups';

export const mapGroupDTO = (dto: GroupDTO): Group => ({
  id: dto.id,
  name: dto.name,
  grade: dto.grade,
  section: dto.section,
  code: dto.code,
  createdAt: dto.created_at,
  updatedAt: dto.updated_at,
});

export const mapPaginatedGroupsDTO = (
  dto: LaravelPaginationDTO<GroupDTO>
): Page<Group> => {
  const { current_page, per_page, total, from, to, last_page, next_page_url, prev_page_url } = dto;

  return {
    data: dto.data.map(mapGroupDTO),
    meta: {
      page: current_page,
      perPage: per_page,
      total,
      from,
      to,
      lastPage: last_page,
      hasNext: Boolean(next_page_url),
      hasPrev: Boolean(prev_page_url),
    },
  };
};
