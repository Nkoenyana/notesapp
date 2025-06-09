import * as React from 'react';
import { Outlet } from 'react-router';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { PageContainer } from '@toolpad/core/PageContainer';

export default function Layout() {
  return (
    <DashboardLayout defaultSidebarCollapsed >
      <PageContainer>
        <Outlet />
      </PageContainer>
    </DashboardLayout>
  );
}
