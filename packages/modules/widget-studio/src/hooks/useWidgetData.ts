import { useQuery } from "@tanstack/react-query";
import type { WidgetDefinition } from "@cap/shared-types";
import {
  dataSourceKey,
  describeBindingProblem,
  resolveDataSource,
  type DataSourceResult,
} from "../data/dataSourceRuntime";

/**
 * The data a widget's `dataSource` binding points at.
 *
 * Disabled when there is no binding (most widgets carry their own props) and
 * when the binding is one that cannot resolve - there is no reason to make a
 * request that is already known to fail, and reporting the reason is more
 * useful than reporting a 404.
 */
export function useWidgetData(dsl: WidgetDefinition | undefined) {
  const binding = dsl?.dataSource;
  const problem = describeBindingProblem(binding);

  const query = useQuery<DataSourceResult>({
    queryKey: ["widget-studio", "data", binding ? dataSourceKey(binding) : null],
    queryFn: ({ signal }) => resolveDataSource(binding!, signal),
    enabled: Boolean(binding) && !problem,
    staleTime: 1000 * 30,
    retry: false,
  });

  return {
    ...query,
    /** True when this widget declares a binding at all. */
    hasBinding: Boolean(binding),
    /** Why the binding cannot resolve, before anything was requested. */
    problem,
  };
}
