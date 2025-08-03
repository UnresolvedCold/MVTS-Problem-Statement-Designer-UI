package com.greyorange.mvts.designer;

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

}
