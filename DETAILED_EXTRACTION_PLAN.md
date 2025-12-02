# Detailed Extraction Plan - Livestock & Users Components

## Overview
This document outlines the detailed extraction plan for refactoring two large components:
1. `LivestockAnimalsSection.tsx` (3231 lines) → Multiple smaller files
2. `UserManagementPage.tsx` (2238 lines) → Multiple smaller files

---

## PART 1: LIVESTOCK COMPONENT REFACTORING

### Current Structure Analysis

**Current File:** `components/livestock/LivestockAnimalsSection.tsx` (3231 lines)

**Contains:**
- ~50+ type definitions
- 8 modal components
- 3 drawer components (with 3 update modals inside each)
- 1 main component with all business logic
- Multiple helper functions
- All API calls inline
- Form validation logic
- State management

---

### Proposed File Structure

```
components/livestock/
├── LivestockAnimalsSection.tsx          [MAIN - ~250 lines]
│   └── Orchestrates everything, uses hooks
│
├── types.ts                             [DONE ✅]
│   └── All TypeScript types
│
├── modals/
│   ├── AddAnimalModal.tsx               [~150 lines]
│   │   └── Form to add new animal
│   │
│   ├── UpdateAnimalModal.tsx            [~150 lines]
│   │   └── Form to update existing animal
│   │
│   ├── HealthRecordModal.tsx            [~120 lines]
│   │   └── Form to create health record
│   │
│   ├── HealthRecordUpdateModal.tsx      [~130 lines]
│   │   └── Form to update health record
│   │
│   ├── WeightRecordModal.tsx            [~120 lines]
│   │   └── Form to create weight record
│   │
│   ├── WeightRecordUpdateModal.tsx      [~130 lines]
│   │   └── Form to update weight record
│   │
│   ├── FeedRecordModal.tsx              [~120 lines]
│   │   └── Form to create feed record
│   │
│   ├── FeedRecordUpdateModal.tsx        [~130 lines]
│   │   └── Form to update feed record
│   │
│   └── index.ts                         [Barrel export]
│
├── drawers/
│   ├── HealthRecordsDrawer.tsx          [~350 lines]
│   │   └── Listing + Create/Update modals
│   │
│   ├── WeightRecordsDrawer.tsx          [~350 lines]
│   │   └── Listing + Create/Update modals
│   │
│   ├── FeedRecordsDrawer.tsx            [~350 lines]
│   │   └── Listing + Create/Update modals
│   │
│   └── index.ts                         [Barrel export]
│
├── components/
│   ├── AnimalTable.tsx                  [~200 lines]
│   │   └── Table rendering logic
│   │
│   ├── AnimalFilters.tsx                [~150 lines]
│   │   └── Search and filter UI
│   │
│   ├── AnimalActionsMenu.tsx            [~100 lines]
│   │   └── Three-dot menu component
│   │
│   └── index.ts                         [Barrel export]
│
└── hooks/
    ├── useAnimals.ts                    [~300 lines]
    │   └── Fetch, create, update, delete animals
    │   └── Returns: { animals, isLoading, createAnimal, updateAnimal, deleteAnimal, ... }
    │
    ├── useHealthRecords.ts              [~200 lines]
    │   └── Health records operations
    │   └── Returns: { records, isLoading, createRecord, updateRecord, ... }
    │
    ├── useWeightRecords.ts              [~200 lines]
    │   └── Weight records operations
    │   └── Returns: { records, isLoading, createRecord, updateRecord, ... }
    │
    ├── useFeedRecords.ts                [~200 lines]
    │   └── Feed records operations
    │   └── Returns: { records, isLoading, createRecord, updateRecord, ... }
    │
    └── index.ts                         [Barrel export]

lib/livestock/
├── api.ts                               [~400 lines]
│   └── All API endpoint functions
│   └── Functions:
│       - getAnimals(params)
│       - getAnimalDetails(id)
│       - createAnimal(data)
│       - updateAnimal(id, data)
│       - deleteAnimal(id)
│       - getHealthRecords(animalId)
│       - createHealthRecord(animalId, data)
│       - updateHealthRecord(animalId, recordId, data)
│       - getWeightRecords(animalId)
│       - createWeightRecord(animalId, data)
│       - updateWeightRecord(animalId, recordId, data)
│       - getFeedRecords(animalId)
│       - createFeedRecord(animalId, data)
│       - updateFeedRecord(animalId, recordId, data)
│
└── utils.ts                             [DONE ✅]
    └── formatDate()
    └── Other utility functions
```

