package com.greyorange.mvts.designer.pojo;

import com.fasterxml.jackson.annotation.JsonProperty;

public class WSNewAssignmentData {
  @JsonProperty("task_id")
  private String taskID;

  @JsonProperty("bot_id")
  private int botID;

  @JsonProperty("pps_id")
  private int ppsID;

  @JsonProperty("msu_id")
  private String msuID;

  public int getBotID() {
    return botID;
  }

  public void setBotID(int botID) {
    this.botID = botID;
  }

  public String getMsuID() {
    return msuID;
  }

  public void setMsuID(String msuID) {
    this.msuID = msuID;
  }

  public int getPpsID() {
    return ppsID;
  }

  public void setPpsID(int ppsID) {
    this.ppsID = ppsID;
  }

  public String getTaskID() {
    return taskID;
  }

  public void setTaskID(String taskID) {
    this.taskID = taskID;
  }
}
