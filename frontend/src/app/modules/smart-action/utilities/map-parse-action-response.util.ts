import { ParsedAction } from '../models/parsed-action.type';
import { ParseActionResponse } from '../models/parse-action-response.model';

export function mapParseActionResponse(
  response: ParseActionResponse
): ParsedAction | null {
  if (!response.valid) {
    return null;
  }
  return response.action as ParsedAction;
}
