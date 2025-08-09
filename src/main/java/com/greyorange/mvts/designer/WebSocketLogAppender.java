package com.greyorange.mvts.designer;

import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.AppenderBase;
import ch.qos.logback.core.encoder.Encoder;
import org.eclipse.jetty.websocket.api.Session;

import java.io.IOException;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArraySet;

/**
 * Custom Logback appender that streams log messages to WebSocket sessions
 */
public class WebSocketLogAppender extends AppenderBase<ILoggingEvent> {

    private static final Set<Session> activeSessions = new CopyOnWriteArraySet<>();
    private Encoder<ILoggingEvent> encoder;

    public static void addSession(Session session) {
        activeSessions.add(session);
    }

    public static void removeSession(Session session) {
        activeSessions.remove(session);
    }

    public void setEncoder(Encoder<ILoggingEvent> encoder) {
        this.encoder = encoder;
    }

    @Override
    protected void append(ILoggingEvent event) {
        if (!isStarted()) {
            return;
        }

        try {
            // Format the log message
            String logMessage = new String(encoder.encode(event)).trim();

            // Create WebSocket message with SOLVING_PROBLEM_STATEMENT event type
            String wsMessage = String.format(
                "{\"type\":\"SOLVING_PROBLEM_STATEMENT\", \"data\":{\"log\":\"%s\", \"level\":\"%s\", \"logger\":\"%s\", \"timestamp\":%d}}",
                escapeJson(logMessage),
                event.getLevel().toString(),
                event.getLoggerName(),
                event.getTimeStamp()
            );

            // Send to all active WebSocket sessions
            for (Session session : activeSessions) {
                if (session.isOpen()) {
                    try {
                        session.getRemote().sendString(wsMessage);
                    } catch (IOException e) {
                        // Remove session if it's no longer valid
                        activeSessions.remove(session);
                        addError("Failed to send log message to WebSocket session", e);
                    }
                } else {
                    activeSessions.remove(session);
                }
            }
        } catch (Exception e) {
            addError("Error in WebSocketLogAppender", e);
        }
    }

    private String escapeJson(String input) {
        if (input == null) {
            return "";
        }
        return input.replace("\\", "\\\\")
                   .replace("\"", "\\\"")
                   .replace("\n", "\\n")
                   .replace("\r", "\\r")
                   .replace("\t", "\\t");
    }

    @Override
    public void start() {
        if (encoder == null) {
            addError("No encoder set for the appender named [" + name + "].");
            return;
        }

        encoder.start();
        super.start();
    }

    @Override
    public void stop() {
        if (encoder != null) {
            encoder.stop();
        }
        super.stop();
    }
}
