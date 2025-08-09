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
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CopyOnWriteArraySet;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@WebSocket
public class PSStudioWebSocketHandler {
  private static final CopyOnWriteArraySet<Session> sessions = new CopyOnWriteArraySet<>();
  private static final ExecutorService executor = Executors.newCachedThreadPool();

  /**
   * Interface for streaming logs back to the client during problem solving
   */
  public interface LogStreamer {
    void streamLog(String logMessage);
    void streamError(String errorMessage);
    void streamComplete(String result);
  }

  @OnWebSocketConnect
  public void onConnect(Session session) {
    try {
      sessions.add(session);
      // Register session for log streaming
      WebSocketLogAppender.addSession(session);
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
    // Unregister session from log streaming
    WebSocketLogAppender.removeSession(session);
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
   * The actual logs will be streamed automatically via the WebSocket logback appender.
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

    // Execute problem solving asynchronously - logback will stream logs automatically
    CompletableFuture.supplyAsync(() -> {
      try {
        String result = ProblemStatementStudio.getInstance().solve(inputMessage, configs);
        // Send completion message
        session.getRemote().sendString("{\"type\":\"PROBLEM_STATEMENT_SOLVED\", \"data\":" + result + "}");
        return result;
      } catch (Exception e) {
        String errorMsg = "Error while solving problem statement: " + e.getMessage();
        try {
          session.getRemote().sendString("{\"type\":\"PROBLEM_STATEMENT_SOLVED\", \"data\":\"" + errorMsg + "\"}");
        } catch (IOException ioException) {
          System.err.println("Error sending error message: " + ioException.getMessage());
        }
        return errorMsg;
      }
    }, executor);
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
