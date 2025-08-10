package com.greyorange.mvts.designer;

import com.greyorange.multifleetplanner.core.Config;
import com.greyorange.multifleetplanner.helpers.Helper;
import com.greyorange.multifleetplanner.multifleet.BackToStoreBotReservationv2;
import com.greyorange.multifleetplanner.multifleet.cache.BackToStorableCache;
import com.greyorange.multifleetplanner.multifleet.cache.ChargeTaskCache;
import com.greyorange.multifleetplanner.multifleet.cache.GoingToPPSCache;
import com.greyorange.multifleetplanner.pojo.*;
import com.greyorange.multifleetplanner.structure.MsuMap;
import com.greyorange.multifleetplanner_common.transit_time.TransitTimeDB;
import com.greyorange.mvts.core.Optimizer;
import com.greyorange.mvts.costs.ObjectiveFunction;
import com.greyorange.mvts.database.BotCycleTimeDB;
import com.greyorange.mvts.designer.properties.ApplicationProperties;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.eclipse.jetty.server.*;
import org.eclipse.jetty.server.handler.*;
import org.eclipse.jetty.servlet.ServletContextHandler;
import org.eclipse.jetty.websocket.server.config.JettyWebSocketServletContainerInitializer;
import org.joda.time.DateTime;

import java.io.File;
import java.io.IOException;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;
import java.util.*;

public class ProblemStatementStudio {

  static{
    Config config = Config.getInstance();
    Properties properties = config.getProperties();
    com.greyorange.multifleetplanner.core.ApplicationProperties.load(properties);
    com.greyorange.mvts.core.ApplicationProperties.load(properties);
    com.greyorange.taskscheduler.core.ApplicationProperties.load(properties);
    com.greyorange.subtaskplanner.core.ApplicationProperties.load(properties);
    com.greyorange.multifleetplanner_common.core.ApplicationProperties.load(properties);
  }

  private static ProblemStatementStudio instance;

  private ProblemStatementStudio() {
  }

  public static ProblemStatementStudio getInstance() {
    if (instance == null) {
      synchronized (ProblemStatementStudio.class) {
        if (instance == null) {
          instance = new ProblemStatementStudio();
        }
      }
    }
    return instance;
  }

  public InputMessage getInputMessage() {
    InputMessage inputMessage = new InputMessage();
    inputMessage.setPpsList(new ArrayList<>());
    inputMessage.setBotList(new ArrayList<>());
    inputMessage.setMsuList(new ArrayList<>());
    inputMessage.setTasks(new ArrayList<>());
    inputMessage.setStartTime(new DateTime(0));
    inputMessage.setPlanningDurationSeconds(5);
    return inputMessage;
  }

  public Pps getPps() {

    Pps pps = new Pps();
    pps.setPpsID(1);
    pps.setOperatorCoordinate(new Coordinate(0,0));
    pps.setQueueLength(1);
    pps.setCanAssignTask(true);
    pps.setBinDetails(new ArrayList<>(List.of(new BinDetails("1-1", true, false))));
    pps.setDockCoordinate(new ArrayList<>(List.of(new DockCoordinate(new Coordinate(0,0), DockType.rtp_pps_location))));
    pps.setMode(PpsMode.PICK);
    pps.setPpsType(PPSType.RTP_ONLY);
    pps.setConnectedPPSList(new ArrayList<>());
    pps.setPpsExitCoordinate(pps.getDockCoordinate());
    pps.setPpsStatus(PPSStatus.OPEN);
    pps.setPpsLoginTime(0L);
    pps.setPpsLoggedIn(true);

    return pps;
  }

  public Bot getBot() {
    Bot bot = new Bot();
    bot.setBotID(1);
    bot.setCurrentCoordinate(new Coordinate(0,0));
    bot.setAvailableAtCoordinate(new Coordinate(0,0));
    bot.setAvailableStartTime(new DateTime(0));
    bot.setCapacity(1);
    bot.setAvailableCapacity(1);
    bot.setStatus("ready");
    bot.setVersion("rtp_demo");
    bot.setCurrentAisleInfo(new AisleInfo(0, new Integer[]{0,0}));

    return bot;
  }

