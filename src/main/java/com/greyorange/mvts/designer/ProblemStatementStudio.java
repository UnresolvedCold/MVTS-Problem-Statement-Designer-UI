package com.greyorange.mvts.designer;

import com.greyorange.multifleetplanner.core.ApplicationProperties;
import com.greyorange.multifleetplanner.core.Config;
import com.greyorange.multifleetplanner.multifleet.Driver;
import com.greyorange.multifleetplanner.pojo.*;
import com.greyorange.multifleetplanner.structure.MsuMap;
import com.greyorange.mvts.designer.pojo.Warehouse;
import com.greyorange.taskscheduler.core.Optimizer;
import org.checkerframework.checker.units.qual.A;
import org.eclipse.jetty.server.Server;
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
  private Warehouse warehouse = new Warehouse();

  // metadata
  private Map<String, Msu> msuMap = new HashMap<>();
  private Map<Integer, Bot> botMap = new HashMap<>();
  private Map<Integer, Pps> ppsMap = new HashMap<>();
  private Map<String, Task> taskMap = new HashMap<>();

  private ProblemStatementStudio() {
    InputMessage inputMessage = new InputMessage();
    inputMessage.setPpsList(new ArrayList<>());
    inputMessage.setBotList(new ArrayList<>());
    inputMessage.setMsuList(new ArrayList<>());
    inputMessage.setTasks(new ArrayList<>());
    inputMessage.setStartTime(new DateTime(0));
    inputMessage.setPlanningDurationSeconds(5);
    warehouse.setInputMessage(inputMessage);
  }

  public static ProblemStatementStudio getInstance() {
    if (instance == null) {
      synchronized (ProblemStatementStudio.class) {
        if (instance == null) {
          instance = new ProblemStatementStudio();
          instance.addNewPPS();
          instance.addNewBot();
          instance.addNewMSU();
        }
      }
    }
    return instance;
  }

  public Warehouse getWarehouse() {
    return warehouse;
  }

  public void updateWarehouse(Warehouse warehouse) {
    for (Msu msu: warehouse.getInputMessage().getMsuList()) {
      if (!msuMap.get(MsuMap.getInstance().getReverse(msu.getMsuID())).getCoordinate().equals(msu.getCoordinate())) {
        msu.setIdleCoordinate(msu.getCoordinate());
      }

      AisleInfo aisleInfo = new AisleInfo();
      if (com.greyorange.mvts.core.ApplicationProperties.VERTICAL_WAREHOUSE_AISLES()) {
        aisleInfo.setAisleID(msu.getIdleCoordinate().getX());
        aisleInfo.setAisleCoordinates(new Integer[]{msu.getIdleCoordinate().getX(), msu.getIdleCoordinate().getY()});
      } else {
        aisleInfo.setAisleID(msu.getIdleCoordinate().getY());
        aisleInfo.setAisleCoordinates(new Integer[]{msu.getIdleCoordinate().getX(), msu.getIdleCoordinate().getY()});
      }

      // If user wants it null, let it null
      if (msu.getAisleInfo() == null
          || msu.getAisleInfo().getAisleID() == null
          || msu.getAisleInfo().getAisleCoordinates() == null) {
        aisleInfo = msu.getAisleInfo();
      }

      msu.setAisleInfo(aisleInfo);

      msuMap.put(MsuMap.getInstance().getReverse(msu.getMsuID()), msu);
    }

    for (Bot bot: warehouse.getInputMessage().getBotList()) {
      if (!botMap.get(bot.getBotID()).getCurrentCoordinate().equals(bot.getCurrentCoordinate())) {
        bot.setAvailableAtCoordinate(bot.getCurrentCoordinate());
      }

      AisleInfo aisleInfo = new AisleInfo();
      if (com.greyorange.mvts.core.ApplicationProperties.VERTICAL_WAREHOUSE_AISLES()) {
        aisleInfo.setAisleID(bot.getAvailableAtCoordinate().getX());
        aisleInfo.setAisleCoordinates(new Integer[]{bot.getAvailableAtCoordinate().getX(), bot.getAvailableAtCoordinate().getY()});
      } else {
        aisleInfo.setAisleID(bot.getAvailableAtCoordinate().getY());
        aisleInfo.setAisleCoordinates(new Integer[]{bot.getAvailableAtCoordinate().getX(), bot.getAvailableAtCoordinate().getY()});
      }

      // If user wants it null, let it null
      if (bot.getCurrentAisleInfo() == null
          || bot.getCurrentAisleInfo().getAisleID() == null
          || bot.getCurrentAisleInfo().getAisleCoordinates() == null) {
        aisleInfo = bot.getCurrentAisleInfo();
      }

      bot.setCurrentAisleInfo(aisleInfo);

      botMap.put(bot.getBotID(), bot);
    }

    for (Pps pps: warehouse.getInputMessage().getPpsList()) {
      if (pps.getDockCoordinate()!=null && !pps.getDockCoordinate().isEmpty()) {
        pps.getDockCoordinate().get(0).setCoordinate(pps.getCoordinate());
      }
      pps.setPpsExitCoordinate(pps.getDockCoordinate());
      ppsMap.put(pps.getPpsID(), pps);
    }

    this.warehouse = warehouse;
  }

  public void addNewPPS() {
    List<Pps> oldPPSList = warehouse.getInputMessage().getPpsList();
    if (oldPPSList == null) {
      oldPPSList = new ArrayList<>();
    }

    Pps pps = new Pps();
    pps.setPpsID(oldPPSList.size()+1);
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

    oldPPSList.add(pps);
    ppsMap.put(pps.getPpsID(), pps);

    warehouse.getInputMessage().setPpsList(oldPPSList);
  }

  public void deletePPS(Integer ppsID) {
    List<Pps> oldPPSList = warehouse.getInputMessage().getPpsList();
    if (oldPPSList != null) {
      oldPPSList.removeIf(pps -> pps.getPpsID() == ppsID);
      warehouse.getInputMessage().setPpsList(oldPPSList);
    }
  }

  public void addNewBot() {
    List<Bot> oldBotList = warehouse.getInputMessage().getBotList();
    if (oldBotList == null) {
      oldBotList = new ArrayList<>();
    }

    Bot bot = new Bot();
    bot.setBotID(oldBotList.size() + 1);
    bot.setCurrentCoordinate(new Coordinate(0,0));
    bot.setAvailableAtCoordinate(new Coordinate(0,0));
    bot.setAvailableStartTime(new DateTime(0));
    bot.setCapacity(1);
    bot.setAvailableCapacity(1);
    bot.setStatus("ready");
    bot.setVersion("rtp_demo");
    bot.setCurrentAisleInfo(new AisleInfo(0, new Integer[]{0,0}));

    oldBotList.add(bot);
    botMap.put(bot.getBotID(), bot);

    warehouse.getInputMessage().setBotList(oldBotList);
  }

  public void deleteBot(Integer botID) {
    List<Bot> oldBotList = warehouse.getInputMessage().getBotList();
    if (oldBotList != null) {
      oldBotList.removeIf(bot -> bot.getBotID() == botID);
      warehouse.getInputMessage().setBotList(oldBotList);
    }
  }

  public void addNewMSU() {
    List<Msu> oldMSUList = warehouse.getInputMessage().getMsuList();
    if (oldMSUList == null) {
      oldMSUList = new ArrayList<>();
    }

    Msu msu = new Msu();
    msu.setMsuID(String.valueOf(oldMSUList.size() + 1));
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

    oldMSUList.add(msu);
    msuMap.put(MsuMap.getInstance().getReverse(msu.getMsuID()), msu);

    warehouse.getInputMessage().setMsuList(oldMSUList);
  }

  public void addTask(String msu, int pps) {
    List<Task> oldTaskList = warehouse.getInputMessage().getTasks();
    if (oldTaskList == null) {
      oldTaskList = new ArrayList<>();
    }

    Task task = new Task();
    task.setPpsID(pps);
    task.setMsuID(msu);
    task.setTaskID("task-" + (oldTaskList.size() + 1));
    task.setTaskType(TaskType.PICK);
    task.setTransportEntityType(msuMap.get(msu).getType() == MsuType.RACK ? TransportEntityType.RTP : TransportEntityType.TTP);
    task.setCoordinate(msuMap.get(msu).getIdleCoordinate());


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
    servicedBins.setId(pps+"-1");
    servicedBins.setVirtualIdentifier(0);
    task.setServicedBins(List.of(servicedBins));

    task.setAisleInfo(new AisleInfo(1, new Integer[]{0,0}));
    task.setAssignedRangerID(null);
    task.setTaskSubType(TaskSubType.storable_to_conveyor);
    task.setTaskStatus(TaskStatus.to_be_assigned);

    oldTaskList.add(task);
    taskMap.put(task.getTaskID(), task);
    warehouse.getInputMessage().setTasks(oldTaskList);
  }

  public void addPPSCurrentSchedule(int pps, int bot, String msu, String taskID) {
    CurrentSchedule currentSchedule = ppsMap.get(pps).getCurrentSchedule();
    if (currentSchedule == null) {
      currentSchedule = new CurrentSchedule();
      ppsMap.get(pps).setCurrentSchedule(currentSchedule);
    }

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

    List<Assignment> assignmentList = new ArrayList<>(List.of(ppsMap.get(pps).getCurrentSchedule().getAssignments()));
    assignmentList.add(assignment);
    currentSchedule.setAssignments(assignmentList.toArray(new Assignment[0]));
  }

  public void updateSize(int r, int c) {
    if (r < 1 || c < 1) {
      r=0; c=0;
      System.err.println("Invalid row or column size. Resetting to 0.");
    }
    warehouse.setWidth(c);
    warehouse.setHeight(r);
  }

  public SchedulerResponse solveProblemStatement() throws Exception {
    Driver driver = new Driver();
    Optimizer.setUseOptaPlanner(true);
    com.greyorange.mvts.core.Optimizer.setUseOptaPlanner(true);
    SchedulerResponse response = driver.getSchedule(warehouse.getInputMessage());
    return response;
  }

  public static void main(String[] args) throws Exception {
    com.greyorange.multifleetplanner.server.Server.getInstance();

    Integer port = args.length > 0 ? Integer.parseInt(args[0]) : 8089;

    Server server = new Server(port);
    ServletContextHandler context = new ServletContextHandler(ServletContextHandler.SESSIONS);
    context.setContextPath("/");
    server.setHandler(context);

    JettyWebSocketServletContainerInitializer.configure(context, (servletContext, wsContainer) -> {
      wsContainer.setIdleTimeout(Duration.ofMinutes(5)); // prevent premature closure
      wsContainer.addMapping("/ws", (req, resp) -> new PSStudioWebSocketHandler());
    });

    server.start();
    System.out.println("WebSocket server started on ws://localhost:"+port+"/ws");
    server.join();
  }
}