---

### Detailed Breakdown

#### 1. API Layer (`lib/livestock/api.ts`)

**Purpose:** Centralize all API calls

**Functions to Extract:**

```typescript
// Animal operations
export async function getAnimals(params: {
  page?: number;
  limit?: number;
  search?: string;
  gender?: string;
  birthdateFrom?: string;
  birthdateTo?: string;
}): Promise<AnimalsApiResponse>

export async function getAnimalDetails(id: string): Promise<AnimalDetailsResponse>

export async function createAnimal(data: FormData): Promise<void>

export async function updateAnimal(id: string, data: FormData): Promise<void>

export async function deleteAnimal(id: string): Promise<void>

// Health Records
export async function getHealthRecords(animalId: string): Promise<HealthRecord[]>

export async function createHealthRecord(
  animalId: string, 
  data: { recordType: string; name: string; ... }
): Promise<void>

export async function updateHealthRecord(
  animalId: string, 
  recordId: string, 
  data: { ... }
): Promise<void>

// Weight Records (similar pattern)
// Feed Records (similar pattern)
```

**Dependencies:**
- Uses `api` from `@/lib/api`
- Uses types from `@/components/livestock/types`

---

#### 2. Modal Components (`components/livestock/modals/`)

**AddAnimalModal.tsx:**
- Props: `opened`, `onClose`, `onSubmit`, `isSubmitting`
- Internal state: form, photoPreview
- Form fields: name, species, breed, gender, birthdate, photo
- Validation logic
- File upload handling

**UpdateAnimalModal.tsx:**
- Props: `opened`, `onClose`, `onSubmit`, `isSubmitting`, `animal`
- Pre-fills form with animal data
- Similar structure to AddAnimalModal

**HealthRecordModal.tsx:**
- Props: `opened`, `onClose`, `onSubmit`, `isSubmitting`, `animal`
- Form fields: type, name, cost, nextDueDate, description
- Required: type, name
- Optional: cost, nextDueDate, description

**HealthRecordUpdateModal.tsx:**
- Similar to HealthRecordModal but with pre-filled data

**WeightRecordModal.tsx:**
- Form fields: measuredAt, weight, weightUnit, notes
- Required: measuredAt, weight, weightUnit
- Optional: notes

**FeedRecordModal.tsx:**
- Form fields: quantity, quantityUnit, feedType, notes
- Required: quantity, quantityUnit, feedType
- Optional: notes

---

#### 3. Drawer Components (`components/livestock/drawers/`)

**HealthRecordsDrawer.tsx Structure:**

```typescript
interface Props {
  opened: boolean;
  onClose: () => void;
  animal: AnimalRecord | null;
}

// Internal state:
- records: HealthRecord[]
- isLoading
- createModalOpen
- updateModalOpen
- selectedRecord
- error, successMessage

// Functions:
- fetchRecords() - uses API
- handleCreate() - uses API
- handleUpdate() - uses API

// Renders:
- Drawer with listing table
- HealthRecordModal (for create)
- HealthRecordUpdateModal (for update)
```

**Similar pattern for WeightRecordsDrawer and FeedRecordsDrawer**

---

#### 4. Sub-Components (`components/livestock/components/`)

**AnimalTable.tsx:**
```typescript
interface Props {
  animals: AnimalRecord[];
  isLoading: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  onUpdate: (animal: AnimalRecord) => void;
  onDelete: (animal: AnimalRecord) => void;
  onOpenHealthRecords: (animal: AnimalRecord) => void;
  onOpenWeightRecords: (animal: AnimalRecord) => void;
  onOpenFeedRecords: (animal: AnimalRecord) => void;
}
```

**AnimalFilters.tsx:**
```typescript
interface Props {
  form: UseFormReturnType<FilterValues>;
  onSearch: () => void;
  onClear: () => void;
  isLoading: boolean;
}
```

**AnimalActionsMenu.tsx:**
```typescript
interface Props {
  animal: AnimalRecord;
  onOpenHealthRecords: () => void;
  onOpenWeightRecords: () => void;
  onOpenFeedRecords: () => void;
}
```

---

#### 5. Custom Hooks (`components/livestock/hooks/`)

