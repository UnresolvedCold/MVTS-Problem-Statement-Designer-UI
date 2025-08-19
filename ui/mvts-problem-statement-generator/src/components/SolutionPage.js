// src/components/SolutionPage.js
import React, { useState, useMemo, useEffect } from 'react';
import LogViewer from './LogViewer';

const SolutionPage = ({ solutionData, logs, isStreaming, onClearLogs, onClear, onAssignToProblem }) => {
   const [viewMode, setViewMode] = useState('list'); // 'list' or 'gantt'
   const [sectionsCollapsed, setSectionsCollapsed] = useState({
     assignments: false,
     solution: true, // Start collapsed
     logs: !isStreaming // Show logs while streaming
   });

   // Process assignments for Gantt chart - must be before any conditional returns
   const ganttData = useMemo(() => {
     if (!solutionData) return [];

     const assignments = solutionData.schedule?.assignments || solutionData.assignments || [];

     // Calculate time scale with 5-second buffer at the end
     const allTimes = assignments.flatMap(a => [
       a.startTime || a.operator_start_time || 0,
       a.endTime || a.operator_end_time || 0
     ]);
     const minTime = Math.min(...allTimes, 0);
     const maxTime = Math.max(...allTimes, 1) + 5000; // Add 5-second (5000ms) buffer
     const timeRange = maxTime - minTime;

     return assignments.map(assignment => ({
       taskKey: assignment.task_key,
       botId: assignment.assigned_ranger_id,
       startTime: assignment.startTime || assignment.operator_start_time || 0,
       endTime: assignment.endTime || assignment.operator_end_time || 0,
       duration: (assignment.endTime || assignment.operator_end_time || 0) - (assignment.startTime || assignment.operator_start_time || 0),
       ppsId: assignment.dock_pps_id,
       msuId: assignment.transport_entity_id,
       // Calculate position for visual representation
       startPercent: timeRange > 0 ? ((assignment.startTime || assignment.operator_start_time || 0) - minTime) / timeRange * 100 : 0,
       durationPercent: timeRange > 0 ? ((assignment.endTime || assignment.operator_end_time || 0) - (assignment.startTime || assignment.operator_start_time || 0)) / timeRange * 100 : 100
     }));
   }, [solutionData]);

   // Extract assignments for use in components
   const assignments = useMemo(() => {
     return solutionData?.schedule?.assignments || solutionData?.assignments || [];
   }, [solutionData]);

   // Toggle section collapse
   const toggleSection = (section) => {
     setSectionsCollapsed(prev => ({
       ...prev,
       [section]: !prev[section]
     }));
   };

   // Auto-expand logs while streaming, switch to assignments when solved
   useEffect(() => {
     if (isStreaming) {
       setSectionsCollapsed(prev => ({
         ...prev,
         logs: false,
         assignments: true,
         solution: true
       }));
     } else if (solutionData && !isStreaming) {
       setSectionsCollapsed(prev => ({
         ...prev,
         assignments: false,
         logs: true,
         solution: true
       }));
     }
   }, [isStreaming, solutionData]);

   // Show empty state if no data and not streaming
   if (!solutionData && (!logs || logs.length === 0) && !isStreaming) {
     return (
       <div className="p-10 text-center text-gray-600 dark:text-gray-400 h-screen flex flex-col justify-center items-center bg-gray-50 dark:bg-gray-900">
         <div className="text-6xl mb-5">🎯</div>
         <h2 className="m-0 mb-2 text-gray-900 dark:text-gray-100 text-3xl">No Solution Available</h2>
         <p className="m-0 mb-5 max-w-md">
           Run a problem statement to see the solution and processing logs here.
         </p>
         <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm max-w-lg border border-blue-200 dark:border-blue-700">
           <strong>💡 Tip:</strong> Go to the Grid Editor tab, set up your warehouse with bots, PPS, MSUs, and tasks, then click "🚀 Run" to solve the problem.
         </div>
       </div>
     );
   }

   // Render assignments list
   const renderAssignmentsList = () => {
     if (assignments.length === 0) {
       return (
         <div className="text-center py-10 text-gray-600 dark:text-gray-400">
           No assignments available
         </div>
       );
     }

     return (
       <div className="space-y-2">
         {assignments.map((assignment, index) => (
           <div key={`${assignment.task_key}-${index}`} className="p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
             <div className="grid grid-cols-2 gap-2 text-sm">
               <div><strong>Task:</strong> {assignment.task_key}</div>
               <div><strong>Bot:</strong> {assignment.assigned_ranger_id}</div>
               <div><strong>PPS:</strong> {assignment.dock_pps_id}</div>
               <div><strong>MSU:</strong> {assignment.transport_entity_id}</div>
               <div><strong>Start:</strong> {assignment.startTime || assignment.operator_start_time || 0}ms</div>
               <div><strong>End:</strong> {assignment.endTime || assignment.operator_end_time || 0}ms</div>
             </div>
             <div className="mt-2 flex justify-end">
               <button
                 onClick={() => onAssignToProblem(assignment)}
                 className="py-1 px-3 bg-blue-500 dark:bg-blue-600 text-white border-none rounded cursor-pointer hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors text-sm"
               >
                 Assign
               </button>
             </div>
           </div>
         ))}
       </div>
     );
   };

   // Render Gantt Chart
   const renderGanttChart = () => {
     if (ganttData.length === 0) {
       return (
         <div className="text-center py-10 text-gray-600 dark:text-gray-400">
           No assignment data available for Gantt chart
         </div>
       );
     }

     // Group by bot
     const tasksByBot = ganttData.reduce((acc, task) => {
       if (!acc[task.botId]) {
         acc[task.botId] = [];
       }
       acc[task.botId].push(task);
       return acc;
     }, {});

     // Sort tasks by start time within each bot
     Object.keys(tasksByBot).forEach(botId => {
       tasksByBot[botId].sort((a, b) => a.startTime - b.startTime);
     });

     // Use the actual time range including buffer from ganttData calculation
     const allTimes = ganttData.flatMap(a => [a.startTime, a.endTime]);
     const minTime = Math.min(...allTimes, 0);
     const actualMaxTime = Math.max(...allTimes, 1);
     const maxTime = actualMaxTime + 5000; // Include the 5-second buffer

     // Create time markers for better visualization
     const timeMarkers = [];
     const timeStep = (maxTime - minTime) / 6; // Create 7 time markers (including start and end)
     for (let i = 0; i <= 6; i++) {
       timeMarkers.push(Math.round(minTime + (timeStep * i)));
     }

     return (
       <div className="w-full overflow-x-auto">
         <div className="min-w-150">
           {/* Time axis header */}
           <div className="flex items-center py-2.5 border-b-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
             <div className="w-30 px-2.5 font-bold text-gray-900 dark:text-gray-100 border-r border-gray-300 dark:border-gray-600">
               Bot ID
             </div>
             <div className="flex-1 relative h-8">
               {timeMarkers.map((time, index) => (
                 <div
                   key={index}
                   className="absolute text-xs text-gray-600 dark:text-gray-400 transform -translate-x-1/2"
                   style={{ left: `${(time - minTime) / (maxTime - minTime) * 100}%` }}
                 >
                   {time}ms
                 </div>
               ))}
             </div>
           </div>

           {/* Bot rows */}
           {Object.entries(tasksByBot).map(([botId, tasks]) => (
             <div key={botId} className="flex items-center min-h-12 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
               <div className="w-30 px-2.5 font-bold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">
                 Bot {botId}
               </div>
               <div className="flex-1 relative h-10 my-1.5">
                 {tasks.map((task, index) => (
                   <div
                     key={`${task.taskKey}-${index}`}
                     className="absolute h-7 bg-green-500 dark:bg-green-600 rounded flex items-center justify-center text-white text-xs font-bold cursor-pointer border border-green-700 dark:border-green-500 shadow hover:bg-green-600 dark:hover:bg-green-700 transition-colors"
                     style={{
                       left: `${task.startPercent}%`,
                       width: `${Math.max(task.durationPercent, 2)}%` // Minimum 2% width for visibility
                     }}
                     title={`Task: ${task.taskKey}\nBot: ${task.botId}\nStart: ${task.startTime}ms\nEnd: ${task.endTime}ms\nDuration: ${task.duration}ms\nPPS: ${task.ppsId}\nMSU: ${task.msuId}`}
                   >
                     <div className="overflow-hidden text-ellipsis whitespace-nowrap px-1">
                       {task.taskKey}
                     </div>
                   </div>
                 ))}
               </div>
             </div>
           ))}
         </div>
       </div>
     );
   };

   return (
     <div className="p-5 h-screen overflow-auto bg-gray-50 dark:bg-gray-900">
       {/* Header */}
       <div className="bg-white dark:bg-gray-800 p-5 rounded-lg mb-5 shadow">
         <div className="flex justify-between items-center mb-4">
           <h2 className="m-0 text-gray-900 dark:text-gray-100 text-2xl">🎉 Solution Results</h2>
           <div className="flex gap-2.5">
             <button
               onClick={onClear}
               className="py-2 px-4 bg-red-500 dark:bg-red-600 text-white border-none rounded cursor-pointer hover:bg-red-600 dark:hover:bg-red-700 transition-colors"
             >
               🗑️ Clear
             </button>
           </div>
         </div>

         {/* Status */}
         {solutionData ? (
           <div className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 py-2 px-3 rounded border border-green-200 dark:border-green-700">
             ✅ Solution received successfully
           </div>
         ) : (
           <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 py-2 px-3 rounded border border-blue-200 dark:border-blue-700">
             🔄 Waiting for solution...
           </div>
         )}
       </div>

       {/* Assignments Section */}
       {solutionData && (
         <div className="bg-white dark:bg-gray-800 p-5 rounded-lg mb-5 shadow">
           <div
             className="flex justify-between items-center mb-4 cursor-pointer"
             onClick={() => toggleSection('assignments')}
           >
             <h3 className="m-0 text-gray-900 dark:text-gray-100">
               📋 Assignments ({assignments?.length || 0})
             </h3>
             <div className="flex items-center gap-2.5">
               {/* View Mode Toggle */}
               <div className="flex border border-gray-300 dark:border-gray-600 rounded overflow-hidden">
                 <button
                   onClick={(e) => {
                     e.stopPropagation();
                     setViewMode('list');
                   }}
                   className={`px-3 py-1 text-xs border-none cursor-pointer transition-colors ${
                     viewMode === 'list'
                       ? 'bg-blue-500 dark:bg-blue-600 text-white'
                       : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                   }`}
                 >
                   📋 List
                 </button>
                 <button
                   onClick={(e) => {
                     e.stopPropagation();
                     setViewMode('gantt');
                   }}
                   className={`px-3 py-1 text-xs border-none cursor-pointer transition-colors ${
                     viewMode === 'gantt'
                       ? 'bg-blue-500 dark:bg-blue-600 text-white'
                       : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                   }`}
                 >
                   📊 Gantt
                 </button>
               </div>
               <span className="text-gray-500 dark:text-gray-400 text-sm">
                 {sectionsCollapsed.assignments ? '▶' : '▼'}
               </span>
             </div>
           </div>

           {!sectionsCollapsed.assignments && (
             <div className="max-h-96 overflow-auto border border-gray-200 dark:border-gray-600 rounded">
               {viewMode === 'list' ? renderAssignmentsList() : renderGanttChart()}
             </div>
           )}
         </div>
       )}

       {/* Solution JSON Section */}
       {solutionData && (
         <div className="bg-white dark:bg-gray-800 p-5 rounded-lg mb-5 shadow">
           <div
             className="flex justify-between items-center mb-4 cursor-pointer"
             onClick={() => toggleSection('solution')}
           >
             <h3 className="m-0 text-gray-900 dark:text-gray-100">📄 Raw Solution JSON</h3>
             <span className="text-gray-500 dark:text-gray-400 text-sm">
               {sectionsCollapsed.solution ? '▶' : '▼'}
             </span>
           </div>

           {!sectionsCollapsed.solution && (
             <pre className="max-h-96 overflow-auto font-mono text-xs bg-gray-50 dark:bg-gray-900 p-3 rounded border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
               {JSON.stringify(solutionData, null, 2)}
             </pre>
           )}
         </div>
       )}

       {/* Logs Section */}
       <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow">
         <div
           className="flex justify-between items-center mb-4 cursor-pointer"
           onClick={() => toggleSection('logs')}
         >
           <h3 className="m-0 text-gray-900 dark:text-gray-100">
             📋 Server Logs ({logs.length})
             {isStreaming && (
               <span className="ml-2 text-blue-600 dark:text-blue-400 text-sm">🔄 Streaming...</span>
             )}
           </h3>
           <div className="flex items-center gap-2.5">
             <button
               onClick={(e) => {
                 e.stopPropagation();
                 onClearLogs();
               }}
               className="py-1 px-2 bg-red-500 dark:bg-red-600 text-white border-none rounded cursor-pointer text-xs hover:bg-red-600 dark:hover:bg-red-700 transition-colors"
             >
               🗑️ Clear
             </button>
             <span className="text-gray-500 dark:text-gray-400 text-sm">
               {sectionsCollapsed.logs ? '▶' : '▼'}
             </span>
           </div>
         </div>

         {!sectionsCollapsed.logs && (
           <LogViewer
             logs={logs}
             isStreaming={isStreaming}
           />
         )}
       </div>
     </div>
   );
};

export default SolutionPage;
