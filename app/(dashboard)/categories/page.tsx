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
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  Category,
} from "@/src/lib/api/categories";
import Table from "@/src/components/Table";
import Modal from "@/src/components/Modal";
import TextInput from "@/src/components/TextInput";
import Button from "@/src/components/Button";

type FormData = { name: string };

export default function CategoriesPage() {
  const { data: categories, isLoading, error } = useCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  useEffect(() => {
    if (isModalOpen) {
      if (editingCategory) {
        reset({ name: editingCategory.name });
      } else {
        reset({ name: "" });
      }
    }
  }, [editingCategory, isModalOpen, reset]);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          toast.success("Category deleted");
        },
        onError: (error) => {
          toast.error(error.message);
        },
      });
    }
  };

  const onSubmit = (data: FormData) => {
    if (editingCategory) {
      updateMutation.mutate(
        { id: editingCategory.id, ...data },
        {
          onSuccess: () => {
            toast.success("Category updated");
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
          toast.success("Category created");
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
      render: (row: Category) => row._count?.businesses ?? 0,
    },
    {
      key: "createdAt",
      header: "Created",
      render: (row: Category) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: Category) => (
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
        <h1 className="text-2xl font-bold mb-4">Categories</h1>
        <p className="text-gray-600">Loading categories...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Categories</h1>
        <p className="text-red-600">Error loading categories: {error.message}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Button onClick={handleOpenCreate}>
          <PlusIcon className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      <Table<Category> columns={columns} data={categories || []} />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingCategory ? "Edit Category" : "Add Category"}
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
              {editingCategory ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
