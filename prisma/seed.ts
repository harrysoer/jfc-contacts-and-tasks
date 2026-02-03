import { PrismaClient, Prisma } from "../app/generated/prisma/client";
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

const prisma = new PrismaClient({
  adapter,
});

const userData: Prisma.UserCreateInput[] = [
  { email: "alice@example.com", name: "Alice Johnson" },
  { email: "bob@example.com", name: "Bob Smith" },
  { email: "carol@example.com", name: "Carol Williams" },
];

const peopleData: Prisma.PeopleCreateInput[] = [
  { firstName: "John", lastName: "Doe" },
  { firstName: "Jane", lastName: "Smith" },
  { firstName: "Michael", lastName: "Brown" },
];

const businessData: Prisma.BusinessCreateInput[] = [
  { name: "Acme Corp", people: { connect: { id: 1 } } },
  { name: "Tech Solutions", people: { connect: { id: 1 } } },
  { name: "Green Energy Ltd", people: { connect: { id: 2 } } },
  { name: "Creative Studios", people: { connect: { id: 3 } } },
];

const categoryData: Prisma.CategoryCreateInput[] = [
  { name: "Technology", business: { connect: { id: 1 } } },
  { name: "Marketing", business: { connect: { id: 1 } } },
  { name: "Software", business: { connect: { id: 2 } } },
  { name: "Renewable", business: { connect: { id: 3 } } },
  { name: "Design", business: { connect: { id: 4 } } },
];

const tagData: Prisma.TagCreateInput[] = [
  { name: "Priority", people: { connect: { id: 1 } }, business: { connect: { id: 1 } } },
  { name: "Urgent", people: { connect: { id: 1 } }, business: { connect: { id: 2 } } },
  { name: "Review", people: { connect: { id: 2 } }, business: { connect: { id: 3 } } },
  { name: "Completed", people: { connect: { id: 3 } }, business: { connect: { id: 4 } } },
];

const taskData: Prisma.TaskCreateInput[] = [
  {
    title: "Review quarterly report",
    description: "Analyze Q4 financial data and prepare summary",
    people: { connect: { id: 1 } },
    business: { connect: { id: 1 } },
  },
  {
    title: "Update website",
    description: "Redesign landing page with new branding",
    people: { connect: { id: 1 } },
    business: { connect: { id: 2 } },
  },
  {
    title: "Solar panel installation",
    description: "Coordinate installation at new facility",
    people: { connect: { id: 2 } },
    business: { connect: { id: 3 } },
  },
  {
    title: "Brand guidelines",
    description: "Create comprehensive brand style guide",
    people: { connect: { id: 3 } },
    business: { connect: { id: 4 } },
  },
  {
    title: "Client presentation",
    description: "Prepare slides for upcoming investor meeting",
    people: { connect: { id: 1 } },
    business: { connect: { id: 1 } },
  },
];

export async function main() {
  console.log("Seeding database...");

  for (const u of userData) {
    await prisma.user.create({ data: u });
  }
  console.log("Created users");

  for (const p of peopleData) {
    await prisma.people.create({ data: p });
  }
  console.log("Created people");

  for (const b of businessData) {
    await prisma.business.create({ data: b });
  }
  console.log("Created businesses");

  for (const c of categoryData) {
    await prisma.category.create({ data: c });
  }
  console.log("Created categories");

  for (const t of tagData) {
    await prisma.tag.create({ data: t });
  }
  console.log("Created tags");

  for (const t of taskData) {
    await prisma.task.create({ data: t });
  }
  console.log("Created tasks");

  console.log("Seeding completed!");
}

main();
