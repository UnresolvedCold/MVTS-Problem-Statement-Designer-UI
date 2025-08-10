package com.greyorange.mvts.designer;

import com.fasterxml.jackson.core.JacksonException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.greyorange.multifleetplanner.PathVerifier;
import com.greyorange.multifleetplanner.core.ApplicationProperties;
import com.greyorange.multifleetplanner.core.Config;
import com.greyorange.multifleetplanner.helpers.Helper;
import com.greyorange.multifleetplanner.pojo.*;
import com.greyorange.multifleetplanner_common.db.MultifleetDB;
import com.greyorange.multifleetplanner_common.pojo.DiagnosticData;
import com.greyorange.multifleetplanner_common.pojo.DiagnosticEnum;
import com.greyorange.mvts.designer.pojo.WSData;
import com.greyorange.mvts.designer.pojo.WSEvent;
import com.greyorange.taskscheduler.models.TransitTimeTable;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.eclipse.jetty.server.Request;
import org.eclipse.jetty.server.handler.AbstractHandler;
import org.eclipse.jetty.websocket.api.Session;
import org.eclipse.jetty.websocket.api.annotations.*;
import pl.jalokim.propertiestojson.util.PropertiesToJsonConverter;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.CopyOnWriteArraySet;

public class PSStudioRestApiHandler extends AbstractHandler {

  private Map<String, String> queryParams;

  @Override
  public void handle(String target, Request baseRequest, HttpServletRequest request, HttpServletResponse response)
      throws IOException, ServletException {

    response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
    response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    response.setHeader("Access-Control-Allow-Credentials", "true");

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
}
