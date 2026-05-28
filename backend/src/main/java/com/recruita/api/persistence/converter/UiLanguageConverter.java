package com.recruita.api.persistence.converter;

import com.recruita.api.common.enums.UiLanguage;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class UiLanguageConverter implements AttributeConverter<UiLanguage, String> {

  @Override
  public String convertToDatabaseColumn(UiLanguage attribute) {
    return attribute == null ? null : attribute.code();
  }

  @Override
  public UiLanguage convertToEntityAttribute(String dbData) {
    return dbData == null ? null : UiLanguage.fromCode(dbData);
  }
}
