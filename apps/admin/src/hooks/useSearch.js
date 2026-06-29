import { useQuery } from '@tanstack/react-query';

/**
 * Search hook that search for data on search param changes
 * @param {*} key key of the search 
 * @param {*} search search data
 * @param {*} searchFn callback function for search
 * @returns { isFetching, isError, data, error } return the return value of useQuery hook
 */
export default function useSearch(key, search, searchFn) {
    return useQuery(
        {
            queryKey: [key, { search }],
            queryFn: () => searchFn(search),
            retry: 1,
        }
    );
}