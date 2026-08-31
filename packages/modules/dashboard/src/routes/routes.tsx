import React from "react";
import { Route, type RoutesProps } from "react-router-dom";
import type { ModuleRouteConfig } from "@cap/shared-types";
import { LayoutRouteWrapper } from "@cap/layout";
import { createAuthRoute } from "@cap/module-auth";
import { DashboardPath } from "./path";

const DashboardScreen = React.lazy(() => import("../screens/DashboardScreen"));

export const dashboardRouteConfig: Array<ModuleRouteConfig> = [
  createAuthRoute(DashboardPath.dashboard, <DashboardScreen />, {
    requiresVerification: false,
    layout: "admin",
  }),
];

/**
 * Route component for standalone or sub-router rendering of Dashboard module routes.
 * Wrapped with LayoutRouteWrapper to respect route layout intent.
 */
export const dashboardRoutes: React.FC<RoutesProps> = () => (
  <>
    {dashboardRouteConfig.map((route) => (
      <Route
        key={route.path}
        path={route.path}
        element={
          <LayoutRouteWrapper layout={route.layout || "admin"}>
            {route.element}
          </LayoutRouteWrapper>
        }
      />
    ))}
  </>
);

export const DashboardRoutes = dashboardRoutes;
export default dashboardRoutes;
