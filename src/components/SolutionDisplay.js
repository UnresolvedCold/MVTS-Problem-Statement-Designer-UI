// src/components/SolutionDisplay.js
import React from 'react';

const SolutionDisplay = ({ solutionData, onClose }) => {
  if (!solutionData) return null;

  const handleDownload = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(solutionData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "solution.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(solutionData, null, 2)).then(() => {
      console.log('Solution copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        maxWidth: '90%',
        maxHeight: '90%',
        overflow: 'auto',
        width: '800px'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          borderBottom: '1px solid #eee',
          paddingBottom: '10px'
        }}>
          <h2 style={{ margin: 0, color: '#28a745' }}>🎉 Problem Solved!</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666'
            }}
          >
            ×
          </button>
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '20px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={handleCopyToClipboard}
            style={{
              padding: '8px 16px',
              border: '1px solid #007bff',
              borderRadius: '4px',
              backgroundColor: '#007bff',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            📋 Copy Solution
          </button>
          
          <button
            onClick={handleDownload}
            style={{
              padding: '8px 16px',
              border: '1px solid #28a745',
              borderRadius: '4px',
              backgroundColor: '#28a745',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            💾 Download Solution
          </button>
        </div>

        {/* Solution Summary */}
        {solutionData.assignments && (
          <div style={{
            marginBottom: '20px',
            padding: '15px',
            backgroundColor: '#f8f9fa',
            borderRadius: '5px'
          }}>
            <h3 style={{ margin: '0 0 10px 0' }}>Solution Summary</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
              <div>
                <strong>Total Assignments:</strong> {solutionData.assignments?.length || 0}
              </div>
              {solutionData.cost && (
                <>
                  <div>
                    <strong>Feasible:</strong> {solutionData.cost.feasible ? 'Yes' : 'No'}
                  </div>
                  <div>
                    <strong>Hard Score:</strong> {solutionData.cost.hard_score || 0}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Full Solution JSON */}
        <div style={{
          marginBottom: '15px',
          padding: '15px',
          backgroundColor: '#f8f9fa',
          borderRadius: '5px'
        }}>
          <h3 style={{ margin: '0 0 10px 0' }}>Complete Solution</h3>
          <pre style={{
            backgroundColor: '#fff',
            padding: '15px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            overflow: 'auto',
            maxHeight: '400px',
            fontSize: '12px',
            fontFamily: 'monospace',
            margin: 0
          }}>
            {JSON.stringify(solutionData, null, 2)}
          </pre>
        </div>

        {/* Info */}
        <div style={{
          padding: '15px',
          backgroundColor: '#e3f2fd',
          borderRadius: '5px',
          fontSize: '14px'
        }}>
          <strong>ℹ️ Next Steps:</strong>
          <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
            <li>Review the solution assignments above</li>
            <li>Copy or download the solution for further analysis</li>
            <li>Modify your problem statement and solve again if needed</li>
            <li>Use the assignment data to visualize the solution</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SolutionDisplay;
