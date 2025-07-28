# Solution Viewer Feature

## Overview

The Solution Viewer is a new component that displays solution assignments received from the MVTS server when the problem statement is solved. It appears as a new panel on the right side of the Grid Editor interface.

## Features

### 1. **Assignment List View**
- Displays a summary of all assignments with key information:
  - Task ID (task_key)
  - Bot ID (assigned_ranger_id)
  - Duration (startTime - endTime)
  - Transport Entity details
  - PPS information
- Color-coded assignment cards with hover effects
- Assignment count and feasibility status

### 2. **Individual Assignment Details**
- Click on any assignment to view its complete JSON data
- Formatted JSON display with syntax highlighting
- Easy navigation back to the list view

### 3. **Full Solution View**
- Toggle to view the complete solution data
- Includes all server response information
- Raw JSON format for detailed analysis

### 4. **Export Features**
- **Copy to Clipboard**: Copy individual assignments or complete solution
- **Download**: Save assignments or solution as JSON files
- Multiple export options for different data views

## Server Integration

### Event Handling
The Solution Viewer listens for the `NEW_ASSIGNMENTS` server event:

```json
{
  "type": "NEW_ASSIGNMENTS",
  "assignments": "{\"request_id\":null,\"schedule\":{\"cost\":{\"feasible\":false,\"hard_score\":0,\"soft_score\":[],\"objective_function_value\":[]},\"assignments\":[{\"startTime\":5000,\"endTime\":15000,\"serviced_bins\":[],\"serviced_orders\":[],\"assigned_ranger_id\":1,\"task_key\":\"task-1\",\"task_type\":\"picktask\",\"transport_entity_type\":\"rack\",\"transport_entity_id\":\"1\",\"dock_pps_id\":1,\"dock_sequence_at_pps\":0,\"entity_drop_sequence\":1,\"entity_pick_sequence\":1,\"ranger_dock_coordinate\":{\"x\":0,\"y\":0},\"ranger_start_time\":5000,\"ranger_available_start_time\":5000,\"task_subtype\":\"storable_to_conveyor\",\"aisle_info\":{\"aisle_id\":0,\"aisle_coordinate\":[0,0]},\"is_reordered\":false,\"original_planned_time\":0,\"last_replanned_time\":0,\"ranger_group_task_key\":null}],\"reserved_ranger_list\":[]}}"
}
```

### Data Processing
- Automatically parses the assignments JSON string
- Extracts assignment arrays and schedule information
- Handles both string and object formats for flexibility

## User Interface

### Layout
- **Position**: Right panel, next to Property Editor
- **Visibility**: Only appears when solution data is available
- **Responsive**: Adjustable width (350-500px)
- **Scrollable**: Handles large solution datasets

### Visual Design
- **Icons**: Emoji-based icons for better UX (🎯, 🤖, ⏰, 📦, 🏭)
- **Color Scheme**: Green-themed to indicate successful solutions
- **Typography**: Clear hierarchy with different font sizes
- **Interactive Elements**: Hover effects and button states

### Navigation
- **Tab System**: Toggle between "Assignments" and "Full Solution" views
- **Breadcrumb Navigation**: Easy return from assignment details to list
- **Close Button**: Remove solution panel when not needed
- **Refresh Button**: Reset view state

## Usage Workflow

1. **Create Problem**: Set up objects and tasks in the Grid Editor
2. **Solve Problem**: Click the "🚀 Run" button to send the problem to the server
3. **View Solution**: When the server responds with `NEW_ASSIGNMENTS`, the Solution Viewer automatically appears
4. **Explore Assignments**: Browse the list of assignments with key details
5. **Analyze Details**: Click on individual assignments to see complete data
6. **Export Data**: Use copy/download features to save solution data

## Technical Implementation

### Components
- **SolutionViewer.js**: Main component handling all solution display logic
- **GridEditor.js**: Updated to integrate solution viewer and handle server events

### State Management
- `solutionData`: Stores the complete solution response from server
- `selectedAssignment`: Tracks currently selected assignment for detail view
- `viewMode`: Controls display mode ('list', 'assignment', 'all')

### Error Handling
- Graceful parsing of JSON strings vs objects
- Error boundaries for malformed data
- User-friendly messages for missing data

## Future Enhancements

### Potential Improvements
- **Search/Filter**: Add ability to filter assignments by criteria
- **Sorting**: Sort assignments by time, bot ID, or task type
- **Visualization**: Add timeline or Gantt chart views
- **Real-time Updates**: Handle incremental assignment updates
- **Statistics**: Show solution statistics and metrics
- **Comparison**: Compare multiple solution versions

### Integration Opportunities
- **Grid Visualization**: Highlight assigned paths on the grid
- **Animation**: Show assignment execution as animation
- **Validation**: Check assignment feasibility and conflicts
- **Optimization**: Suggest assignment improvements

## Error Scenarios

### Handled Cases
- Empty or missing assignment data
- Malformed JSON in server response
- Network connectivity issues
- Invalid assignment structures

### User Feedback
- Clear error messages
- Loading states during server communication
- Success notifications with assignment counts
- Graceful degradation when data is unavailable

## Accessibility

### Features
- **Keyboard Navigation**: Tab through assignments and buttons
- **Screen Reader Support**: Semantic HTML structure
- **Color Independence**: Information not solely dependent on color
- **Clear Labels**: Descriptive button and section labels

## Performance Considerations

### Optimization
- **Lazy Rendering**: Only render visible assignments
- **Memory Management**: Clean up large JSON data when not needed
- **Efficient Updates**: Minimal re-renders on state changes
- **Data Caching**: Preserve solution data during navigation
