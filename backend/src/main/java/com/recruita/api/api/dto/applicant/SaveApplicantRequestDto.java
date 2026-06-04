package com.recruita.api.api.dto.applicant;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.recruita.api.config.validation.ApplicantValidationMessageKey;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record SaveApplicantRequestDto(
    @NotBlank(message = "{" + ApplicantValidationMessageKey.Codes.ID_REQUIRED + "}") String id,
    @NotBlank(message = "{" + ApplicantValidationMessageKey.Codes.NAME_REQUIRED + "}") String name,
    @NotBlank(message = "{" + ApplicantValidationMessageKey.Codes.EMAIL_REQUIRED + "}")
        @Email(message = "{" + ApplicantValidationMessageKey.Codes.EMAIL_REQUIRED + "}")
        String email,
    @NotBlank(message = "{" + ApplicantValidationMessageKey.Codes.PHONE_REQUIRED + "}")
        String phone,
    @NotBlank(message = "{" + ApplicantValidationMessageKey.Codes.LOCATION_REQUIRED + "}")
        String location,
    @NotNull(message = "{" + ApplicantValidationMessageKey.Codes.YEARS_OF_EXPERIENCE_REQUIRED + "}")
        Double yearsOfExperience,
    @NotBlank(message = "{" + ApplicantValidationMessageKey.Codes.APPLICATION_STATUS_REQUIRED + "}")
        String applicationStatus,
    @NotBlank(message = "{" + ApplicantValidationMessageKey.Codes.CURRENT_JOB_TITLE_REQUIRED + "}")
        String currentJobTitle,
    LocalDate availableFrom,
    @Size(min = 1, message = "{" + ApplicantValidationMessageKey.Codes.SKILLS_REQUIRED + "}")
        List<@NotBlank String> skills,
    String notes) {

  public SaveApplicantRequestDto {
    skills = skills == null ? List.of() : List.copyOf(skills);
  }
}
