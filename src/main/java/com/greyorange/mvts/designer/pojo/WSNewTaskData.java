package com.greyorange.mvts.designer.pojo;

import com.fasterxml.jackson.annotation.JsonProperty;

public class WSNewTaskData {
  @JsonProperty("pps_id")
  int ppsID;

  @JsonProperty("msu_id")
  String msuID;

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
}