**useAnimals.ts:**
```typescript
export function useAnimals() {
  // State
  const [animals, setAnimals] = useState<AnimalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>(...);
  const [error, setError] = useState<string | null>(null);
  
  // Functions
  const fetchAnimals = async (page, filters) => { ... }
  const createAnimal = async (data) => { ... }
  const updateAnimal = async (id, data) => { ... }
  const deleteAnimal = async (id) => { ... }
  const fetchAnimalDetails = async (id) => { ... }
  
  return {
    animals,
    isLoading,
    pagination,
    error,
    fetchAnimals,
    createAnimal,
    updateAnimal,
    deleteAnimal,
    fetchAnimalDetails,
  };
}
```

**useHealthRecords.ts:**
```typescript
export function useHealthRecords(animalId: string) {
  // Similar pattern but for health records
  // Returns: records, isLoading, createRecord, updateRecord, fetchRecords
}
```

---

#### 6. Main Component Refactor (`LivestockAnimalsSection.tsx`)

**After Refactoring - Structure:**

```typescript
export default function LivestockAnimalsSection() {
  // Permission checks
  const { permissions, role } = useAuth();
  const canList = hasPermission(...);
  const canCreate = hasPermission(...);
  // ...
  
  // Hooks
  const {
    animals,
    isLoading,
    pagination,
    error,
    fetchAnimals,
    createAnimal,
    updateAnimal,
    deleteAnimal,
  } = useAnimals();
  
  // Filter form
  const filterForm = useForm<FilterValues>({...});
  
  // Modal/Drawer states
  const [modalOpen, setModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [healthRecordDrawerOpen, setHealthRecordDrawerOpen] = useState(false);
  // ...
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalRecord | null>(null);
  const [animalForRecord, setAnimalForRecord] = useState<AnimalRecord | null>(null);
  
  // Handlers
  const handleSearch = () => { ... }
  const handleAddAnimal = async (values) => {
    await createAnimal(values);
    await fetchAnimals(pagination.page);
  }
  // ...
  
  return (
    <Stack>
      {/* Header */}
      {/* Tabs */}
      {/* Error/Success notifications */}
      {/* Filters - AnimalFilters component */}
      {/* Table - AnimalTable component */}
      {/* Pagination */}
      
      {/* Modals */}
      <AddAnimalModal ... />
      <UpdateAnimalModal ... />
      <DeleteConfirmationModal ... />
      
      {/* Drawers */}
      <HealthRecordsDrawer ... />
      <WeightRecordsDrawer ... />
      <FeedRecordsDrawer ... />
    </Stack>
  );
}
```

**Expected size: ~250-300 lines**

---

## PART 2: USERS COMPONENT REFACTORING

### Current Structure Analysis

**Current File:** `components/users/UserManagementPage.tsx` (2238 lines)

**Contains:**
- ~15+ type definitions
- 3 drawer components (UserDrawer, PermissionsDrawer, ExistingUserDrawer)
- Complex permission matrix logic
- User table with filters
- Statistics cards
- Multiple helper functions
- All API calls inline
- Form validation logic
- State management

---

### Proposed File Structure

```
components/users/
├── UserManagementPage.tsx               [MAIN - ~250 lines]
│   └── Orchestrates everything
│
├── types.ts                             [~200 lines]
│   └── All TypeScript types
│
├── drawers/
│   ├── UserDrawer.tsx                   [~400 lines]
│   │   └── Create/Edit user form + permissions
│   │
│   ├── PermissionsDrawer.tsx            [~300 lines]
│   │   └── Permission matrix editor
│   │
│   ├── ExistingUserDrawer.tsx           [~350 lines]
│   │   └── Add existing user to farm
│   │
│   └── index.ts                         [Barrel export]
│
├── components/
│   ├── UserTable.tsx                    [~200 lines]
│   │   └── Table rendering logic
│   │
│   ├── UserFilters.tsx                  [~150 lines]
│   │   └── Search and filter UI
│   │
│   ├── UserStats.tsx                    [~100 lines]
│   │   └── Statistics cards
│   │
│   ├── PermissionMatrix.tsx             [~400 lines]
│   │   └── Permission table component
│   │
│   └── index.ts                         [Barrel export]
│
└── hooks/
    ├── useUsers.ts                      [~300 lines]
    │   └── Fetch, create, update, delete users
    │
    ├── usePermissions.ts                [~200 lines]
    │   └── Permission management logic
    │
    ├── useRoles.ts                      [~150 lines]
    │   └── Fetch roles
    │
    └── index.ts                         [Barrel export]

lib/users/
├── api.ts                               [~350 lines]
│   └── All API endpoint functions
│   └── Functions:
│       - getUsers(params)
│       - createUser(data)
│       - updateUser(id, data)
│       - getExistingUsers(search)
│       - getRoles()
│       - getPermissions()
│       - updateUserPermissions(userId, permissionIds)
│
└── utils.ts                             [~200 lines]
    └── Permission normalization
    └── Permission matrix builders
    └── toTitleCase()
    └── Permission conversion helpers
```

