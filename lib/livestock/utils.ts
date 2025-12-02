export const formatDate = (value: string) => {
    if (!value) return "—";
    try {
        return new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        }).format(new Date(value));
    } catch {
        return value;
    }
};

