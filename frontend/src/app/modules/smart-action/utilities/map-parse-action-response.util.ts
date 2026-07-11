import type { ParsedActionDto } from '../../../generated/api/types';
import { ParsedAction } from '../models/parsed-action.type';
import { ParseActionResponse } from '../models/parse-action-response.model';

export function mapParseActionResponse(
  response: ParseActionResponse
): ParsedAction | null {
  if (!response.valid || response.action == null) {
    return null;
  }
  return mapParsedActionDto(response.action);
}

/** Generated DTO unions align with domain action shapes at runtime. */
function mapParsedActionDto(dto: ParsedActionDto): ParsedAction {
  return dto as unknown as ParsedAction;
}