---

### Detailed Breakdown

#### 1. Types File (`components/users/types.ts`)

**Types to Extract:**
- `PermissionMatrix`
- `ModuleDefinition`
- `ManagedUser`
- `ApiUserResponse`
- `ExistingUserResponse`
- `PaginationInfo`
- `AccessRole`
- `PermissionActionDefinition`
- `PermissionModule`
- Form value types

---

#### 2. API Layer (`lib/users/api.ts`)

**Functions:**
```typescript
export async function getUsers(params: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
}): Promise<UsersApiResponse>

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  roleId: string;
  permissionIds: string[];
}): Promise<void>

export async function updateUser(
  id: string, 
  data: { name?: string; email?: string; password?: string; ... }
): Promise<void>

export async function updateUserPermissions(
  userId: string, 
  permissionIds: string[]
): Promise<void>

export async function getExistingUsers(search: string): Promise<ExistingUserResponse[]>

export async function getRoles(): Promise<AccessRole[]>

export async function getPermissions(): Promise<PermissionModule[]>

export async function addExistingUserToFarm(
  userId: string, 
  roleId: string, 
  permissionIds: string[]
): Promise<void>
```

---

#### 3. Utils (`lib/users/utils.ts`)

**Functions:**
```typescript
export function buildEmptyPermissionState(modules: ModuleDefinition[]): PermissionMatrix

export function normalizePermissions(
  modules: ModuleDefinition[], 
  matrix?: PermissionMatrix
): PermissionMatrix

export function toTitleCase(value: string): string

export function convertApiUserToManagedUser(
  apiUser: ApiUserResponse
): ManagedUser

export function convertPermissionsToMatrix(
  permissions: Array<{module: string; action: string}>
): PermissionMatrix

export function getPermissionIds(
  matrix: PermissionMatrix,
  modules: PermissionModule[]
): string[]
```

---

#### 4. Drawer Components

**UserDrawer.tsx:**
- Props: `opened`, `onClose`, `mode: "create" | "edit"`, `user`, `onSubmit`
- Form: name, email, password, role
- Permission matrix (if create mode)
- Handles both create and edit modes

**PermissionsDrawer.tsx:**
- Props: `opened`, `onClose`, `user`, `onSubmit`
- Permission matrix table
- Module/action checkboxes
- Save button

**ExistingUserDrawer.tsx:**
- Props: `opened`, `onClose`, `onSubmit`
- User search autocomplete
- Role selection
- Permission matrix
- Add to farm button

---

#### 5. Sub-Components

**UserTable.tsx:**
- Table with users
- Status toggle
- Actions menu (three dots)
- Update user
- Update permissions

**UserFilters.tsx:**
- Search input
- Role filter
- Status filter
- Search button
- Clear button

**UserStats.tsx:**
- Total users card
- Active users card
- Inactive users card
- Role distribution

**PermissionMatrix.tsx:**
- Props: `modules`, `matrix`, `onToggle`, `disabled?`
- Permission table with checkboxes
- Module-level toggle
- Action-level toggle

---

#### 6. Custom Hooks

**useUsers.ts:**
```typescript
export function useUsers() {
  return {
    users,
    isLoading,
    pagination,
    error,
    fetchUsers,
    createUser,
    updateUser,
    toggleUserStatus,
  };
}
```

**usePermissions.ts:**
```typescript
export function usePermissions() {
  return {
    modules,
    permissions,
    isLoading,
    fetchModules,
    fetchPermissions,
    normalizePermissions,
    getPermissionIds,
    togglePermission,
    toggleModuleAllPermissions,
  };
}
```

**useRoles.ts:**
```typescript
export function useRoles() {
  return {
    roles,
    roleOptions,
    isLoading,
    fetchRoles,
  };
}
```

---

## MIGRATION STRATEGY

### Phase 1: Foundation (Non-Breaking)
1. ✅ Create types files
2. ✅ Create utils files
3. Create API files
4. **Test:** Original files still work (imports added, not removed)

