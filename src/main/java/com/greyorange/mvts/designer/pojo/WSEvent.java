package com.greyorange.mvts.designer.pojo;

public enum WSEvent {
  // Event that client is connected to the server
  PING, PONG,
  // Send the current state of the warehouse
  GET_WAREHOUSE_DATA,
  // Update the warehouse state
  UPDATE_WAREHOUSE_DATA,
  // Event that client accepts to update its state
  WAREHOUSE_DATA_RESPONSE,
  // Add a new PPS
  ADD_PPS,
  DELETE_PPS,
  UPDATE_PPS,
  ADD_BOT,
  DELETE_BOT,
  UPDATE_BOT,
  ADD_MSU,
  ADD_TASK,
  ADD_ASSIGNMENT,
  SOLVE_PROBLEM_STATEMENT,
  NEW_ASSIGNMENTS, UPDATE_SIZE
}
