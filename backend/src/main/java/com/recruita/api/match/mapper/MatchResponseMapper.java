package com.recruita.api.match.mapper;

import com.recruita.api.api.dto.match.CandidateProfileDto;
import com.recruita.api.api.dto.match.MatchResponseDto;
import com.recruita.api.api.dto.match.MatchScoreDto;
import com.recruita.api.match.domain.CandidateProfile;
import com.recruita.api.match.domain.MatchScore;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface MatchResponseMapper {

  default MatchResponseDto toDto(List<MatchScore> scores) {
    return new MatchResponseDto(scores.stream().map(this::toScoreDto).toList());
  }

  @Mapping(source = "correlationId", target = "id")
  MatchScoreDto toScoreDto(MatchScore score);

  CandidateProfileDto toCandidateProfileDto(CandidateProfile profile);
}
