"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useTasks, useUpdateTask, Task, TaskStatus } from "@/src/lib/api/tasks";
import Table from "@/src/components/Table";
import ConfirmationModal from "@/src/components/ConfirmationModal";

export default function TasksPage() {
  const { data: tasks, isLoading, error } = useTasks();
  const updateTask = useUpdateTask();

  const pendingTasks = tasks?.filter((task) => task.status === "PENDING") || [];
  const completedTasks =
    tasks?.filter((task) => task.status === "COMPLETED") || [];

  const [taskToUpdate, setTaskToUpdate] = useState<Task | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleStatusClick = (task: Task) => {
    setTaskToUpdate(task);
    setShowConfirmModal(true);
  };

  const handleConfirmStatusChange = () => {
    if (!taskToUpdate) return;

    const newStatus: TaskStatus = taskToUpdate.status === "PENDING" ? "COMPLETED" : "PENDING";

    updateTask.mutate(
      { id: taskToUpdate.id, status: newStatus },
      {
        onSuccess: () => {
          toast.success(
            newStatus === "COMPLETED"
              ? "Task marked as completed"
              : "Task reopened"
          );
          setShowConfirmModal(false);
          setTaskToUpdate(null);
        },
        onError: (error) => {
          toast.error(error.message);
        },
      }
    );
  };

  const handleCancelStatusChange = () => {
    setShowConfirmModal(false);
    setTaskToUpdate(null);
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
      render: (row: Task) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleStatusClick(row);
          }}
          className={`px-3 py-1 rounded text-sm font-medium cursor-pointer ${
            row.status === "PENDING"
              ? "bg-green-100 text-green-700 hover:bg-green-200"
              : "bg-blue-100 text-blue-700 hover:bg-blue-200"
          }`}
        >
          {row.status === "PENDING" ? "Complete" : "Reopen"}
        </button>
      ),
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

      <ConfirmationModal
        isOpen={showConfirmModal && !!taskToUpdate}
        onClose={handleCancelStatusChange}
        onConfirm={handleConfirmStatusChange}
        title={taskToUpdate?.status === "PENDING" ? "Complete Task" : "Reopen Task"}
        message={
          taskToUpdate && (
            <>
              Are you sure you want to{" "}
              {taskToUpdate.status === "PENDING" ? "mark" : "reopen"}{" "}
              <span className="font-medium">&quot;{taskToUpdate.title}&quot;</span>
              {taskToUpdate.status === "PENDING" ? " as completed" : ""}?
            </>
          )
        }
        isLoading={updateTask.isPending}
      />
    </div>
  );
}
