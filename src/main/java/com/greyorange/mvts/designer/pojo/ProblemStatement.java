package com.greyorange.mvts.designer.pojo;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;
import com.greyorange.multifleetplanner.pojo.InputMessage;

public class ProblemStatement {
  @JsonProperty("problem_statement")
  private InputMessage inputMessage;

  @JsonProperty("config")
  private JsonNode config;

  public InputMessage getInputMessage() {
    return inputMessage;
  }

  public void setInputMessage(InputMessage inputMessage) {
    this.inputMessage = inputMessage;
  }

  public JsonNode getConfig() {
    return config;
  }

  public void setConfig(JsonNode config) {
    this.config = config;
  }

}
