import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

export async function main() {
  console.log("Seeding database...");

  // Create users
  const users = await Promise.all([
    prisma.user.create({
      data: { email: "alice@example.com", name: "Alice Johnson", password: "password123" },
    }),
    prisma.user.create({
      data: { email: "bob@example.com", name: "Bob Smith", password: "password123" },
    }),
    prisma.user.create({
      data: { email: "carol@example.com", name: "Carol Williams", password: "password123" },
    }),
  ]);
  console.log(`Created ${users.length} users`);

  // Create businesses
  const businesses = await Promise.all([
    prisma.business.create({
      data: { name: "Acme Corp", description: "A technology company" },
    }),
    prisma.business.create({
      data: { name: "Tech Solutions", description: "Software development services" },
    }),
    prisma.business.create({
      data: { name: "Green Energy Ltd", description: "Renewable energy solutions" },
    }),
    prisma.business.create({
      data: { name: "Creative Studios", description: "Design and branding agency" },
    }),
  ]);
  console.log(`Created ${businesses.length} businesses`);

  // Create people (associated with businesses)
  const people = await Promise.all([
    prisma.person.create({
      data: {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        businessId: businesses[0].id,
      },
    }),
    prisma.person.create({
      data: {
        firstName: "Jane",
        lastName: "Smith",
        email: "jane.smith@example.com",
        businessId: businesses[1].id,
      },
    }),
    prisma.person.create({
      data: {
        firstName: "Michael",
        lastName: "Brown",
        email: "michael.brown@example.com",
        businessId: businesses[2].id,
      },
    }),
  ]);
  console.log(`Created ${people.length} people`);

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({ data: { name: "Technology" } }),
    prisma.category.create({ data: { name: "Marketing" } }),
    prisma.category.create({ data: { name: "Software" } }),
    prisma.category.create({ data: { name: "Renewable" } }),
    prisma.category.create({ data: { name: "Design" } }),
  ]);
  console.log(`Created ${categories.length} categories`);

  // Create business-category relations
  await Promise.all([
    prisma.businessCategory.create({
      data: { businessId: businesses[0].id, categoryId: categories[0].id },
    }),
    prisma.businessCategory.create({
      data: { businessId: businesses[0].id, categoryId: categories[1].id },
    }),
    prisma.businessCategory.create({
      data: { businessId: businesses[1].id, categoryId: categories[2].id },
    }),
    prisma.businessCategory.create({
      data: { businessId: businesses[2].id, categoryId: categories[3].id },
    }),
    prisma.businessCategory.create({
      data: { businessId: businesses[3].id, categoryId: categories[4].id },
    }),
  ]);
  console.log("Created business-category relations");

  // Create tags
  const tags = await Promise.all([
    prisma.tag.create({ data: { name: "Priority" } }),
    prisma.tag.create({ data: { name: "Urgent" } }),
    prisma.tag.create({ data: { name: "Review" } }),
    prisma.tag.create({ data: { name: "Completed" } }),
  ]);
  console.log(`Created ${tags.length} tags`);

  // Create business-tag relations
  await Promise.all([
    prisma.businessTag.create({
      data: { businessId: businesses[0].id, tagId: tags[0].id },
    }),
    prisma.businessTag.create({
      data: { businessId: businesses[1].id, tagId: tags[1].id },
    }),
    prisma.businessTag.create({
      data: { businessId: businesses[2].id, tagId: tags[2].id },
    }),
    prisma.businessTag.create({
      data: { businessId: businesses[3].id, tagId: tags[3].id },
    }),
  ]);
  console.log("Created business-tag relations");

  // Create person-tag relations
  await Promise.all([
    prisma.personTag.create({
      data: { personId: people[0].id, tagId: tags[0].id },
    }),
    prisma.personTag.create({
      data: { personId: people[1].id, tagId: tags[1].id },
    }),
    prisma.personTag.create({
      data: { personId: people[2].id, tagId: tags[2].id },
    }),
  ]);
  console.log("Created person-tag relations");

  // Create tasks
  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        title: "Review quarterly report",
        description: "Analyze Q4 financial data and prepare summary",
        status: "PENDING",
        dueDate: new Date("2026-03-01"),
        businessId: businesses[0].id,
        personId: people[0].id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Update website",
        description: "Redesign landing page with new branding",
        status: "PENDING",
        dueDate: new Date("2026-02-15"),
        businessId: businesses[1].id,
        personId: people[1].id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Solar panel installation",
        description: "Coordinate installation at new facility",
        status: "PENDING",
        dueDate: new Date("2026-04-01"),
        businessId: businesses[2].id,
        personId: people[2].id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Brand guidelines",
        description: "Create comprehensive brand style guide",
        status: "COMPLETED",
        businessId: businesses[3].id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Client presentation",
        description: "Prepare slides for upcoming investor meeting",
        status: "PENDING",
        dueDate: new Date("2026-02-20"),
        businessId: businesses[0].id,
        personId: people[0].id,
      },
    }),
  ]);
  console.log(`Created ${tasks.length} tasks`);

  console.log("Seeding completed!");
}

main();
