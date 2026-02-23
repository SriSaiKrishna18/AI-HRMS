// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title RizeOS Task Logger
 * @notice Logs task completion events on-chain for workforce verification
 * @dev Deploy to Sepolia testnet via Remix IDE
 */
contract TaskLogger {
    // Event emitted when a task is completed
    event TaskCompleted(
        address indexed employee,
        uint256 indexed taskId,
        uint256 timestamp,
        address indexed organization
    );

    // Mapping to track logged tasks
    mapping(uint256 => bool) public taskLogged;

    // Total tasks logged
    uint256 public totalTasksLogged;

    /**
     * @notice Log a task completion on-chain
     * @param employee The wallet address of the employee
     * @param taskId The unique task ID from the HRMS
     */
    function logTaskCompletion(address employee, uint256 taskId) external {
        require(!taskLogged[taskId], "Task already logged");
        require(employee != address(0), "Invalid employee address");

        taskLogged[taskId] = true;
        totalTasksLogged++;

        emit TaskCompleted(employee, taskId, block.timestamp, msg.sender);
    }

    /**
     * @notice Check if a task has been logged
     * @param taskId The task ID to check
     * @return Whether the task has been logged
     */
    function isTaskLogged(uint256 taskId) external view returns (bool) {
        return taskLogged[taskId];
    }
}
