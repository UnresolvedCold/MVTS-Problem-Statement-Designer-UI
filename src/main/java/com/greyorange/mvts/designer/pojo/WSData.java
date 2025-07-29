package com.greyorange.mvts.designer.pojo;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;

public class WSData {
  @JsonProperty("type")
  WSEvent event;

  @JsonProperty("data")
  JsonNode dataNode;

  public WSEvent getEvent() {
    return event;
  }

  public void setEvent(WSEvent event) {
    this.event = event;
  }

  public JsonNode getDataNode() {
    return dataNode;
  }

  public void setDataNode(JsonNode dataNode) {
    this.dataNode = dataNode;
  }
}
