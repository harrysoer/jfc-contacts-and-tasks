"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import {
  useTags,
  useCreateTag,
  useUpdateTag,
  useDeleteTag,
  Tag,
} from "@/src/lib/api/tags";
import Table from "@/src/components/Table";
import Modal from "@/src/components/Modal";
import TextInput from "@/src/components/TextInput";
import Button from "@/src/components/Button";

type FormData = { name: string };

export default function TagsPage() {
  const { data: tags, isLoading, error } = useTags();
  const createMutation = useCreateTag();
  const updateMutation = useUpdateTag();
  const deleteMutation = useDeleteTag();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  useEffect(() => {
    if (isModalOpen) {
      if (editingTag) {
        reset({ name: editingTag.name });
      } else {
        reset({ name: "" });
      }
    }
  }, [editingTag, isModalOpen, reset]);

  const handleOpenCreate = () => {
    setEditingTag(null);
    setIsModalOpen(true);
  };

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTag(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this tag?")) {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          toast.success("Tag deleted");
        },
        onError: (error) => {
          toast.error(error.message);
        },
      });
    }
  };

  const onSubmit = (data: FormData) => {
    if (editingTag) {
      updateMutation.mutate(
        { id: editingTag.id, ...data },
        {
          onSuccess: () => {
            toast.success("Tag updated");
            handleCloseModal();
          },
          onError: (error) => {
            toast.error(error.message);
          },
        }
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          toast.success("Tag created");
          handleCloseModal();
        },
        onError: (error) => {
          toast.error(error.message);
        },
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  const columns = [
    { key: "name", header: "Name" },
    {
      key: "businessCount",
      header: "Businesses",
      render: (row: Tag) => row._count?.businesses ?? 0,
    },
    {
      key: "peopleCount",
      header: "People",
      render: (row: Tag) => row._count?.people ?? 0,
    },
    {
      key: "createdAt",
      header: "Created",
      render: (row: Tag) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: Tag) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(row);
            }}
            className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row.id);
            }}
            className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Tags</h1>
        <p className="text-gray-600">Loading tags...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Tags</h1>
        <p className="text-red-600">Error loading tags: {error.message}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Tags</h1>
        <Button onClick={handleOpenCreate}>
          <PlusIcon className="w-4 h-4 mr-2" />
          Add Tag
        </Button>
      </div>

      <Table<Tag> columns={columns} data={tags || []} />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingTag ? "Edit Tag" : "Add Tag"}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <TextInput
            label="Name"
            {...register("name", { required: "Name is required" })}
            error={errors.name?.message}
          />
          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {editingTag ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
