import { MatchScoreItemParsedOmittedField } from '../constants/match-score-item-field.constants';
import { MatchScoreItem } from './match-score-item.model';

export interface ParsedMatchScoreItem
  extends Omit<MatchScoreItem, MatchScoreItemParsedOmittedField> {
  id: string;
  sourceIndex: number;
  matchScore: number;
}
