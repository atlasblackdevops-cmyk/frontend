import dayjs from "dayjs";
import "dayjs/locale/en";

// Set default locale - this must be done before any date operations
// This ensures locale data (including 'aa' for AM/PM) is available during SSR
// This is critical for server-side rendering where locale data might not be available
try {
    dayjs.locale("en");
    // Verify locale is set correctly
    if (!dayjs.Ls || !dayjs.Ls.en) {
        console.warn("dayjs English locale data not loaded properly");
    }
} catch (error) {
    console.error("Failed to set dayjs locale:", error);
}

export default dayjs;
