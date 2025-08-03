package com.greyorange.mvts.designer;

import com.greyorange.multifleetplanner.core.ApplicationProperties;
import com.greyorange.multifleetplanner.core.Config;
import com.greyorange.multifleetplanner.pojo.*;
import com.greyorange.multifleetplanner.structure.MsuMap;
import org.eclipse.jetty.server.Connector;
import org.eclipse.jetty.server.Handler;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.ServerConnector;
import org.eclipse.jetty.server.handler.HandlerCollection;
import org.eclipse.jetty.servlet.ServletContextHandler;
import org.eclipse.jetty.websocket.server.config.JettyWebSocketServletContainerInitializer;
import org.joda.time.DateTime;

import java.time.Duration;
import java.util.*;

public class ProblemStatementStudio {

  static{
    Config config = Config.getInstance();
    Properties properties = config.getProperties();
    ApplicationProperties.load(properties);
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

  public static void main(String[] args) throws Exception {
    com.greyorange.multifleetplanner.server.Server.getInstance();

    int port = args.length > 0 ? Integer.parseInt(args[0]) : 8089;

    Server server = new Server(port);
    ServerConnector connector = new ServerConnector(server);
    connector.setPort(port);
    server.setConnectors(new Connector[] { connector });

    PSStudioRestApiHandler restApiHandler = new PSStudioRestApiHandler();

//    ServletContextHandler servletContext = new ServletContextHandler(ServletContextHandler.SESSIONS);
//    servletContext.setContextPath("/");

//    JettyWebSocketServletContainerInitializer.configure(servletContext, (servletContext1, wsContainer) -> {
//      wsContainer.setIdleTimeout(Duration.ofMinutes(5));
//      wsContainer.addMapping("/ws", (req, resp) -> new PSStudioWebSocketHandler());
//    });

    // 3. Combine both handlers
    HandlerCollection handlers = new HandlerCollection();
    handlers.setHandlers(new Handler[] {
        restApiHandler
//        servletContext
    });

    server.setHandler(handlers);

    server.start();
    System.out.println("Server started:");
    System.out.println("  WebSocket: ws://localhost:" + port + "/ws");
    System.out.println("  REST API: http://localhost:" + port + "/api/...");
    server.join();
  }
}
