package com.recruita.api.action.model;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_EMPTY)
public record BulkUpdateUpdatesDto(String applicationStatus, String notes) {}
