package com.recruita.api.action.model;

/** Supported smart-action verbs returned by the LLM parser. */
public enum ActionType {
  FILTER_APPLICANTS,
  UPDATE_STATUS,
  EXPORT_DATA,
  CREATE_APPLICANT,
  DELETE_APPLICANT,
  GENERATE_REPORT,
  MATCH_JOB,
  BULK_UPDATE,
  CLARIFY
}
