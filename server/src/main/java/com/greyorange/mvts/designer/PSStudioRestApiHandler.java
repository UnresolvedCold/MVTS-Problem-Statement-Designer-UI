package com.greyorange.mvts.designer;

import com.fasterxml.jackson.databind.JsonNode;
import com.greyorange.multifleetplanner.helpers.Helper;
import com.greyorange.mvts.designer.properties.ApplicationProperties;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.eclipse.jetty.server.Request;
import org.eclipse.jetty.server.handler.AbstractHandler;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.*;
import java.util.concurrent.CopyOnWriteArraySet;

public class PSStudioRestApiHandler extends AbstractHandler {

  private String cacheDefaultConfig = null;
  private Map<String, String> queryParams;

  @Override
  public void handle(String target, Request baseRequest, HttpServletRequest request, HttpServletResponse response)
      throws IOException, ServletException {

    JsonNode jsonHeader = Helper.getObjectMapper().readTree(ApplicationProperties.SERVER_HEADERS.getValue());
    for (Iterator<Map.Entry<String, JsonNode>> it = jsonHeader.fields(); it.hasNext(); ) {
      Map.Entry<String, JsonNode> entry = it.next();
      response.setHeader(entry.getKey(), entry.getValue().asText());
    }

    if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
      response.setStatus(HttpServletResponse.SC_OK);
      baseRequest.setHandled(true);
      return;
    }

    if ("GET".equalsIgnoreCase(request.getMethod())) {
      Map<String, String> queryParams = new HashMap<>();
      for (Enumeration<String> e = request.getParameterNames(); e.hasMoreElements(); ) {
        String name = e.nextElement();
        String[] values = request.getParameterValues(name);
        for (String value : values) {
          queryParams.put(name, value);
        }
      }

      try {
        String responseBody = "";

        if (target.startsWith("/schemas/bot")) {
          responseBody = Helper.getObjectMapper().writeValueAsString(ProblemStatementStudio.getInstance().getBot());
        } else if (target.startsWith("/schemas/pps")) {
          responseBody = Helper.getObjectMapper().writeValueAsString(ProblemStatementStudio.getInstance().getPps());
        } else if (target.startsWith("/schemas/msu")) {
          responseBody = Helper.getObjectMapper().writeValueAsString(ProblemStatementStudio.getInstance().getMSU());
        } else if (target.startsWith("/schemas/task")) {
          responseBody = Helper.getObjectMapper().writeValueAsString(ProblemStatementStudio.getInstance().getTask());
        } else if (target.startsWith("/schemas/assignment")) {
          responseBody = Helper.getObjectMapper().writeValueAsString(ProblemStatementStudio.getInstance().getAssignment());
        } else if (target.startsWith("/schemas/problem-statement")) {
          responseBody = Helper.getObjectMapper().writeValueAsString(ProblemStatementStudio.getInstance().getInputMessage());
        } else if (target.startsWith("/config/default")) {
          responseBody = getDefaultConfigFromMVTS();
        }

        response.setContentType("application/json");
        response.setStatus(HttpServletResponse.SC_OK);
        response.getWriter().write(responseBody);
        baseRequest.setHandled(true);

      } catch (Exception e) {
        e.printStackTrace();
        response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        baseRequest.setHandled(true);
      }
    }
  }

  private String getDefaultConfigFromMVTS() {

    if (cacheDefaultConfig != null) {
      return cacheDefaultConfig;
    }

    String apiUrl = ApplicationProperties.MVTS_CONFIG_URL.getValue();
    try {
      HttpClient client = HttpClient.newHttpClient();
      HttpRequest request = HttpRequest.newBuilder()
          .uri(URI.create(apiUrl))
          .GET()
          .build();

      HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

      if (response.statusCode() == 200) {
        String responseBody = response.body();
        cacheDefaultConfig = responseBody;
        return responseBody;
      } else {
        throw new RuntimeException("Failed to fetch config from MVTS: HTTP " + response.statusCode());
      }
    } catch (Exception e) {
      e.printStackTrace();
      return null;
    }
  }

}
