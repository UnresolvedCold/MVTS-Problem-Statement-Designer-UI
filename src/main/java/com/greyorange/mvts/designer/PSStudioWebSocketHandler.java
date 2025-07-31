package com.greyorange.mvts.designer;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.greyorange.multifleetplanner.helpers.Helper;
import com.greyorange.multifleetplanner.pojo.SchedulerResponse;
import com.greyorange.mvts.designer.pojo.WSData;
import com.greyorange.mvts.designer.pojo.WSEvent;
import com.greyorange.mvts.designer.pojo.*;
import com.greyorange.mvts.designer.pojo.Warehouse;
import org.eclipse.jetty.websocket.api.Session;
import org.eclipse.jetty.websocket.api.annotations.*;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArraySet;

@WebSocket
public class PSStudioWebSocketHandler {
  private static final CopyOnWriteArraySet<Session> sessions = new CopyOnWriteArraySet<>();

  @OnWebSocketConnect
  public void onConnect(Session session) {
    try {
      sessions.add(session);
      System.out.println("Client connected: " + session);
    } catch (Exception e) {
      e.printStackTrace();
    }
  }

  @OnWebSocketMessage
  public void onMessage(Session session, String message) throws IOException {
    try {
      WSData data = Helper.getObjectMapper().readValue(message, WSData.class);
      if (data.getEvent().equals(WSEvent.PING)) {
        session.getRemote().sendString("{\"type\":\"PONG\"}");
      } else if (data.getEvent().equals(WSEvent.GET_WAREHOUSE_DATA)) {
        handleGetWarehouseData(session);
      } else if (data.getEvent().equals(WSEvent.UPDATE_WAREHOUSE_DATA)) {
        handleUpdateWarehouseData(session, data);
      } else if (data.getEvent().equals(WSEvent.ADD_PPS)) {
        handleNewPPSCreation(session, data);
      } else if (data.getEvent().equals(WSEvent.DELETE_PPS)) {
        
      } else if (data.getEvent().equals(WSEvent.UPDATE_PPS)) {
        
      } else if (data.getEvent().equals(WSEvent.ADD_BOT)) {
        handleNewBotCreation(session, data);
      } else if (data.getEvent().equals(WSEvent.DELETE_BOT)) {

      } else if (data.getEvent().equals(WSEvent.UPDATE_BOT)) {

      } else if (data.getEvent().equals(WSEvent.ADD_MSU)) {
        handleNewMSUCreation(session, data);
      } else if (data.getEvent().equals(WSEvent.ADD_TASK)) {
        handleNewTaskCreation(session, data);
      } else if (data.getEvent().equals(WSEvent.SOLVE_PROBLEM_STATEMENT)) {
        handleSolveProblemStatement(session, data);
      } else if (data.getEvent().equals(WSEvent.ADD_ASSIGNMENT)) {
        handleNewAssignmentCreation(session, data);
      } else if (data.getEvent().equals(WSEvent.UPDATE_SIZE)) {
        handleSizeUpdate(session, data);
      } else {
        System.out.println("Unknown event type: " + data.getEvent());
      }

    } catch (Exception e) {
      System.err.println(e.getStackTrace());
    }
  }

  @OnWebSocketClose
  public void onClose(Session session, int statusCode, String reason) {
    sessions.remove(session);
    System.out.println("Client disconnected: " + reason);
  }

  @OnWebSocketError
  public void onError(Session session, Throwable throwable) {
    System.err.println("Error in session " + session + ": " + throwable.getMessage());
    throwable.printStackTrace();
  }

  // Helper methods to handle different events

  private void handleUpdateWarehouseData(Session session, WSData data) throws Exception {
    Warehouse updatedWarehouse = Helper.getObjectMapper().readValue(data.getDataNode().toString(), Warehouse.class);
    ProblemStatementStudio.getInstance().updateWarehouse(updatedWarehouse);

    String jsonResponse = Helper.getObjectMapper().writeValueAsString(Map.of(
        "type", WSEvent.WAREHOUSE_DATA_RESPONSE,
        "warehouse", ProblemStatementStudio.getInstance().getWarehouse()
    ));

    session.getRemote().sendString(jsonResponse);
  }

