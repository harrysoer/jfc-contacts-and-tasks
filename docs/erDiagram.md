erDiagram
    User {
        Int id PK
        String email UK
        String name
    }

    Person {
        String id PK
        String firstName
        String lastName
        String email UK
        DateTime createdAt
        DateTime updatedAt
        String businessId FK
    }

    Business {
        String id PK
        String name
        String description
        DateTime createdAt
        DateTime updatedAt
    }

    Category {
        String id PK
        String name UK
        DateTime createdAt
    }

    BusinessCategory {
        String businessId PK_FK
        String categoryId PK_FK
    }

    Tag {
        String id PK
        String name UK
        DateTime createdAt
    }

    BusinessTag {
        String businessId PK_FK
        String tagId PK_FK
    }

    PersonTag {
        String personId PK_FK
        String tagId PK_FK
    }

    Task {
        String id PK
        String title
        String description
        TaskStatus status
        DateTime dueDate
        DateTime createdAt
        DateTime updatedAt
        String businessId FK
        String personId FK
    }

    Business ||--o{ Person : "has many"
    Business ||--o{ BusinessCategory : "has many"
    Category ||--o{ BusinessCategory : "has many"
    Business ||--o{ BusinessTag : "has many"
    Tag ||--o{ BusinessTag : "has many"
    Person ||--o{ PersonTag : "has many"
    Tag ||--o{ PersonTag : "has many"
    Business ||--o{ Task : "has many"
    Person ||--o{ Task : "has many"
