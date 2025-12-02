# Refactoring Plan for Large Components

## Status: IN PROGRESS

### Files Being Refactored:
1. ✅ `components/livestock/LivestockAnimalsSection.tsx` (3231 lines)
2. ⏳ `components/users/UserManagementPage.tsx` (2238 lines)

---

## Step 1: Livestock Component Refactoring

### ✅ Completed:
- [x] Created `components/livestock/types.ts` - All type definitions
- [x] Created `lib/livestock/utils.ts` - Utility functions

### 🔄 In Progress:
- [ ] Create `lib/livestock/api.ts` - All API calls
- [ ] Extract modal components to `components/livestock/modals/`
- [ ] Extract drawer components to `components/livestock/drawers/`
- [ ] Create custom hooks in `components/livestock/hooks/`
- [ ] Extract sub-components (table, filters, menu)
- [ ] Refactor main component

### 📋 Remaining:
1. API Layer (`lib/livestock/api.ts`)
   - `getAnimals(params)`
   - `getAnimalDetails(id)`
   - `createAnimal(data)`
   - `updateAnimal(id, data)`
   - `deleteAnimal(id)`
   - `getHealthRecords(animalId)`
   - `createHealthRecord(animalId, data)`
   - `updateHealthRecord(animalId, recordId, data)`
   - `getWeightRecords(animalId)`
   - `createWeightRecord(animalId, data)`
   - `updateWeightRecord(animalId, recordId, data)`
   - `getFeedRecords(animalId)`
   - `createFeedRecord(animalId, data)`
   - `updateFeedRecord(animalId, recordId, data)`

2. Modal Components (`components/livestock/modals/`)
   - `AddAnimalModal.tsx`
   - `UpdateAnimalModal.tsx`
   - `HealthRecordModal.tsx`
   - `HealthRecordUpdateModal.tsx`
   - `WeightRecordModal.tsx`
   - `WeightRecordUpdateModal.tsx`
   - `FeedRecordModal.tsx`
   - `FeedRecordUpdateModal.tsx`

3. Drawer Components (`components/livestock/drawers/`)
   - `HealthRecordsDrawer.tsx`
   - `WeightRecordsDrawer.tsx`
   - `FeedRecordsDrawer.tsx`

4. Sub-components (`components/livestock/components/`)
   - `AnimalTable.tsx`
   - `AnimalFilters.tsx`
   - `AnimalActionsMenu.tsx`

5. Custom Hooks (`components/livestock/hooks/`)
   - `useAnimals.ts`
   - `useHealthRecords.ts`
   - `useWeightRecords.ts`
   - `useFeedRecords.ts`

6. Main Component
   - `LivestockAnimalsSection.tsx` - Reduced to ~200-300 lines

---

## Step 2: Users Component Refactoring

### 📋 To Do:
1. Create `components/users/types.ts`
2. Create `lib/users/api.ts`
3. Create `lib/users/utils.ts`
4. Extract drawer components to `components/users/drawers/`
5. Create custom hooks in `components/users/hooks/`
6. Extract sub-components (table, filters, stats, permission matrix)
7. Refactor main component

---

## Final Structure:

```
components/
├── livestock/
│   ├── LivestockAnimalsSection.tsx (main, ~300 lines)
│   ├── types.ts
│   ├── modals/
│   ├── drawers/
│   ├── components/
│   └── hooks/
└── users/
    ├── UserManagementPage.tsx (main, ~300 lines)
    ├── types.ts
    ├── drawers/
    ├── components/
    └── hooks/

lib/
├── livestock/
│   ├── api.ts
│   └── utils.ts
└── users/
    ├── api.ts
    └── utils.ts
```

---

## Notes:
- All functionality will remain exactly the same
- Only code organization will change
- Each extracted component will be self-contained
- Hooks will manage state and business logic
- API layer centralizes all backend calls

