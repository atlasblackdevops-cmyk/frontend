"use client";

import { useCallback, useEffect, useState } from "react";
import { getActiveFields } from "@/lib/fields/api";
import type { FieldRecord } from "@/components/fields/types";

export interface SelectOption {
    value: string;
    label: string;
}

interface UseActiveFieldsOptionsResult {
    options: SelectOption[];
    loading: boolean;
    refresh: () => Promise<void>;
}

/**
 * Reusable hook for fetching active fields as select options.
 * Can be used across modules that need a field selector.
 */
export function useActiveFieldsOptions(enabled: boolean = true): UseActiveFieldsOptionsResult {
    const [options, setOptions] = useState<SelectOption[]>([]);
    const [loading, setLoading] = useState(false);

    const load = useCallback(async () => {
        if (!enabled) return;

        setLoading(true);
        try {
            const fields: FieldRecord[] = await getActiveFields();
            setOptions(
                fields.map((field) => ({
                    value: field.id,
                    label: field.fieldName,
                }))
            );
        } catch {
            setOptions([]);
        } finally {
            setLoading(false);
        }
    }, [enabled]);

    useEffect(() => {
        void load();
    }, [load]);

    return { options, loading, refresh: load };
}