  public Msu getMSU() {

    Msu msu = new Msu();
    msu.setMsuID("1");
    msu.setCoordinate(new Coordinate(0,0));
    msu.setCurrentLocationType(LocationType.STORABLE);
    msu.setIdleCoordinate(new Coordinate(0,0));
    msu.setAisleInfo(new AisleInfo(1, new Integer[]{0,0}));
    msu.setAvailable(true);
    msu.setDepth(0);
    msu.setDirection(0);
    msu.setHeight(1);
    msu.setLiftedRangerId(null);
    msu.setType(MsuType.RACK);

    return msu;
  }

  public Task getTask() {
    Task task = new Task();
    task.setPpsID(1);
    task.setMsuID("1");
    task.setTaskID("task-" + (1));
    task.setTaskType(TaskType.PICK);
    task.setTransportEntityType(TransportEntityType.RTP);
    task.setCoordinate(new Coordinate(0,0));


    ServicedOrder servicedOrder = new ServicedOrder();
    servicedOrder.setCritical(false);
    servicedOrder.setOperatorTime(0);
    servicedOrder.setOrderAllocationTime(new DateTime(0));
    servicedOrder.setOrderID(task.getTaskID());
    servicedOrder.setPickBeforeTime(new DateTime(0));
    servicedOrder.setPriority(Priority.medium);
    servicedOrder.setOperatorTime(0);
    task.setServicedOrders(new ServicedOrder[]{servicedOrder});

    ServicedBins servicedBins = new ServicedBins();
    servicedBins.setId(1+"-1");
    servicedBins.setVirtualIdentifier(0);
    task.setServicedBins(List.of(servicedBins));

    task.setAisleInfo(new AisleInfo(1, new Integer[]{0,0}));
    task.setAssignedRangerID(null);
    task.setTaskSubType(TaskSubType.storable_to_conveyor);
    task.setTaskStatus(TaskStatus.to_be_assigned);

    return task;
  }

  public Assignment getAssignment() {

    int pps = 1;
    int bot = 1;
    String msu = "1";
    String taskID = "assignment_1";

    Assignment assignment = new Assignment();
    assignment.setBotStartTime(new DateTime(0));
    assignment.setDropPpsID(pps);
    assignment.setTaskID(taskID);
    assignment.setAssignedPpsID(pps);
    assignment.setAisleInfo(new AisleInfo(1, new Integer[]{0,0}));
    assignment.setAssignedBotID(bot);
    assignment.setBotAvailableStartTime(new DateTime(0));
    assignment.setMsuID(MsuMap.getInstance().createAndGet(msu));
    assignment.setConveyorID(pps);
    assignment.setEntityPickSequence(1);
    assignment.setRangerGroupTaskKey("rgt"+bot);
    assignment.setTransportEntityID(msu);
    assignment.setTransportEntityType(TransportEntityType.TTP);
    assignment.setStartTime(new DateTime(0));
    assignment.setEndTime(new DateTime(0));

    ServicedOrder servicedOrder = new ServicedOrder();
    servicedOrder.setCritical(false);
    servicedOrder.setOperatorTime(0);
    servicedOrder.setOrderAllocationTime(new DateTime(0));
    servicedOrder.setOrderID(assignment.getTaskID());
    servicedOrder.setPickBeforeTime(new DateTime(0));
    servicedOrder.setPriority(Priority.medium);
    servicedOrder.setOperatorTime(0);
    assignment.setServicedOrders(List.of(servicedOrder));
    assignment.setTaskType(TaskType.PICK);
    assignment.setTaskSubType(TaskSubType.storable_to_conveyor);
    assignment.setTaskStatus(TaskStatus.going_to_pick_entity);

    ServicedBins servicedBins = new ServicedBins();
    servicedBins.setId(pps+"-1");
    servicedBins.setVirtualIdentifier(0);
    assignment.setServicedBins(List.of(servicedBins));

    return assignment;
  }

  public String solve(String inputMessage, Map<String, String> configs) {
    beforeEach();

    Config config = Config.getInstance();
    Properties originalProperties = (Properties) config.getProperties().clone();

    String res = null;
    try {
      res = Helper.getObjectMapper().writeValueAsString(new SchedulerResponse());
      updateApplicationProperties(configs);
      res = getOutput(inputMessage);

    } catch (Exception e) {

      e.printStackTrace();
    } finally {
      updateApplicationProperties((Map) originalProperties);
    }

    return res;
  }

