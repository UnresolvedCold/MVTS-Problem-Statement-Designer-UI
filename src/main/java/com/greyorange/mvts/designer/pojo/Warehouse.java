package com.greyorange.mvts.designer.pojo;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.greyorange.multifleetplanner.pojo.InputMessage;

public class Warehouse {
  @JsonProperty("width")
  private int width;

  @JsonProperty("height")
  private int height;

  @JsonProperty("problem_statement")
  private InputMessage inputMessage;

  public Warehouse() {
    this.width = 10;
    this.height = 15;
    this.inputMessage = new InputMessage();
  }

  public int getHeight() {
    return height;
  }

  public void setHeight(int height) {
    this.height = height;
  }

  public InputMessage getInputMessage() {
    return inputMessage;
  }

  public void setInputMessage(InputMessage inputMessage) {
    this.inputMessage = inputMessage;
  }

  public int getWidth() {
    return width;
  }

  public void setWidth(int width) {
    this.width = width;
  }
}
