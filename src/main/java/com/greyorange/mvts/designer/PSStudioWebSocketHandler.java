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
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicBoolean;

@WebSocket
public class PSStudioWebSocketHandler {
  private static final CopyOnWriteArraySet<Session> sessions = new CopyOnWriteArraySet<>();
  private static final ExecutorService executor = Executors.newCachedThreadPool();

  // Queue for managing sequential problem solving requests
  private static final BlockingQueue<Runnable> problemSolvingQueue = new LinkedBlockingQueue<>();
  private static final ExecutorService sequentialExecutor = Executors.newSingleThreadExecutor();
  private static final AtomicBoolean isProcessingQueue = new AtomicBoolean(false);

  static {
    // Start the queue processor
    startQueueProcessor();
  }

  /**
   * Starts the queue processor that handles problem solving requests sequentially
   */
  private static void startQueueProcessor() {
    sequentialExecutor.submit(() -> {
      while (!Thread.currentThread().isInterrupted()) {
        try {
          // Take the next task from queue (blocks if queue is empty)
          Runnable task = problemSolvingQueue.take();

          // Execute the task
          task.run();

        } catch (InterruptedException e) {
          Thread.currentThread().interrupt();
          break;
        } catch (Exception e) {
          System.err.println("Error processing problem solving queue: " + e.getMessage());
          e.printStackTrace();
        }
      }
    });
  }

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
   * Adds the request to a queue for sequential processing to prevent concurrent executions.
   * Provides queue position feedback to the client.
   *
   * @param session The WebSocket session of the client.
   * @param dataNode The JSON data node containing the problem statement details.
   */
  private void handleSolveProblemStatement(Session session, JsonNode dataNode) {
    String inputMessage = dataNode.get("problemStatement").toString();

    JsonNode configNode = dataNode.get("config");
    Map<String, String> configs = new HashMap<>();

    // Flatten configNode if present
    if (configNode != null && !configNode.isNull()) {
      flattenJson(configNode, "", configs);
    }

    // Get current queue position
    int queuePosition = problemSolvingQueue.size() + 1;

    // Notify client about queue position
    try {
      if (queuePosition == 1) {
        session.getRemote().sendString("{\"type\":\"SOLVING_PROBLEM_STATEMENT\", \"data\":{\"log\":\"Starting problem solving immediately...\", \"timestamp\":" + System.currentTimeMillis() + "}}");
      } else {
        session.getRemote().sendString("{\"type\":\"SOLVING_PROBLEM_STATEMENT\", \"data\":{\"log\":\"Request queued at position " + queuePosition + ". Waiting for previous requests to complete...\", \"timestamp\":" + System.currentTimeMillis() + "}}");
      }
    } catch (IOException e) {
      System.err.println("Error sending queue position message: " + e.getMessage());
    }

    // Add task to queue for sequential processing
    problemSolvingQueue.offer(() -> {
      try {
        // Notify when processing starts
        session.getRemote().sendString("{\"type\":\"SOLVING_PROBLEM_STATEMENT\", \"data\":{\"log\":\"Processing started for this request...\", \"timestamp\":" + System.currentTimeMillis() + "}}");

        String result = ProblemStatementStudio.getInstance().solve(inputMessage, configs);

        // Send completion message
        session.getRemote().sendString("{\"type\":\"PROBLEM_STATEMENT_SOLVED\", \"data\":" + result + "}");
      } catch (Exception e) {
        String errorMsg = "Error while solving problem statement: " + e.getMessage();
        try {
          session.getRemote().sendString("{\"type\":\"PROBLEM_STATEMENT_SOLVED\", \"data\":\"" + errorMsg + "\"}");
        } catch (IOException ioException) {
          System.err.println("Error sending error message: " + ioException.getMessage());
        }
      }
    });
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
