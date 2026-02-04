"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import { BuildingOffice2Icon, UserIcon } from "@heroicons/react/24/outline";
import { useCreateTask, useUpdateTask, useTasks, Task, TaskStatus } from "@/src/lib/api/tasks";
import Modal from "@/src/components/Modal";
import TextInput from "@/src/components/TextInput";
import Button from "@/src/components/Button";
import MultiSelect, { SelectOption } from "@/src/components/MultiSelect";

export type AssignableEntity =
  | { type: "business"; id: string; name: string }
  | { type: "person"; id: string; name: string };

type TaskFormData = {
  title: string;
  description: string;
  dueDate: string;
  status: SelectOption | null;
};

interface AssignTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  entity: AssignableEntity | null;
}

const STATUS_OPTIONS: SelectOption[] = [
  { value: "PENDING", label: "Pending" },
  { value: "COMPLETED", label: "Completed" },
];

export default function AssignTaskModal({
  isOpen,
  onClose,
  entity,
}: AssignTaskModalProps) {
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const { data: allTasks, isLoading: tasksLoading } = useTasks();

  // State for status change confirmation
  const [taskToUpdate, setTaskToUpdate] = useState<Task | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Filter tasks for the current entity
  const entityTasks = allTasks?.filter((task: Task) => {
    if (!entity) return false;
    if (entity.type === "business") {
      return task.businessId === entity.id;
    }
    return task.personId === entity.id;
  }) || [];

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<TaskFormData>({
    defaultValues: {
      title: "",
      description: "",
      dueDate: "",
      status: STATUS_OPTIONS[0],
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        title: "",
        description: "",
        dueDate: "",
        status: STATUS_OPTIONS[0],
      });
    }
  }, [isOpen, reset]);

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
          toast.success(`Task marked as ${newStatus === "COMPLETED" ? "completed" : "pending"}`);
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

  const onSubmit = (data: TaskFormData) => {
    if (!entity) return;

    const payload = {
      title: data.title,
      description: data.description || undefined,
      dueDate: data.dueDate || undefined,
      status: (data.status?.value as TaskStatus) || "PENDING",
      ...(entity.type === "business"
        ? { businessId: entity.id }
        : { personId: entity.id }),
    };

    createTask.mutate(payload, {
      onSuccess: () => {
        toast.success(`Task assigned to ${entity.name}`);
        onClose();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  };

  if (!entity) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Task">
      <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-500">Assigning task to:</p>
        <p className="font-medium text-gray-900 flex items-center gap-2 mt-1">
          {entity.type === "business" ? (
            <>
              <BuildingOffice2Icon className="w-4 h-4 text-purple-600" />
              {entity.name}
            </>
          ) : (
            <>
              <UserIcon className="w-4 h-4 text-blue-600" />
              {entity.name}
            </>
          )}
        </p>
      </div>

      {/* Existing Tasks Section */}
      <div className="mb-5">
        <p className="text-sm font-bold text-gray-900 mb-2">Current Tasks:</p>
        {tasksLoading ? (
          <p className="text-sm text-gray-500">Loading tasks...</p>
        ) : entityTasks.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No tasks assigned yet</p>
        ) : (
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {entityTasks.map((task: Task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200"
              >
                <span className="text-sm text-gray-800 truncate flex-1 mr-2">
                  {task.title}
                </span>
                <button
                  type="button"
                  onClick={() => handleStatusClick(task)}
                  className={`px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-opacity hover:opacity-80 ${
                    task.status === "COMPLETED"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                  title="Click to change status"
                >
                  {task.status === "COMPLETED" ? "Completed" : "Pending"}
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
      <hr className="mb-5"/>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <TextInput
            label="Title"
            {...register("title", {
              required: "Title is required",
              maxLength: {
                value: 255,
                message: "Title must be 255 characters or less",
              },
            })}
            error={errors.title?.message}
            placeholder="Enter task title..."
          />

          <TextInput
            label="Description"
            {...register("description", {
              maxLength: {
                value: 1000,
                message: "Description must be 1000 characters or less",
              },
            })}
            error={errors.description?.message}
            placeholder="Enter task description (optional)..."
          />

          <TextInput
            label="Due Date"
            type="date"
            {...register("dueDate")}
            error={errors.dueDate?.message}
          />

          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <MultiSelect
                label="Status"
                options={STATUS_OPTIONS}
                value={field.value}
                onChange={field.onChange}
                placeholder="Select status..."
                isClearable={false}
              />
            )}
          />
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={createTask.isPending}>
            {createTask.isPending ? "Assigning..." : "Assign Task"}
          </Button>
        </div>
      </form>

      {/* Status Change Confirmation Modal */}
      {showConfirmModal && taskToUpdate && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={handleCancelStatusChange}
          />
          <div className="relative bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Change Task Status
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to mark{" "}
              <span className="font-medium">&quot;{taskToUpdate.title}&quot;</span> as{" "}
              <span className="font-medium">
                {taskToUpdate.status === "PENDING" ? "completed" : "pending"}
              </span>
              ?
            </p>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancelStatusChange}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleConfirmStatusChange}
                disabled={updateTask.isPending}
              >
                {updateTask.isPending ? "Updating..." : "Confirm"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}