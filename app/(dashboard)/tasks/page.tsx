"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useTasks, useUpdateTask, Task } from "@/src/lib/api/tasks";
import Table from "@/src/components/Table";

export default function TasksPage() {
  const { data: tasks, isLoading, error } = useTasks();
  const updateTask = useUpdateTask();

  const pendingTasks = tasks?.filter((task) => task.status === "PENDING") || [];
  const completedTasks =
    tasks?.filter((task) => task.status === "COMPLETED") || [];

  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  const handleToggleStatus = (task: Task) => {
    const newStatus = task.status === "PENDING" ? "COMPLETED" : "PENDING";
    setUpdatingTaskId(task.id);
    updateTask.mutate(
      { id: task.id, status: newStatus },
      {
        onSuccess: () => {
          toast.success(
            newStatus === "COMPLETED"
              ? "Task marked as completed"
              : "Task reopened"
          );
          setUpdatingTaskId(null);
        },
        onError: (error) => {
          toast.error(error.message);
          setUpdatingTaskId(null);
        },
      }
    );
  };

  const columns = [
    { key: "title", header: "Title" },
    {
      key: "description",
      header: "Description",
      render: (row: Task) => row.description || "-",
    },
    {
      key: "assignee",
      header: "For",
      render: (row: Task) => {
        if (row.person) return `${row.person.firstName} ${row.person.lastName}`;
        if (row.business) return row.business.name;
        return "-";
      },
    },
    {
      key: "actions",
      header: "Action",
      render: (row: Task) => {
        const isUpdating = updatingTaskId === row.id;
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleStatus(row);
            }}
            disabled={isUpdating}
            className={`px-3 py-1 rounded text-sm font-medium ${
              row.status === "PENDING"
                ? "bg-green-100 text-green-700 hover:bg-green-200"
                : "bg-blue-100 text-blue-700 hover:bg-blue-200"
            } ${isUpdating ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isUpdating ? "Updating..." : row.status === "PENDING" ? "Complete" : "Reopen"}
          </button>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Tasks</h1>
        <p className="text-gray-600">Loading tasks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Tasks</h1>
        <p className="text-red-600">Error loading tasks: {error.message}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Tasks</h1>

      <h2 className="text-xl font-semibold mb-2">Pending Tasks</h2>
      <Table<Task> columns={columns} data={pendingTasks} />

      <h2 className="text-xl font-semibold mb-2 mt-6">Completed Tasks</h2>
      <Table<Task> columns={columns} data={completedTasks} />
    </div>
  );
}
