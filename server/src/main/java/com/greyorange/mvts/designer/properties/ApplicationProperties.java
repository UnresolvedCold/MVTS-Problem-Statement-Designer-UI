package com.greyorange.mvts.designer.properties;

import java.io.FileInputStream;
import java.util.Properties;

public enum ApplicationProperties {
  WS_SERVER_PORT("WS_SERVER_PORT", "8089"),
  REST_SERVER_PORT("REST_SERVER_PORT", "8088"),
  UI_BASE_PATH("UI_BASE_PATH", "build"),
  SERVER_HEADERS("SERVER_HEADERS", """
      {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Credentials": "true"
      }
      """),
  MVTS_CONFIG_URL("MVTS_CONFIG_URL", "http://localhost:8080/mvts/config/all"),;

  private String key;
  private String value;

  static {
    Properties prop = new Properties();

    String envFilePath = System.getenv("PSS_PROPERTIES_FILE_PATH");
    if (envFilePath == null) {
      envFilePath = "config/pss.properties";
    }

    try {
      prop.load(new FileInputStream(envFilePath));
    } catch (Exception e) {
      e.printStackTrace();
    }
    for (ApplicationProperties property : ApplicationProperties.values()) {
      if (prop.containsKey(property.key)) {
        property.value = prop.getProperty(property.key);
      }
    }
  }

  ApplicationProperties(String key, String value) {
    this.key = key;
    this.value = value;
  }

  public String getKey() {
    return key;
  }

  public String getValue() {
    return value;
  }

  public int getIntValue() {
    try {
      return Integer.parseInt(value);
    } catch (NumberFormatException e) {
      throw new IllegalArgumentException("Value for " + key + " is not a valid integer: " + value, e);
    }
  }
}
