package com.recruita.api.persistence.converter;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import com.recruita.api.common.enums.UiLanguage;
import org.junit.jupiter.api.Test;

class UiLanguageConverterTest {

  private final UiLanguageConverter converter = new UiLanguageConverter();

  @Test
  void convertsLanguageToDatabaseCode() {
    assertEquals("de", converter.convertToDatabaseColumn(UiLanguage.DE));
  }

  @Test
  void convertsDatabaseCodeToLanguage() {
    assertEquals(UiLanguage.FR, converter.convertToEntityAttribute("fr"));
  }

  @Test
  void handlesNullValues() {
    assertNull(converter.convertToDatabaseColumn(null));
    assertNull(converter.convertToEntityAttribute(null));
  }
}
