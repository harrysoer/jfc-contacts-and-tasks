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
  usePeople,
  useCreatePerson,
  useUpdatePerson,
  useDeletePerson,
  Person,
} from "@/src/lib/api/people";
import { useTags } from "@/src/lib/api/tags";
import { useBusinesses } from "@/src/lib/api/businesses";
import Table from "@/src/components/Table";
import Modal from "@/src/components/Modal";
import TextInput from "@/src/components/TextInput";
import Button from "@/src/components/Button";
import MultiSelect, { SelectOption } from "@/src/components/MultiSelect";
import AssignTaskModal, { AssignableEntity } from "@/src/components/AssignTaskModal";

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  business: SelectOption | null;
  tags: SelectOption[];
};

export default function PeoplePage() {
  const { data: people, isLoading, error } = usePeople();
  const { data: tags, isLoading: tagsLoading } = useTags();
  const { data: businesses, isLoading: businessesLoading } = useBusinesses();
  const createMutation = useCreatePerson();
  const updateMutation = useUpdatePerson();
  const deleteMutation = useDeletePerson();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
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
      firstName: "",
      lastName: "",
      email: "",
      business: null,
      tags: [],
    },
  });

  const tagOptions: SelectOption[] =
    tags?.map((tag) => ({ value: tag.id, label: tag.name })) || [];

  const businessOptions: SelectOption[] =
    businesses?.map((b) => ({ value: b.id, label: b.name })) || [];

  useEffect(() => {
    if (isModalOpen) {
      if (editingPerson) {
        const personTags =
          editingPerson.tags?.map((pt) => ({
            value: pt.tag.id,
            label: pt.tag.name,
          })) || [];
        const personBusiness = editingPerson.business
          ? { value: editingPerson.business.id, label: editingPerson.business.name }
          : null;
        reset({
          firstName: editingPerson.firstName,
          lastName: editingPerson.lastName,
          email: editingPerson.email || "",
          business: personBusiness,
          tags: personTags,
        });
      } else {
        reset({
          firstName: "",
          lastName: "",
          email: "",
          business: null,
          tags: [],
        });
      }
    }
  }, [editingPerson, isModalOpen, reset]);

  const handleOpenCreate = () => {
    setEditingPerson(null);
    setIsModalOpen(true);
  };

  const handleEdit = (person: Person) => {
    setEditingPerson(person);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPerson(null);
  };

  const handleDelete = (person: Person) => {
    if (
      confirm(
        `Are you sure you want to delete ${person.firstName} ${person.lastName}?`
      )
    ) {
      deleteMutation.mutate(person.id, {
        onSuccess: () => {
          toast.success("Person deleted");
        },
        onError: (error) => {
          toast.error(error.message);
        },
      });
    }
  };

  const handleAssignTask = (person: Person) => {
    setTaskAssignEntity({
      type: "person",
      id: person.id,
      name: `${person.firstName} ${person.lastName}`,
    });
    setIsTaskModalOpen(true);
  };

  const handleCloseTaskModal = () => {
    setIsTaskModalOpen(false);
    setTaskAssignEntity(null);
  };

  const onSubmit = (data: FormData) => {
    const payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email || null,
      businessId: data.business?.value || null,
      tagIds: data.tags.map((t) => t.value),
    };

    if (editingPerson) {
      updateMutation.mutate(
        { id: editingPerson.id, ...payload },
        {
          onSuccess: () => {
            toast.success("Person updated");
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
          toast.success("Person created");
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
      render: (row: Person) => `${row.firstName} ${row.lastName}`,
    },
    {
      key: "email",
      header: "Email",
      render: (row: Person) => row.email || "-",
    },
    {
      key: "business",
      header: "Business",
      render: (row: Person) => row.business?.name || "-",
    },
    {
      key: "tags",
      header: "Tags",
      render: (row: Person) => (
        <div className="flex flex-wrap gap-1">
          {row.tags && row.tags.length > 0 ? (
            row.tags.map((pt) => (
              <span
                key={pt.tag.id}
                className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {pt.tag.name}
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
      render: (row: Person) => (
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
        <h1 className="text-2xl font-bold mb-4">People</h1>
        <p className="text-gray-600">Loading people...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">People</h1>
        <p className="text-red-600">Error loading people: {error.message}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">People</h1>
        <Button onClick={handleOpenCreate}>
          <PlusIcon className="w-4 h-4 mr-2" />
          Add Person
        </Button>
      </div>

      <Table<Person> columns={columns} data={people || []} />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingPerson ? "Edit Person" : "Add Person"}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <TextInput
              label="First Name"
              {...register("firstName", { required: "First name is required" })}
              error={errors.firstName?.message}
            />
            <TextInput
              label="Last Name"
              {...register("lastName", { required: "Last name is required" })}
              error={errors.lastName?.message}
            />
            <TextInput
              label="Email"
              type="email"
              {...register("email", {
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Invalid email address",
                },
              })}
              error={errors.email?.message}
            />
            <Controller
              name="business"
              control={control}
              render={({ field }) => (
                <MultiSelect
                  label="Business"
                  options={businessOptions}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select a business..."
                  isLoading={businessesLoading}
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
              {editingPerson ? "Update" : "Create"}
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