  private String getOutput(String inputMessage) {
    // reflection QueueManager
    try {
      Class<?> queueManagerClass = Class.forName("com.greyorange.multifleetplanner.message.QueueManager");
      Method processMessage = queueManagerClass.getDeclaredMethod("processMessage", String.class);
      processMessage.setAccessible(true);
      return (String) processMessage.invoke(null, inputMessage);
    } catch (Exception e) {
      e.printStackTrace();
      throw new RuntimeException("Failed to process message", e);
    }
  }

  public void updateApplicationProperties(Map<String, String> configs) {
    Config config = Config.getInstance();
    Properties properties = config.getProperties();

    for (Map.Entry<String, String> entry : configs.entrySet()) {
      String key = entry.getKey();
      String value = entry.getValue();
      properties.setProperty(key, value);
    }

    com.greyorange.multifleetplanner.core.ApplicationProperties.load(properties);
    com.greyorange.mvts.core.ApplicationProperties.load(properties);
    com.greyorange.taskscheduler.core.ApplicationProperties.load(properties);
    com.greyorange.subtaskplanner.core.ApplicationProperties.load(properties);
    com.greyorange.multifleetplanner_common.core.ApplicationProperties.load(properties);
  }

  public void beforeEach() {
    Config.reset();
    Config config = Config.getInstance();
    Properties properties = config.getProperties();
    com.greyorange.multifleetplanner.core.ApplicationProperties.load(properties);
    com.greyorange.mvts.core.ApplicationProperties.load(properties);
    com.greyorange.taskscheduler.core.ApplicationProperties.load(properties);
    com.greyorange.subtaskplanner.core.ApplicationProperties.load(properties);
    com.greyorange.multifleetplanner_common.core.ApplicationProperties.load(properties);
    Optimizer.setUseOptaPlanner(false);
    BackToStorableCache.getInstance().clear();
    GoingToPPSCache.getInstance().clear();
    ChargeTaskCache.getInstance().clear();
    BackToStoreBotReservationv2.reset();
    ObjectiveFunction.setPpsToNonMSIOBin(new HashMap<>());
    BotCycleTimeDB.reset();
    MsuMap.getInstance().reset();
    Helper.updateProperties("TEST_MODE", "true");
    TransitTimeDB.getInstance().reset();

    // clear aisle to aisle map
    try {
      // Using Reflection API to get private method Get the private method
      Field aisleToAisle = com.greyorange.taskscheduler.models.TransitTimeTable.class
          .getDeclaredField("aisleToAisle");


      // Make the private method accessible
      aisleToAisle.setAccessible(true);

      //set it as null
      aisleToAisle.set(null, null);
    } catch (Exception e) {
      e.printStackTrace();
    }

    // Destroy instance of IDC Manager
    try {
      Class<?> clazz = Class.forName("com.gor.library.JavaIdcManager.IdcManager");
      Field instanceField = clazz.getDeclaredField("instance");
      instanceField.setAccessible(true);
      instanceField.set(null, null);
    } catch (Exception e) {
      e.printStackTrace();
      throw new RuntimeException("Failed to reset IdcManager.instance via reflection", e);
    }

  }

  public static void main(String[] args) throws Exception {
    com.greyorange.multifleetplanner.server.Server.getInstance();

    startApiServer();
    startWsServer();
  }

