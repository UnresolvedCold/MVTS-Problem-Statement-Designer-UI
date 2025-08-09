package com.greyorange.mvts.designer;

import com.fasterxml.jackson.databind.JsonNode;
import com.greyorange.multifleetplanner.helpers.Helper;
import com.greyorange.multifleetplanner.pojo.InputMessage;
import com.greyorange.mvts.designer.pojo.WSData;
import com.greyorange.mvts.designer.pojo.WSEvent;
import org.eclipse.jetty.websocket.api.Session;
import org.eclipse.jetty.websocket.api.annotations.*;

import java.io.IOException;
import java.util.HashMap;
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
      }

      if (data.getEvent().equals(WSEvent.SOLVE_PROBLEM_STATEMENT)) {
        handleSolveProblemStatement(session, data.getDataNode());
      }  else {
        System.err.println("Unknown event type: " + data.getEvent());
      }

    } catch (Exception e) {
      System.err.println("Error parsing message: " + message);
      e.printStackTrace();
      session.getRemote().sendString("{\"type\":\"ERROR\", \"message\":\"Invalid message format\"}");
      return;
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

  /**
   * Handles the SOLVE_PROBLEM_STATEMENT event.
   * Starts solving problem statements based on the provided data node.
   * Streams the logs and solution back to the client.
   *
   * @param session The WebSocket session of the client.
   * @param dataNode The JSON data node containing the problem statement details.
   */
  private void handleSolveProblemStatement(Session session, JsonNode dataNode) {
    InputMessage inputMessage = Helper.getObjectMapper()
        .convertValue(dataNode.get("problemStatement"), InputMessage.class);

    JsonNode configNode = dataNode.get("config");
    Map<String, String> configs = new HashMap<>();

    // Flatten configNode if present
    if (configNode != null && !configNode.isNull()) {
      flattenJson(configNode, "", configs);
    }

    String res = ProblemStatementStudio.getInstance().solve(inputMessage, configs);
    try {
      session.getRemote().sendString("{\"type\":\"PROBLEM_STATEMENT_SOLVED\", \"data\":" + res + "}");
    } catch (IOException e) {
      System.err.println("Error sending solution: " + e.getMessage());
      e.printStackTrace();
    }
  }

  /**
   * Recursively flattens a JsonNode into a dot-notated map.
   */
  private void flattenJson(JsonNode node, String prefix, Map<String, String> result) {
    if (node.isObject()) {
      node.fieldNames().forEachRemaining(fieldName -> {
        String newPrefix = prefix.isEmpty() ? fieldName : prefix + "." + fieldName;
        flattenJson(node.get(fieldName), newPrefix, result);
      });
    } else if (node.isArray()) {
      for (int i = 0; i < node.size(); i++) {
        String newPrefix = prefix + "[" + i + "]";
        flattenJson(node.get(i), newPrefix, result);
      }
    } else { // Value node
      result.put(prefix, node.asText());
    }
  }

}