  private void handleGetWarehouseData(Session session) throws IOException {
    String jsonResponse = Helper.getObjectMapper().writeValueAsString(Map.of(
        "type", WSEvent.WAREHOUSE_DATA_RESPONSE,
        "warehouse", ProblemStatementStudio.getInstance().getWarehouse()
    ));

    session.getRemote().sendString(jsonResponse);
  }

  private void handleNewPPSCreation(Session session, WSData data) throws Exception {
    ProblemStatementStudio.getInstance().addNewPPS();

    String jsonResponse = Helper.getObjectMapper().writeValueAsString(Map.of(
        "type", WSEvent.WAREHOUSE_DATA_RESPONSE,
        "warehouse", ProblemStatementStudio.getInstance().getWarehouse()
    ));
    session.getRemote().sendString(jsonResponse);
  }

  private void handleNewBotCreation(Session session, WSData data) throws Exception {
    ProblemStatementStudio.getInstance().addNewBot();

    String jsonResponse = Helper.getObjectMapper().writeValueAsString(Map.of(
        "type", WSEvent.WAREHOUSE_DATA_RESPONSE,
        "warehouse", ProblemStatementStudio.getInstance().getWarehouse()
    ));
    session.getRemote().sendString(jsonResponse);
  }

  private void handleNewMSUCreation(Session session, WSData data) throws Exception {
    ProblemStatementStudio.getInstance().addNewMSU();

    String jsonResponse = Helper.getObjectMapper().writeValueAsString(Map.of(
        "type", WSEvent.WAREHOUSE_DATA_RESPONSE,
        "warehouse", ProblemStatementStudio.getInstance().getWarehouse()
    ));
    session.getRemote().sendString(jsonResponse);
  }

  private void handleNewTaskCreation(Session session, WSData data) throws Exception {
    WSNewTaskData taskData = Helper.getObjectMapper().readValue(data.getDataNode().toString(), WSNewTaskData.class);
    ProblemStatementStudio.getInstance().addTask(taskData.getMsuID(), taskData.getPpsID());

    String jsonResponse = Helper.getObjectMapper().writeValueAsString(Map.of(
        "type", WSEvent.WAREHOUSE_DATA_RESPONSE,
        "warehouse", ProblemStatementStudio.getInstance().getWarehouse()
    ));
    session.getRemote().sendString(jsonResponse);
  }

  private void handleSolveProblemStatement(Session session, WSData data) throws Exception {
    SchedulerResponse output = ProblemStatementStudio.getInstance().solveProblemStatement();

    String jsonResponse = Helper.getObjectMapper().writeValueAsString(Map.of(
        "type", WSEvent.NEW_ASSIGNMENTS,
        "assignments", output
    ));

    System.out.println(jsonResponse);

    session.getRemote().sendString(jsonResponse);
  }


  private void handleSizeUpdate(Session session, WSData data) throws Exception {

    int row = data.getDataNode().get(0).asInt();
    int col = data.getDataNode().get(1).asInt();
    ProblemStatementStudio.getInstance().updateSize(row, col);

    String jsonResponse = Helper.getObjectMapper().writeValueAsString(Map.of(
        "type", WSEvent.WAREHOUSE_DATA_RESPONSE,
        "warehouse", ProblemStatementStudio.getInstance().getWarehouse()
    ));
    session.getRemote().sendString(jsonResponse);
  }

  private void handleNewAssignmentCreation(Session session, WSData data) throws Exception {
    WSNewAssignmentData assignmentData = Helper.getObjectMapper().readValue(data.getDataNode().toString(), WSNewAssignmentData.class);
    ProblemStatementStudio.getInstance().addPPSCurrentSchedule(
        assignmentData.getPpsID(),
        assignmentData.getBotID(),
        assignmentData.getMsuID(),
        assignmentData.getTaskID()
    );

    String jsonResponse = Helper.getObjectMapper().writeValueAsString(Map.of(
        "type", WSEvent.WAREHOUSE_DATA_RESPONSE,
        "warehouse", ProblemStatementStudio.getInstance().getWarehouse()
    ));
    session.getRemote().sendString(jsonResponse);
  }

}