### Phase 2: Extract Components (Non-Breaking)
1. Extract modal components
2. Extract drawer components
3. Extract sub-components
4. **Test:** Original files import new components, still work

### Phase 3: Extract Hooks (Non-Breaking)
1. Create custom hooks
2. Update original files to use hooks
3. **Test:** Functionality unchanged

### Phase 4: Refactor Main Components
1. Update main components to use all extracted pieces
2. Remove duplicate code
3. **Test:** Full functionality test

### Phase 5: Cleanup
1. Remove unused imports
2. Update barrel exports
3. Final testing

---

## DEPENDENCY GRAPH

```
LivestockAnimalsSection.tsx
├── uses → hooks/useAnimals.ts
│   └── uses → lib/livestock/api.ts
├── uses → hooks/useHealthRecords.ts
│   └── uses → lib/livestock/api.ts
├── uses → components/AnimalTable.tsx
├── uses → components/AnimalFilters.tsx
├── uses → components/AnimalActionsMenu.tsx
├── uses → modals/AddAnimalModal.tsx
├── uses → modals/UpdateAnimalModal.tsx
├── uses → drawers/HealthRecordsDrawer.tsx
│   ├── uses → modals/HealthRecordModal.tsx
│   └── uses → modals/HealthRecordUpdateModal.tsx
└── uses → types.ts

UserManagementPage.tsx
├── uses → hooks/useUsers.ts
│   └── uses → lib/users/api.ts
├── uses → hooks/usePermissions.ts
│   └── uses → lib/users/api.ts
│   └── uses → lib/users/utils.ts
├── uses → hooks/useRoles.ts
│   └── uses → lib/users/api.ts
├── uses → components/UserTable.tsx
├── uses → components/UserFilters.tsx
├── uses → components/UserStats.tsx
├── uses → components/PermissionMatrix.tsx
├── uses → drawers/UserDrawer.tsx
├── uses → drawers/PermissionsDrawer.tsx
├── uses → drawers/ExistingUserDrawer.tsx
└── uses → types.ts
```

---

## FILE SIZE ESTIMATES

### Livestock Component
- **Before:** 3231 lines (1 file)
- **After:** ~2500 lines total across 25+ files
  - Main component: ~250 lines
  - Each modal: ~120-150 lines
  - Each drawer: ~350 lines
  - Each hook: ~200-300 lines
  - API layer: ~400 lines
  - Types: ~200 lines
  - Utils: ~50 lines

### Users Component
- **Before:** 2238 lines (1 file)
- **After:** ~2000 lines total across 20+ files
  - Main component: ~250 lines
  - Each drawer: ~300-400 lines
  - Each hook: ~150-300 lines
  - API layer: ~350 lines
  - Types: ~200 lines
  - Utils: ~200 lines

---

## BENEFITS SUMMARY

1. **Maintainability:** Each file has single responsibility
2. **Reusability:** Components and hooks can be reused
3. **Testability:** Smaller units are easier to test
4. **Readability:** Clear file structure, easy to navigate
5. **Collaboration:** Multiple developers can work simultaneously
6. **Scalability:** Easy to add new features

---

## RISKS & MITIGATION

### Risk 1: Breaking Changes
- **Mitigation:** Gradual migration, keep original files working during extraction

### Risk 2: Circular Dependencies
- **Mitigation:** Clear dependency graph, use barrel exports carefully

### Risk 3: Missing Functionality
- **Mitigation:** Comprehensive testing after each phase

### Risk 4: Import Path Issues
- **Mitigation:** Use absolute imports (@/components/...), clear folder structure

---

## REVIEW CHECKLIST

Before proceeding, please review:

- [ ] File structure makes sense
- [ ] Dependencies are clear
- [ ] No circular dependencies
- [ ] Types are properly organized
- [ ] API functions are comprehensive
- [ ] Hook interfaces are well-designed
- [ ] Component props are clear
- [ ] Migration strategy is safe
- [ ] Estimated file sizes are reasonable

---

## NEXT STEPS

Once approved, I will:

1. Create API layer files
2. Extract modals one by one
3. Extract drawers
4. Extract sub-components
5. Create hooks
6. Refactor main components
7. Test functionality
8. Clean up

**Estimated time:** ~30-40 file creations/modifications

---

**Questions or changes needed?** Please review and let me know if you want any adjustments!

