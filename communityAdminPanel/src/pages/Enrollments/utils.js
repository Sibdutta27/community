import { formatWords } from "@/utils/formatWord.util";

/**
 * Get prepared status counts as array
 */
export function getStatusCounts( statusCountsObj ) {

    if (!statusCountsObj) return null;

    const statusCounts = Object.entries(statusCountsObj).map(([status, count]) => ({ status, count }));

    // Get total count
    const totalCount = statusCounts.reduce(
        (prevCount, statusCount) => prevCount + Number(statusCount.count),
        0
    );

    // Prepare status count array
    const statusCountArray = statusCounts.map((statusCount) => {
        return {
            key  : statusCount.status,
            name : formatWords(statusCount.status),
            count: statusCount.count,
        };
    });

    // Insert all count in status count array
    statusCountArray.unshift({
        key  : "",
        name : "All",
        count: totalCount,
    });

    return statusCountArray;
}