  private static void startApiServer() {
    new Thread(() -> {
      try {
        Server apiServer = new Server(ApplicationProperties.REST_SERVER_PORT.getIntValue());

        String reactBuildPath = ApplicationProperties.UI_BASE_PATH.getValue();

        // API handler at /api/*
        ContextHandler apiContext = new ContextHandler("/api");
        apiContext.setHandler(new PSStudioRestApiHandler());

        // Serve static files from React build folder (from classpath in fat JAR)
        ResourceHandler staticHandler = new ResourceHandler();
        staticHandler.setDirectoriesListed(false);
        staticHandler.setWelcomeFiles(new String[]{"index.html"});
        
        // Check if running from JAR (classpath) or development (filesystem)
        URL resourceUrl = ProblemStatementStudio.class.getClassLoader().getResource(reactBuildPath);
        if (resourceUrl != null) {
          // Running from JAR - serve from classpath
          try {
            staticHandler.setResourceBase(resourceUrl.toURI().toString());
          } catch (URISyntaxException e) {
            e.printStackTrace();
            staticHandler.setResourceBase(reactBuildPath);
          }
        } else {
          // Development mode - serve from filesystem
          staticHandler.setResourceBase(reactBuildPath);
        }

        // Main handler for "/" (static + SPA fallback)
        HandlerWrapper spaHandler = new HandlerWrapper() {
          @Override
          public void handle(String target, Request baseRequest,
                             HttpServletRequest request, HttpServletResponse response)
              throws IOException, ServletException {

            // Check if resource exists (either filesystem or classpath)
            boolean resourceExists = false;
            
            if (resourceUrl != null) {
              // Running from JAR - check classpath
              URL targetResource = ProblemStatementStudio.class.getClassLoader()
                  .getResource(reactBuildPath + target);
              resourceExists = targetResource != null;
            } else {
              // Development mode - check filesystem
              Path filePath = Paths.get(reactBuildPath, target);
              File file = filePath.toFile();
              resourceExists = file.exists() && file.isFile();
            }

            if (resourceExists) {
              // Let ResourceHandler serve static assets
              super.handle(target, baseRequest, request, response);
            } else {
              // Fallback to index.html for React routing
              try {
                if (resourceUrl != null) {
                  // Running from JAR - serve index.html from classpath
                  URL indexUrl = ProblemStatementStudio.class.getClassLoader()
                      .getResource(reactBuildPath + "/index.html");
                  if (indexUrl != null) {
                    response.setContentType("text/html; charset=UTF-8");
                    response.setStatus(HttpServletResponse.SC_OK);
                    indexUrl.openStream().transferTo(response.getOutputStream());
                    baseRequest.setHandled(true);
                  }
                } else {
                  // Development mode - serve from filesystem
                  File indexFile = new File(reactBuildPath, "index.html");
                  if (indexFile.exists()) {
                    response.setContentType("text/html; charset=UTF-8");
                    response.setStatus(HttpServletResponse.SC_OK);
                    Files.copy(indexFile.toPath(), response.getOutputStream());
                    baseRequest.setHandled(true);
                  }
                }
              } catch (Exception e) {
                e.printStackTrace();
              }
            }
          }
        };
        spaHandler.setHandler(staticHandler);

        ContextHandler rootContext = new ContextHandler("/");
        rootContext.setHandler(spaHandler);

        // Combine API first, then React
        HandlerList handlers = new HandlerList();
        handlers.addHandler(apiContext);
        handlers.addHandler(rootContext);

        apiServer.setHandler(handlers);

        apiServer.start();
        System.out.println("API Server at http://localhost:"+ ApplicationProperties.REST_SERVER_PORT.getValue() +"/api");
        System.out.println("React app at http://localhost:"+ ApplicationProperties.REST_SERVER_PORT.getValue() +"/");
        apiServer.join();

      } catch (Exception e) {
        e.printStackTrace();
      }
    }).start();
  }

  private static void startWsServer() {
    new Thread(() -> {
      try {
        Server wsServer = new Server(ApplicationProperties.WS_SERVER_PORT.getIntValue());
        ServletContextHandler wsContext = new ServletContextHandler(ServletContextHandler.SESSIONS);
        wsContext.setContextPath("/");
        JettyWebSocketServletContainerInitializer.configure(wsContext, (ctx, container) -> {
          container.setIdleTimeout(Duration.ofMinutes(5));
          container.addMapping("/ws", (req, resp) -> new PSStudioWebSocketHandler());
        });
        wsServer.setHandler(wsContext);
        wsServer.start();
        System.out.println("WS Server at ws://localhost:"+ApplicationProperties.WS_SERVER_PORT.getIntValue()+"/ws");
        wsServer.join();
      } catch (Exception e) {
        e.printStackTrace();
      }
    }).start();
  }

}
