"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import {
  useBusinesses,
  useCreateBusiness,
  useUpdateBusiness,
  useDeleteBusiness,
  Business,
} from "@/src/lib/api/businesses";
import { useTags } from "@/src/lib/api/tags";
import { useCategories } from "@/src/lib/api/categories";
import Table from "@/src/components/Table";
import Modal from "@/src/components/Modal";
import TextInput from "@/src/components/TextInput";
import Button from "@/src/components/Button";
import MultiSelect, { SelectOption } from "@/src/components/MultiSelect";
import AssignTaskModal, { AssignableEntity } from "@/src/components/AssignTaskModal";

type FormData = {
  name: string;
  description: string;
  categories: SelectOption[];
  tags: SelectOption[];
};

export default function BusinessesPage() {
  const { data: businesses, isLoading, error } = useBusinesses();
  const { data: tags, isLoading: tagsLoading } = useTags();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const createMutation = useCreateBusiness();
  const updateMutation = useUpdateBusiness();
  const deleteMutation = useDeleteBusiness();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskAssignEntity, setTaskAssignEntity] = useState<AssignableEntity | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name: "",
      description: "",
      categories: [],
      tags: [],
    },
  });

  const tagOptions: SelectOption[] =
    tags?.map((tag) => ({ value: tag.id, label: tag.name })) || [];

  const categoryOptions: SelectOption[] =
    categories?.map((cat) => ({ value: cat.id, label: cat.name })) || [];

  useEffect(() => {
    if (isModalOpen) {
      if (editingBusiness) {
        const businessTags =
          editingBusiness.tags?.map((bt) => ({
            value: bt.tag.id,
            label: bt.tag.name,
          })) || [];
        const businessCategories =
          editingBusiness.categories?.map((bc) => ({
            value: bc.category.id,
            label: bc.category.name,
          })) || [];
        reset({
          name: editingBusiness.name,
          description: editingBusiness.description || "",
          categories: businessCategories,
          tags: businessTags,
        });
      } else {
        reset({
          name: "",
          description: "",
          categories: [],
          tags: [],
        });
      }
    }
  }, [editingBusiness, isModalOpen, reset]);

  const handleOpenCreate = () => {
    setEditingBusiness(null);
    setIsModalOpen(true);
  };

  const handleEdit = (business: Business) => {
    setEditingBusiness(business);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBusiness(null);
  };

  const handleDelete = (business: Business) => {
    if (confirm(`Are you sure you want to delete ${business.name}?`)) {
      deleteMutation.mutate(business.id, {
        onSuccess: () => {
          toast.success("Business deleted");
        },
        onError: (error) => {
          toast.error(error.message);
        },
      });
    }
  };

  const handleAssignTask = (business: Business) => {
    setTaskAssignEntity({
      type: "business",
      id: business.id,
      name: business.name,
    });
    setIsTaskModalOpen(true);
  };

  const handleCloseTaskModal = () => {
    setIsTaskModalOpen(false);
    setTaskAssignEntity(null);
  };

  const onSubmit = (data: FormData) => {
    const payload = {
      name: data.name,
      description: data.description || null,
      categoryIds: data.categories.map((c) => c.value),
      tagIds: data.tags.map((t) => t.value),
    };

    if (editingBusiness) {
      updateMutation.mutate(
        { id: editingBusiness.id, ...payload },
        {
          onSuccess: () => {
            toast.success("Business updated");
            handleCloseModal();
          },
          onError: (error) => {
            toast.error(error.message);
          },
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success("Business created");
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
    {
      key: "name",
      header: "Name",
      render: (row: Business) => row.name,
    },
    {
      key: "description",
      header: "Description",
      render: (row: Business) => row.description,
    },
    {
      key: "categories",
      header: "Categories",
      render: (row: Business) => (
        <div className="flex flex-wrap gap-1">
          {row.categories && row.categories.length > 0 ? (
            row.categories.map((bc) => (
              <span
                key={bc.category.id}
                className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
              >
                {bc.category.name}
              </span>
            ))
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
      ),
    },
    {
      key: "tags",
      header: "Tags",
      render: (row: Business) => (
        <div className="flex flex-wrap gap-1">
          {row.tags && row.tags.length > 0 ? (
            row.tags.map((bt) => (
              <span
                key={bt.tag.id}
                className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {bt.tag.name}
              </span>
            ))
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: Business) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAssignTask(row);
            }}
            className="p-1 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded cursor-pointer"
            title="Assign Task"
          >
            <ClipboardDocumentListIcon className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(row);
            }}
            className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row);
            }}
            className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
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
        <h1 className="text-2xl font-bold mb-4">Businesses</h1>
        <p className="text-gray-600">Loading businesses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Businesses</h1>
        <p className="text-red-600">Error loading businesses: {error.message}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Businesses</h1>
        <Button onClick={handleOpenCreate}>
          <PlusIcon className="w-4 h-4 mr-2" />
          Add Business
        </Button>
      </div>

      <Table<Business> columns={columns} data={businesses || []} />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingBusiness ? "Edit Business" : "Add Business"}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <TextInput
              label="Name"
              {...register("name", { required: "Name is required" })}
              error={errors.name?.message}
            />
            <TextInput
              label="Description"
              {...register("description")}
              error={errors.description?.message}
            />
            <Controller
              name="categories"
              control={control}
              render={({ field }) => (
                <MultiSelect
                  isMulti
                  label="Categories"
                  options={categoryOptions}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select categories..."
                  isLoading={categoriesLoading}
                />
              )}
            />
            <Controller
              name="tags"
              control={control}
              render={({ field }) => (
                <MultiSelect
                  isMulti
                  label="Tags"
                  options={tagOptions}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select tags..."
                  isLoading={tagsLoading}
                />
              )}
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {editingBusiness ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>

      <AssignTaskModal
        isOpen={isTaskModalOpen}
        onClose={handleCloseTaskModal}
        entity={taskAssignEntity}
      />
    </div>
  );
}
