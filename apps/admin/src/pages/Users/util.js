import { formatWords } from "@/utils/formatWord.util";

/**
 * Get prepared role counts as array
 */
export function getRoleCounts( roleCountsObj ) {

    if (!roleCountsObj) return null;

    const roleCounts = Object.entries(roleCountsObj).map(([role, count]) => ({ role, count }));

    // Get total count
    const totalCount = roleCounts.reduce(
        (prevCount, roleCount) => prevCount + Number(roleCount.count),
        0
    );

    // Prepare role count array
    const roleCountArray = roleCounts.map((roleCount) => {
        return {
            key  : roleCount.role,
            name : formatWords(roleCount.role),
            count: roleCount.count,
        };
    });

    // Insert all count in role count array
    roleCountArray.unshift({
        key  : "",
        name : "All",
        count: totalCount,
    });

    return roleCountArray;
}